# Security Requirements Collection

This module adds a multi-channel security requirements workflow to the app.
It supports:

- chat-based requirement discovery
- document upload and extraction
- Jira import
- Confluence import
- review and approval before save

## Files

Backend:

```text
Backend/Agents/agents/requirements_collection/
  chat_channel.py
  confluence_channel.py
  document_channel.py
  jira_channel.py
  requirement_engine.py
  router.py
  runtime.py
  schemas.py
  storage.py
```

Frontend:

```text
Frontend/src/pages/SecurityRequirementsPage.jsx
```

## Routes

- `POST /agent/requirements/chat`
- `GET /agent/requirements/chat/{session_id}/requirements`
- `POST /agent/requirements/document`
- `POST /agent/requirements/jira`
- `POST /agent/requirements/confluence`
- `POST /agent/requirements/credentials/{provider}`
- `POST /agent/requirements/save`
- `GET /agent/requirements/`
- `PATCH /agent/requirements/{id}/status`
- `GET /agent/requirements/health`

## Frontend route

The page is mounted at:

- `/requirements`

## Required environment variables

Minimum for local chat demo:

```env
GOOGLE_API_KEY=your_gemini_key
GEMINI_CHAT_MODEL=gemini-2.5-flash
REQUIREMENTS_DEMO_MODE=true
```

Optional but recommended:

```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_uri
MONGODB_DB=AI-Governance
REQUIREMENTS_SECRET_KEY=your_fernet_key
```

## Demo mode

If `REQUIREMENTS_DEMO_MODE=true`, the requirements endpoints allow requests without a bearer token.

This is intended only for local demo use.

## Current behavior

- chat works with only Gemini configured
- if MongoDB is not configured, chat sessions fall back to in-memory storage
- document and Confluence extraction apply structural validation and grounding checks
- only `Approved` requirements are saved from the UI
- the requirements list behaves like a single-open accordion

## Demo flow

1. Start the Python agent:

```powershell
cd Backend\Agents
.\venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. Start the frontend:

```powershell
cd Frontend
npm run dev
```

3. Open:

```text
http://localhost:5173/requirements
```

4. Paste a demo statement such as:

```text
We are building a cloud-based fintech platform for small businesses. The application stores customer PII, bank account details, invoices, and payment history. It has admin users, internal support staff, and external customers. The platform exposes REST APIs, integrates with third-party payment providers, sends email notifications, and will be deployed on AWS. We need PCI DSS alignment, strong authentication for admins, audit logging, encryption of sensitive data in transit and at rest, secure session management, role-based access control, and monitoring for suspicious activity.
```

## Notes

- Jira and Confluence imports use stored credential references, not raw credentials on import requests.
- The frontend auth guards were relaxed for local demo flow.
- This module is mounted from `Backend/Agents/main.py`.
