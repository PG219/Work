# AI Agents Services

The Python FastAPI services that power AI features (RAG, chat, risk/control analysis). This README is tailored for beginners running ONLY the `Agents/` folder after cloning it separately.

## 🧰 What you need
- Python 3.9+ (3.10 recommended)
- pip
- Optional: OpenAI API key and Google Cloud service account JSON if you use RAG/GCS features

## ⚙️ Environment variables
Create a `.env` file in `Agents/` with what you plan to use:
```env
# OpenAI (if using embeddings/completions)
OPENAI_API_KEY=sk-...

# Google Cloud (if using GCS/RAG loading)
GOOGLE_APPLICATION_CREDENTIALS=./service.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket-name
```

## 🚀 Run it locally (this folder only)
1) Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```
2) Install dependencies
```bash
pip install -r requirements.txt
```
3) Start the API
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# or
python main.py
```
The service will listen on `http://localhost:8000`.

4) Quick health check
```bash
curl http://localhost:8000/
```

Notes:
- If you set `GOOGLE_APPLICATION_CREDENTIALS`, ensure the `service.json` path is correct.
- Keep the virtual environment active while running the app.

---

The Agents component provides AI-powered services for the Governance Platform, including risk assessment, control management, document analysis, and RAG (Retrieval Augmented Generation) capabilities.

## 🚀 Features

### Core AI Services
- **Risk Assessment Agent**: Automated risk identification and analysis
- **Control Assessment Agent**: Control framework evaluation and scoring
- **Trust Center RAG Service**: Document querying and analysis
- **Chat Agent**: Interactive AI assistant for governance questions
- **Report Agent**: Automated report generation

### Document Processing
- **Multi-format Support**: Excel, PDF, DOCX, and TXT files
- **Google Cloud Storage**: Scalable document storage and retrieval
- **Vector Embeddings**: OpenAI embeddings for semantic search
- **FAISS Indexing**: Fast similarity search and retrieval
- **Chunk Processing**: Intelligent document chunking for optimal retrieval

### RAG Capabilities
- **Document Loading**: Upload and process documents from GCS
- **Semantic Search**: Find relevant document sections
- **Context-aware Responses**: Generate answers based on document content
- **Source Attribution**: Track and cite document sources
- **Confidence Scoring**: Provide confidence levels for responses

## 🏗️ Architecture

### Technology Stack
- **Framework**: FastAPI (Python web framework)
- **AI/ML**: OpenAI GPT models and embeddings
- **Vector Database**: FAISS for similarity search
- **Cloud Storage**: Google Cloud Storage
- **Document Processing**: PyPDF2, python-docx, openpyxl
- **Async Processing**: asyncio for concurrent operations

### Project Structure
```
Agents/
├── agents/                    # Individual AI agents
│   ├── chat_agent.py         # Interactive chat agent
│   ├── bot2.py              # Streamlit RAG interface
│   ├── rag_service.py       # FastAPI RAG service
│   ├── risk_control_agent.py # Risk assessment agent
│   ├── control_assessment.py # Control evaluation
│   ├── report_agent.py      # Report generation
│   └── utils.py             # Shared utilities
├── main.py                   # FastAPI application entry
├── requirements.txt          # Python dependencies
├── service.json             # Google Cloud credentials
└── test_rag_integration.py  # Integration tests
```

## 📚 API Documentation

### RAG Service Endpoints

#### `POST /agent/rag/load-document`
Load a document from Google Cloud Storage for RAG processing.

**Request Body:**
```json
{
  "bucket_name": "governance-bucket",
  "blob_name": "documents/risk-assessment.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document loaded successfully",
  "data": {
    "filename": "risk-assessment.pdf",
    "chunks": 45,
    "status": "ready"
  }
}
```

#### `POST /agent/rag/query`
Query loaded documents using RAG.

**Request Body:**
```json
{
  "query": "What are the main security risks?",
  "max_results": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Query processed successfully",
  "data": {
    "answer": "Based on the document, the main security risks include...",
    "sources": [
      {
        "content": "Security risk content...",
        "filename": "risk-assessment.pdf",
        "page": 1,
        "confidence": 0.85
      }
    ],
    "confidence": 0.82
  }
}
```

