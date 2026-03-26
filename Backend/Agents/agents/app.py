# agents/app.py
import os
import io
import json
from pathlib import Path
from typing import List, Optional
import asyncio

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google.cloud import storage

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_qdrant import QdrantVectorStore as QdrantVS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI

# ------------------ CONFIG ------------------
load_dotenv()

# --- Authentication & Models ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

GEMINI_CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL") or "gemini-2.5-flash"
GEMINI_EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL") or "models/text-embedding-004"

# --- GCS & Vector Store ---
GCS_BUCKET = os.getenv("GCS_BUCKET")
GCS_PREFIX = os.getenv("GCS_PREFIX", "")
RAG_COLLECTION = os.getenv("RAG_COLLECTION") or "rag_api"
RAG_TOP_K = int(os.getenv("RAG_TOP_K") or "4")
QDRANT_PATH = os.getenv("QDRANT_PATH") or "./qdrant_data_api"
MANIFEST_PATH = Path(QDRANT_PATH) / ".gcs_manifest.json"

# ------------------ ROUTER SETUP & STATE ------------------
router = APIRouter()
rag_state = {}

# ------------------ Pydantic Models for API I/O ------------------
class QueryRequest(BaseModel):
    question: str
    mode: str = Field("hybrid", pattern="^(hybrid|rag|general)$")

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]
    contexts: List[str]

class SyncResponse(BaseModel):
    message: str
    files_indexed: int
    chunks_added: int

class StatusResponse(BaseModel):
    indexed_file_count: int

# ------------------ CORE LOGIC (Functions are the same as before) ------------------
RAG_PROMPT = ChatPromptTemplate.from_template(
    "You are a concise, accurate assistant. Use ONLY the provided context. "
    "If the answer isn't in the context, say you don't know.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}"
)

def _read_text_from_bytes(data: bytes, blob_name: str) -> Optional[str]:
    # (This function is identical to the one in the previous version)
    try:
        if blob_name.endswith((".txt", ".md", ".json", ".py", ".yaml", ".yml", ".csv")):
            return data.decode("utf-8", errors="ignore")
        if blob_name.endswith(".pdf"):
            import pypdf
            with io.BytesIO(data) as f:
                r = pypdf.PdfReader(f)
                return "\n\n".join((pg.extract_text() or "") for pg in r.pages)
        if blob_name.endswith(".docx"):
            import docx2txt
            with io.BytesIO(data) as f:
                return docx2txt.process(f)
        return None
    except Exception as e:
        print(f"Error parsing {blob_name}: {e}")
        return None

def _split_docs(text: str, source: str) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    return [Document(page_content=c, metadata={"source": source}) for c in splitter.split_text(text)]

def _looks_unhelpful(s: str) -> bool:
    s_lower = (s or "").strip().lower()
    return (len(s_lower) < 40) or ("don't know" in s_lower) or ("cannot" in s_lower and "answer" in s_lower)

