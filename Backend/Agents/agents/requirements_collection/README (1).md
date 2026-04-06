# Multi-Channel Security Requirements Collection

## Files to copy

### Backend → `Backend/Agents/agents/requirements_collection/`
```
__init__.py
schemas.py              # Pydantic models
requirement_engine.py   # Deterministic categorisation + framework mapping
chat_channel.py         # Channel 1: Gemini conversational agent
document_channel.py     # Channel 2: PDF / DOCX / XLSX / MD parser
jira_channel.py         # Channel 3: JIRA REST API
confluence_channel.py   # Channel 4: Confluence REST API
router.py               # Mounts all channels + MongoDB save/query
storage.py              # MongoDB persistence
```

### Frontend → `Frontend/src/pages/`
```
SecurityRequirementsPage.jsx
```

---

## 1. Register the router in `main.py`

```python
# In Backend/Agents/main.py — add after existing _safe_include calls:
_safe_include(
    lambda: __import__("agents.requirements_collection.router", fromlist=["router"]).router,
    "/agent/requirements",
    "requirements_collection"
)
```

---

## 2. Add the frontend route

In your React router (e.g. `App.jsx`):

```jsx
import SecurityRequirementsPage from "./pages/SecurityRequirementsPage";

// Inside your <Routes>:
<Route path="/requirements" element={<SecurityRequirementsPage />} />
```

Add a nav link wherever your other pages are listed:
```jsx
<NavLink to="/requirements">🔐 Security Requirements</NavLink>
```

---

## 3. Environment variables

No new variables needed — the system reuses:
- `GOOGLE_API_KEY`             → Gemini (already set)
- `GEMINI_CHAT_MODEL`          → defaults to `gemini-2.5-flash`
- `MONGODB_URI`                → already set
- `MONGODB_DB`                 → defaults to `AI-Governance`

For the frontend:
- `VITE_AGENT_URL`             → already set (points to FastAPI on port 8000)

---

## 4. New Python dependencies

```txt
httpx>=0.27.0      # for JIRA + Confluence HTTP calls
pypdf>=4.0.0       # for PDF parsing
docx2txt>=0.8      # for DOCX parsing
```

These join the existing `requirements.txt`. `pandas` and `openpyxl` are already in there.

---

## 5. New MongoDB collection

The system creates `SecurityRequirements` automatically (matches naming convention like `Users`, `Risks`, `ControlAssessments`).

Indexes created automatically:
- `id` (unique)
- `project_id`, `session_id`, `status`, `category`, `source.type`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/agent/requirements/chat` | Chat with Gemini agent |
| GET  | `/agent/requirements/chat/{sid}/requirements` | Get requirements from session |
| POST | `/agent/requirements/document` | Upload and parse file |
| POST | `/agent/requirements/jira` | Import from JIRA |
| POST | `/agent/requirements/confluence` | Import from Confluence |
| POST | `/agent/requirements/save` | Save to MongoDB |
| GET  | `/agent/requirements/` | Query from MongoDB |
| PATCH| `/agent/requirements/{id}/status` | Update status |
| GET  | `/agent/requirements/health` | Health check |