#### `GET /agent/rag/status`
Check the status of the RAG service.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "documents_loaded": 3,
    "total_chunks": 150,
    "last_updated": "2024-01-01T00:00:00Z"
  }
}
```

#### `POST /agent/rag/clear`
Clear all loaded documents.

**Response:**
```json
{
  "success": true,
  "message": "All documents cleared successfully"
}
```

### Chat Agent Endpoints

#### `POST /agent/chat`
Chat with the AI agent.

**Request Body:**
```json
{
  "message": "What is risk management?",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Risk management is the process of identifying, assessing, and controlling risks...",
    "session_id": "session-123",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## 🔧 Development

### Running in Development Mode

```bash
# Activate virtual environment
source venv/bin/activate

# Start FastAPI server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use the main.py script
python main.py
```

### Testing

```bash
# Run integration tests
python test_rag_integration.py

# Test specific endpoints
curl -X POST "http://localhost:8000/agent/rag/status"
```

### Adding New Agents

1. **Create agent file** in `agents/` directory
2. **Implement required methods**:
   ```python
   from fastapi import APIRouter
   
   router = APIRouter()
   
   @router.post("/endpoint")
   async def agent_endpoint(request: RequestModel):
       # Agent logic here
       return {"success": True, "data": result}
   ```

3. **Register router** in `main.py`:
   ```python
   from agents.your_agent import router as your_router
   app.include_router(your_router, prefix="/agent/your-agent")
   ```

## 📊 Document Processing

### Supported File Types

#### PDF Files
- **Library**: PyPDF2
- **Processing**: Text extraction and chunking
- **Metadata**: Page numbers, file size, creation date

#### Excel Files
- **Library**: openpyxl
- **Processing**: Sheet parsing and data extraction
- **Metadata**: Sheet names, cell ranges, data types

#### Word Documents
- **Library**: python-docx
- **Processing**: Paragraph and table extraction
- **Metadata**: Document properties, formatting

#### Text Files
- **Processing**: Direct text processing
- **Encoding**: UTF-8 with fallback detection
- **Metadata**: File size, line count

### Chunking Strategy

```python
def chunk_text(text, chunk_size=1000, overlap=200):
    """
    Split text into overlapping chunks for optimal retrieval.
    
    Args:
        text: Input text to chunk
        chunk_size: Maximum chunk size in characters
        overlap: Overlap between chunks in characters
    
    Returns:
        List of text chunks
    """
```

### Vector Embeddings

```python
def embed_texts(texts, model="text-embedding-ada-002"):
    """
    Generate embeddings for text chunks using OpenAI.
    
    Args:
        texts: List of text chunks
        model: OpenAI embedding model
    
    Returns:
        Numpy array of embeddings
    """
```

## 🔍 RAG Implementation

### Document Loading Process

1. **Download from GCS**: Retrieve document from Google Cloud Storage
2. **Parse Content**: Extract text based on file type
3. **Chunk Text**: Split into manageable chunks with overlap
4. **Generate Embeddings**: Create vector representations
5. **Build FAISS Index**: Create searchable index
6. **Store Metadata**: Save document and chunk information

### Query Processing

1. **Generate Query Embedding**: Convert query to vector
2. **Search Index**: Find similar chunks using FAISS
3. **Retrieve Context**: Get relevant document sections
4. **Generate Answer**: Use GPT to create response
5. **Return Sources**: Provide source attribution

### Performance Optimization

- **Async Processing**: Concurrent document processing
- **Caching**: Embedding and index caching
- **Batch Operations**: Process multiple documents together
- **Memory Management**: Efficient memory usage for large documents

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Configuration

```bash
# Set production environment variables
export OPENAI_API_KEY=your-production-key
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service.json
export ENVIRONMENT=production

# Start with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Scaling Considerations

- **Horizontal Scaling**: Multiple worker processes
- **Load Balancing**: Distribute requests across instances
- **Caching**: Redis for embedding and index caching
- **Database**: Persistent storage for document metadata

## 🔒 Security

### API Security
- **Authentication**: JWT token validation
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Request parameter validation
- **Error Handling**: Secure error responses

### Data Security
- **Encryption**: Encrypt sensitive data
- **Access Control**: GCS bucket permissions
- **Audit Logging**: Track all operations
- **Data Retention**: Automatic cleanup policies

## 📈 Monitoring

### Health Checks
- **Service Status**: API endpoint health
- **Database Connectivity**: GCS connection status
- **Model Availability**: OpenAI API status
- **Performance Metrics**: Response times and throughput

### Logging
- **Request Logging**: All API requests
- **Error Logging**: Detailed error information
- **Performance Logging**: Response time tracking
- **Audit Logging**: User actions and data access

## 🆘 Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key validity
   - Verify rate limits
   - Check network connectivity

2. **GCS Connection Issues**
   - Verify service account key
   - Check bucket permissions
   - Verify project ID

3. **Memory Issues**
   - Monitor memory usage
   - Implement chunking limits
   - Use streaming for large files

4. **Performance Issues**
   - Check FAISS index size
   - Monitor embedding generation time
   - Optimize chunk sizes

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📊 Performance Metrics

### Key Metrics
- **Response Time**: Average API response time
- **Throughput**: Requests per second
- **Memory Usage**: Peak memory consumption
- **Error Rate**: Percentage of failed requests

### Optimization Tips
- Use appropriate chunk sizes
- Implement caching strategies
- Optimize FAISS index parameters
- Monitor and tune performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

### Code Style
- Follow PEP 8 guidelines
- Use type hints
- Write docstrings
- Add unit tests

## 📄 License

This project is licensed under the MIT License.