def list_gcs_blobs_with_metadata(bucket_name, prefix) -> dict:
    try:
        storage_client = storage.Client()
        blobs = storage_client.list_blobs(bucket_name, prefix=prefix)
        return {blob.name: blob.etag for blob in blobs if not blob.name.endswith("/")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list GCS bucket: {e}")

def download_gcs_blob_to_bytes(bucket_name, blob_name) -> Optional[bytes]:
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        return blob.download_as_bytes()
    except Exception:
        return None

def _manifest_load():
    if not MANIFEST_PATH or not MANIFEST_PATH.exists():
        rag_state["blob_etags"] = {}
        return
    try:
        rag_state["blob_etags"] = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except Exception:
        rag_state["blob_etags"] = {}

def _manifest_save():
    try:
        MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
        with MANIFEST_PATH.open("w", encoding="utf-8") as f:
            json.dump(rag_state.get("blob_etags", {}), f, indent=2)
    except Exception:
        pass

def sync_gcs_bucket_incremental() -> dict:
    if not GCS_BUCKET:
        raise HTTPException(status_code=400, detail="GCS_BUCKET is not configured.")
    
    _manifest_load()
    qclient = rag_state["qclient"]
    vectorstore = rag_state["vectorstore"]
    
    try:
        collection_empty = qclient.count(RAG_COLLECTION, exact=True).count == 0
    except Exception:
        collection_empty = True

    all_blobs = list_gcs_blobs_with_metadata(GCS_BUCKET, GCS_PREFIX)
    changed_blobs = []
    for blob_name, etag in all_blobs.items():
        if collection_empty or rag_state["blob_etags"].get(blob_name) != etag:
            changed_blobs.append((blob_name, etag))

    if not changed_blobs:
        return {"files_indexed": 0, "chunks_added": 0}

    docs_to_add: List[Document] = []
    files_indexed = 0
    for blob_name, etag in changed_blobs:
        data = download_gcs_blob_to_bytes(GCS_BUCKET, blob_name)
        if not data: continue
        text = _read_text_from_bytes(data, blob_name)
        if text and text.strip():
            source_uri = f"gs://{GCS_BUCKET}/{blob_name}"
            docs_to_add.extend(_split_docs(text, source_uri))
            rag_state["blob_etags"][blob_name] = etag
            files_indexed += 1

    if docs_to_add:
        vectorstore.add_documents(docs_to_add)
    
    _manifest_save()
    return {"files_indexed": files_indexed, "chunks_added": len(docs_to_add)}

# ------------------ SERVICE INITIALIZATION ------------------
def initialize_rag_service():
    """Function to be called on application startup."""
    print("Initializing RAG service components...")
    
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        asyncio.set_event_loop(asyncio.new_event_loop())
        
    if not GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY is not set.")
    
    embeddings = GoogleGenerativeAIEmbeddings(model=GEMINI_EMBED_MODEL)
    llm = ChatGoogleGenerativeAI(model=GEMINI_CHAT_MODEL, temperature=0.2)
    
    Path(QDRANT_PATH).mkdir(parents=True, exist_ok=True)
    qclient = QdrantClient(path=QDRANT_PATH)
    
    try:
        qclient.get_collection(RAG_COLLECTION)
    except Exception:
        dims = len(embeddings.embed_query("probe"))
        qclient.recreate_collection(
            collection_name=RAG_COLLECTION,
            vectors_config=VectorParams(size=dims, distance=Distance.COSINE),
        )

    vectorstore = QdrantVS(client=qclient, collection_name=RAG_COLLECTION, embedding=embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": RAG_TOP_K})

    rag_state.update({
        "qclient": qclient, "retriever": retriever, "llm": llm,
        "vectorstore": vectorstore, "blob_etags": {}
    })
    
    print("Performing initial sync with GCS...")
    sync_gcs_bucket_incremental()
    print(f"RAG service ready. Indexed {len(rag_state['blob_etags'])} files.")

# ------------------ API ENDPOINTS ------------------
# agents/app.py (or rag_service.py)

@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    retriever, llm = rag_state.get("retriever"), rag_state.get("llm")
    if not retriever or not llm:
        raise HTTPException(status_code=503, detail="RAG service is not ready.")

    use_rag = request.mode in ("rag", "hybrid")
    use_general = request.mode in ("general", "hybrid")
    
    docs = []
    if use_rag:
        docs = retriever.invoke(request.question)

    if not docs and use_rag:
        if use_general:
            msgs = [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": request.question}]
            res = llm.invoke(msgs)
            # CORRECTED: Added contexts=[]
            return QueryResponse(answer=res.content, sources=[], contexts=[]) 
        else:
            answer = "I couldn't find any relevant information in the documents to answer your question."
            # CORRECTED: Added contexts=[]
            return QueryResponse(answer=answer, sources=[], contexts=[])

    context = "\n\n".join([d.page_content for d in docs])
    
    if request.mode == "general":
        msgs = [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": request.question}]
        res = llm.invoke(msgs)
        # CORRECTED: Added contexts=[]
        return QueryResponse(answer=res.content, sources=[], contexts=[])

    msgs = RAG_PROMPT.format_messages(history="", context=context, question=request.question)
    res = llm.invoke(msgs)
    answer = res.content
    
    if _looks_unhelpful(answer) and use_general:
        msgs = [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": request.question}]
        res = llm.invoke(msgs)
        # CORRECTED: Added contexts=[]
        return QueryResponse(answer=res.content, sources=[], contexts=[])
    
    sources = list(set([d.metadata.get("source", "unknown") for d in docs]))
    context_list = [d.page_content for d in docs]
    # This was the only return statement that was already correct
    return QueryResponse(answer=answer, sources=sources, contexts=context_list)

@router.post("/sync-gcs", response_model=SyncResponse)
async def sync_gcs():
    try:
        stats = sync_gcs_bucket_incremental()
        return SyncResponse(
            message="Sync with GCS complete.",
            files_indexed=stats.get("files_indexed", 0),
            chunks_added=stats.get("chunks_added", 0),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@router.get("/status", response_model=StatusResponse)
async def get_status():
    return StatusResponse(indexed_file_count=len(rag_state.get("blob_etags", {})))

@router.post("/reset", status_code=200)
async def reset_index():
    qclient, vectorstore = rag_state.get("qclient"), rag_state.get("vectorstore")
    if not qclient or not vectorstore:
        raise HTTPException(status_code=503, detail="RAG service is not ready.")
        
    rag_state["blob_etags"] = {}
    _manifest_save()
    qclient.recreate_collection(RAG_COLLECTION, vectors_config=vectorstore.vectors_config)
    return {"message": "Index and manifest have been reset successfully."}