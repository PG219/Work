# Environment Configuration

This document explains how to set up and use environment variables in the AI Governance frontend application.

## Environment Files

The application uses the following environment files:

- `.env` - Base environment variables (shared across all environments)
- `.env.development` - Development-specific variables
- `.env.production` - Production-specific variables

## Backend URL Configuration

The application uses two different URLs for different services:

### Backend Server URL
- **Purpose**: Express.js backend (auth, templates, risk matrix, questionnaires)
- **Environment Variable**: `VITE_BACKEND_URL`
- **Default**: `http://localhost:3001`

### Agent URL
- **Purpose**: AI agent functionality (chat, automated assessments)
- **Environment Variable**: `VITE_AGENT_URL`
- **Default**: `http://localhost:8000`

### Default Configuration

```bash
# .env
VITE_BACKEND_URL=http://localhost:3001
VITE_AGENT_URL=http://localhost:8000
VITE_APP_NAME=AI Governance
VITE_APP_VERSION=1.0.0
```

### Development Environment

```bash
# .env.development
VITE_BACKEND_URL=http://localhost:3001
VITE_AGENT_URL=http://localhost:8000
VITE_APP_NAME=AI Governance (Dev)
```

### Production Environment

```bash
# .env.production
VITE_BACKEND_URL=https://your-production-backend-url.com
VITE_AGENT_URL=https://your-production-agent-url.com
VITE_APP_NAME=AI Governance
```

## Usage in Components

### Import the configuration

```javascript
import { BACKEND_URL, AGENT_URL, getBackendUrl, getAgentUrl } from '@/config/env';
```

### Access URLs

```javascript
// Direct access to URLs
const backendUrl = BACKEND_URL; // http://localhost:3001
const agentUrl = AGENT_URL; // http://localhost:8000

// Get full API URL for specific endpoint
const backendApiUrl = getBackendUrl('/templates'); // http://localhost:3001/templates
const agentApiUrl = getAgentUrl('/agent/start-assessment'); // http://localhost:8000/agent/start-assessment
```

### Example API calls

```javascript
import { getBackendUrl, getAgentUrl } from '@/config/env';
import axios from 'axios';

// Backend server API call
const fetchTemplates = async () => {
  try {
    const response = await axios.get(getBackendUrl('/templates'));
    return response.data;
  } catch (error) {
    console.error('Error fetching templates:', error);
  }
};

// Agent API call
const startAgentAssessment = async (data) => {
  try {
    const response = await axios.post(getAgentUrl('/agent/start-assessment'), data);
    return response.data;
  } catch (error) {
    console.error('Error starting agent assessment:', error);
  }
};
```

## Service Usage

### Backend Services (use `getBackendUrl`)
- **templateService.js** - Template management
- **questionnaireService.js** - Questionnaire processing
- **riskMatrixService.js** - Risk matrix results
- **authService.js** - Authentication

### Agent Services (use `getAgentUrl`)
- **agentService.js** - AI agent functionality

## Environment Variables

### Available Variables

- `VITE_BACKEND_URL` - Backend server URL (default: http://localhost:3001)
- `VITE_AGENT_URL` - Agent API URL (default: http://localhost:8000)
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

### Adding New Variables

1. Add the variable to the appropriate `.env` file:
   ```bash
   VITE_NEW_VARIABLE=value
   ```

2. Update the config in `src/config/env.js`:
   ```javascript
   export const config = {
     // ... existing config
     NEW_VARIABLE: import.meta.env.VITE_NEW_VARIABLE || 'default_value',
   };
   ```

3. Export the variable for convenience:
   ```javascript
   export const NEW_VARIABLE = config.NEW_VARIABLE;
   ```

## Development vs Production

The application automatically detects the environment:

- **Development**: Uses `.env.development` variables
- **Production**: Uses `.env.production` variables
- **Base**: `.env` variables are always loaded

## Running the Application

```bash
# Development
npm run dev

# Production build
npm run build

# Development build
npm run build:dev
```

## Security Notes

- Environment variables prefixed with `VITE_` are exposed to the client
- Never include sensitive information (API keys, passwords) in client-side environment variables
- Use server-side environment variables for sensitive data

## Troubleshooting

1. **Environment variables not loading**: Restart the development server
2. **Wrong backend URL**: Check the appropriate `.env` file for your environment
3. **Build issues**: Ensure all environment variables are properly defined in production builds 