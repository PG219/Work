import axios from 'axios';
import { getBackendUrl } from '@/config/env';

// Create a reusable Axios instance with a base URL
const apiClient = axios.create({
  baseURL: getBackendUrl(""),
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptors ---

// Request interceptor to automatically add the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors (401 and 429)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    // Handle Rate Limit Exceeded (429)
    if (status === 429) {
      const retryAfterHeader = error.response?.headers?.['retry-after'];
      let resetTimeSeconds;
      
      if (responseData && typeof responseData.reset_in_seconds === 'number') {
        resetTimeSeconds = responseData.reset_in_seconds;
      } else {
        // Fallback to Retry-After header or default to 60 seconds
        resetTimeSeconds = parseInt(retryAfterHeader || '60', 10);
      }

      // Dispatch event for the Snackbar component to catch
      window.dispatchEvent(
        new CustomEvent('rateLimitExceeded', {
          detail: { 
            resetTimeSeconds,
            message: responseData?.message || 'You have exceeded your request limit.' 
          },
        })
      );
    }

    // Handle Unauthorized (401)
    if (status === 401) {
      // Token expired or invalid, clear storage and reload
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    
    return Promise.reject(error);
  }
);

// --- Service Functions ---

/**
 * Fetches all projects from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of projects.
 */
export const getProjects = async () => {
  try {
    // Interceptor adds the token
    const response = await apiClient.get('/projects');
    return response.data;
  } catch (error) {
    // Interceptors handle 401/429
    console.error('Error fetching projects:', error);
    throw error;
  }
};

/**
 * Fetches the details for a single project by its ID.
 * @param {string} projectId The ID of the project to fetch.
 * @returns {Promise<Object>} A promise that resolves to the project object.
 */
export const getProjectDetails = async (projectId) => {
  try {
    // Interceptor adds the token
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    // Interceptors handle 401/429
    console.error(`Error fetching details for project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Updates the status of a project.
 * @param {string} projectId The ID of the project to update.
 * @param {string} newStatus The new status to set.
 * @returns {Promise<Object>} A promise that resolves to the updated project.
 */
export const updateProjectStatus = async (projectId, newStatus) => {
  try {
    // Interceptor adds the token
    const response = await apiClient.patch(
      `/projects/${projectId}/status`,
      { status: newStatus }
    );
    return response.data;
  } catch (error) {
    // Interceptors handle 401/429
    console.error(`Error updating status for project ${projectId}:`, error);
    throw error;
  }
};
