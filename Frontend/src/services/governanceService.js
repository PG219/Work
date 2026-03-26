import axios from 'axios';
import { getBackendUrl } from '@/config/env';

// Create a pre-configured instance of axios
const api = axios.create({
  baseURL: getBackendUrl(""),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Use an interceptor to automatically add the auth token to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (401 and 429)
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
      // Token expired or invalid, clear storage and reload
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    
    return Promise.reject(error);
  }
);

class GovernanceService {
  /**
   * Get the latest governance scores for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Object>} Governance scores
   */
  async getProjectGovernanceScores(projectId) {
    try {
      // Axios automatically throws an error for non-2xx responses
      const response = await api.get(`/governance/${projectId}/scores`);
      // The response data is directly available on response.data
      console.log(response);
      return response.data.scores || this.getDefaultScores();
    } catch (error) {
      console.error('Error fetching governance scores:', error);
      // If the error is a 404, the backend sends a default structure
      if (error.response && error.response.status === 404) {
        return error.response.data.scores;
      }
      return this.getDefaultScores();
    }
  }

  /**
   * Get governance score history for a project
   * @param {string} projectId - The project ID
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} Array of governance score records
   */
  async getGovernanceScoreHistory(projectId, limit = 10) {
    try {
      // Pass query params in a `params` object for better readability
      const response = await api.get(`/governance/${projectId}/history`, {
        params: { limit }
      });
      return response.data.history || [];
    } catch (error) {
      console.error('Error fetching governance score history:', error);
      return [];
    }
  }

  /**
   * Trigger governance score recalculation for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Object>} Updated governance scores
   */
  async recalculateGovernanceScores(projectId) {
    try {
      const response = await api.post(`/governance/${projectId}/recalculate`);
      return response.data.scores;
    } catch (error) {
      console.error('Error recalculating governance scores:', error);
      throw error;
    }
  }

  /**
   * Get governance statistics across all projects
   * @returns {Promise<Object>} Governance statistics
   */
  async getGovernanceStatistics() {
    try {
      const response = await api.get('/governance/statistics');
      return response.data.statistics || {};
    } catch (error) {
      console.error('Error fetching governance statistics:', error);
      return {};
    }
  }
  
  // Helper function to provide default scores
  getDefaultScores() {
    return {
      eu_score: 0,
      nist_score: 0,
      iso_score: 0,
      overall_score: 0,
      implemented_controls_count: 0,
      total_controls_count: 0
    };
  }

  // --- Helper methods below are unchanged ---

  /**
   * Calculate compliance percentage based on implemented vs total controls
   * @param {number} implemented - Number of implemented controls
   * @param {number} total - Total number of controls
   * @returns {number} Compliance percentage (0-100)
   */
  calculateCompliancePercentage(implemented, total) {
    if (total === 0) return 0;
    return Math.round((implemented / total) * 100);
  }

  /**
   * Get score color based on score value
   * @param {number} score - Score value (0-100)
   * @returns {string} CSS color class
   */
  getScoreColor(score) {
    if (score >= 80) return '#10b981'; // green-500
    if (score >= 60) return '#f59e0b'; // amber-500
    if (score >= 40) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  }

  /**
   * Format score for display
   * @param {number} score - Score value
   * @returns {string} Formatted score string
   */
  formatScore(score) {
    return `${Math.round(score)}%`;
  }
}

export default new GovernanceService();
