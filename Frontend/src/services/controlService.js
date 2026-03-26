import axios from 'axios';
import { getBackendUrl } from '@/config/env';

// Axios instance with baseURL and JSON headers
const api = axios.create({
  baseURL: getBackendUrl('/controls'),
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 and 429 globally on responses (Robust Interceptor)
api.interceptors.response.use(
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

class ControlAssessmentService {
  /**
   * Store multiple controls after an agent response.
   */
  async storeControls(data) {
    try {
      const response = await api.post('/', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to store controls');
    }
  }

  /**
   * Get all control assessments with pagination.
   */
  async getAllControls(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch control assessments');
    }
  }

  /**
   * UPDATED: Get controls by system type with optional filters.
   * @param {string} type - 'AI' or 'Cybersecurity'.
   * @param {Object} params - Optional: { page, limit, status, projectId }.
   */
  async getControlsBySystemType(type, params = {}) {
    try {
      if (!type) {
        throw new Error("System type ('AI' or 'Cybersecurity') is required.");
      }
      // Pass all params, including the new projectId and status filters
      const queryParams = new URLSearchParams({ type, ...params });

      const response = await api.get(`/type?${queryParams.toString()}`);
      return response.data;
    } catch (error)      {
      throw new Error(error.response?.data?.error || 'Failed to fetch controls by system type');
    }
  }
  
  /**
   * NEW: Fetches controls and derives a unique list of associated projects.
   * This is used to populate the project filter dropdown on the frontend.
   * @param {string} type - 'AI' or 'Cybersecurity'.
   * @returns {Promise<Array<{projectId: string, name: string}>>} A unique list of projects.
   */
  async getUniqueProjectsFromControls(type) {
    try {
      // Fetch controls with a high limit to ensure all unique projects are found.
      const response = await this.getControlsBySystemType(type, { limit: 2000 });
      const controls = response.controls || [];

      if (controls.length === 0) return [];

      // Use a Map to ensure the project list is unique.
      const projectsMap = new Map();
      controls.forEach(control => {
        // IMPORTANT ASSUMPTION: This assumes your backend returns a 'project' object
        // inside each control object, like: { projectId: 'P-001', name: 'AI Chatbot' }
        if (control.project && control.project.projectId && !projectsMap.has(control.project.projectId)) {
          projectsMap.set(control.project.projectId, {
            projectId: control.project.projectId,
            name: control.project.name || control.project.projectId // Fallback to ID if name is missing
          });
        }
      });

      return Array.from(projectsMap.values());
    } catch (error) {
      console.error("Failed to derive project list from controls:", error);
      throw new Error('Failed to build project filter list.');
    }
  }


  /**
   * Update a control by its unique ID.
   */
  async updateControl(id, updateData) {
    try {
      const response = await api.put(`/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update control');
    }
  }

  /**
   * Soft delete a control by its unique ID.
   */
  async deleteControl(id) {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete control');
    }
  }
}

export default new ControlAssessmentService();
