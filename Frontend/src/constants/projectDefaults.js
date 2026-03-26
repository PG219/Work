// Default project IDs and configurations
export const DEFAULT_PROJECT_ID = '507f1f77bcf86cd799439011'; // Same as used in backend tests

// Project types
export const PROJECT_TYPES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  AI_SYSTEM: 'ai-system',
  TEMPORARY: 'temporary'
};

// Default project configuration
export const DEFAULT_PROJECT_CONFIG = {
  id: DEFAULT_PROJECT_ID,
  name: 'Default Frontend Project',
  type: PROJECT_TYPES.FRONTEND,
  description: 'Default project for frontend questionnaire submissions'
}; 