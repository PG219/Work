import axios from 'axios';
import { getAgentUrl } from '@/config/env';
import { BACKEND_URL } from '@/config/env';

class TrustCenterRAGService {
  
  constructor() {
    // Create a new Axios instance
    this.apiClient = axios.create();

    // Bind the error handler to the class instance
    this.handleAxiosError = this.handleAxiosError.bind(this);

    // Add a request interceptor to automatically add auth headers to EVERY request
    this.apiClient.interceptors.request.use(
      (config) => {
        // Merge in the headers from our getAuthHeaders function
        config.headers = {
          ...config.headers,
          ...this.getAuthHeaders(),
        };
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add a response interceptor to centralize error handling
    this.apiClient.interceptors.response.use(
      (response) => response, // Pass through successful responses
      this.handleAxiosError    // Use our custom error handler for errors
    );
  }

  /**
   * Helper function to get authentication headers.
   * This is now called by the request interceptor automatically.
   * @returns {Object} Headers object including Authorization if token exists.
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Centralized error handling for Axios responses.
   * This replaces the old handleFetchResponse method.
   * @param {Error} error - The error object from Axios.
   * @throws {Error} Throws a detailed error.
   */
  handleAxiosError(error) {
    if (error.response) {
      // The request was made and the server responded with a non-2xx status
      const { status, data, headers } = error.response;

      // Handle Rate Limit Exceeded (429)
      if (status === 429) {
        const retryAfterHeader = headers['retry-after'];
        let resetTimeSeconds;

        if (data && typeof data.reset_in_seconds === 'number') {
          resetTimeSeconds = data.reset_in_seconds;
        } else {
          // Fallback to Retry-After header or default to 60 seconds
          resetTimeSeconds = parseInt(retryAfterHeader || '60', 10);
        }

        // Dispatch event for the Snackbar component to catch
        window.dispatchEvent(
          new CustomEvent('rateLimitExceeded', {
            detail: {
              resetTimeSeconds,
              message: data?.message || 'You have exceeded your request limit.',
            },
          })
        );
        // Reject with a new error to be caught by the calling function
        return Promise.reject(new Error(data?.message || 'Rate limit exceeded'));
      }

      // Handle Unauthorized (401)
      if (status === 401) {
        // Token expired or invalid, clear storage and reload
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        // Reject to prevent further execution
        return Promise.reject(new Error('Authentication failed. Reloading...'));
      }

      // Handle other non-2xx errors
      const message = data?.message || data?.error || `HTTP error! status: ${status}`;
      return Promise.reject(new Error(message));

    } else if (error.request) {
      // The request was made but no response was received (e.g., network error)
      console.error('Network error or no response:', error.request);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Axios setup error:', error.message);
      return Promise.reject(error);
    }
  }

  /**
   * Triggers an incremental sync with the GCS bucket configured on the server.
   * @returns {Promise<Object>} Sync response
   */
  async syncDocuments() {
    try {
      // Headers (including auth) are added by the interceptor
      // The .post() method automatically stringifies the body (null in this case)
      const response = await this.apiClient.post(getAgentUrl('/agent/rag/sync-gcs'));
      // Axios returns data in response.data
      return response.data;
    } catch (error) {
      console.error('Error syncing Trust Center documents:', error);
      throw error;
    }
  }

  /**
   * Query the loaded documents using RAG.
   * @param {string} question - User question
   * @param {string} mode - The query mode ('hybrid', 'rag', or 'general')
   * @returns {Promise<Object>} Query response with answer and sources
   */
  async queryDocuments(question, mode = 'hybrid') {
    try {
      const payload = {
        question: question,
        mode: mode,
      };
      // Headers added by interceptor, body is the second argument
      const response = await this.apiClient.post(getAgentUrl('/agent/rag/query'), payload);
      return response.data;
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }

  /**
   * Get the current status of the RAG service.
   * @returns {Promise<Object>} Status information
   */
  async getStatus() {
    try {
      // Headers added by interceptor
      const response = await this.apiClient.get(getAgentUrl('/agent/rag/status'));
      return response.data;
    } catch (error) {
      console.error('Error getting RAG status:', error);
      throw error;
    }
  }

  /**
   * Reset the RAG index on the server.
   * @returns {Promise<Object>} Reset response
   */
  async resetIndex() {
    try {
      // Headers added by interceptor
      const response = await this.apiClient.post(getAgentUrl('/agent/rag/reset'));
      return response.data;
    } catch (error) {
      console.error('Error resetting index:', error);
      throw error;
    }
  }

  /**
   * Enhanced query with fallback to simulated responses.
   * (No changes needed here, as the try/catch logic is still valid)
   * @param {string} question - User question
   * @param {string} mode - The query mode
   * @returns {Promise<Object>} Enhanced response with fallback
   */
  async queryWithFallback(question, mode = 'hybrid') {
    try {
      // Try RAG service first
      const ragResponse = await this.queryDocuments(question, mode);
      
      return {
        ...ragResponse,
        source: 'rag',
        success: true,
      };
    } catch (error) {
      // 401/429 errors are handled by the interceptor, but connectivity or other
      // errors will still be caught here and trigger the fallback.
      console.warn('RAG service unavailable, using fallback response', error);
      
      // Fallback to simulated responses
      const fallbackResponse = this.getSimulatedResponse(question);
      
      return {
        answer: fallbackResponse,
        sources: ['Simulated Response'],
        contexts: [fallbackResponse],
        source: 'fallback',
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get simulated response for fallback.
   * (No changes needed)
   * @param {string} question - User question
   * @returns {string} Simulated response
   */
  getSimulatedResponse(question) {
    const lowerMessage = question.toLowerCase();
    
    if (lowerMessage.includes("gdpr") || lowerMessage.includes("privacy")) {
      return "I can help you with GDPR compliance. Our Privacy Policy is regularly updated and available in the Trust Center Documents. We process data in accordance with EU regulations and provide easy-to-use data subject rights management.";
    }
    
    if (lowerMessage.includes("security") || lowerMessage.includes("certificate")) {
      return "Our security certifications include ISO 27001, SOC 2 Type II, and PCI DSS compliance. These certificates are regularly audited and updated. You can find the latest versions in our Certifications section.";
    }

    // ... (rest of the simulated responses)
    return "I understand you're looking for information about our trust and compliance practices. Could you be more specific? I can help with policies, certifications, audit reports, or compliance questions.";
  }

  /**
   * Manual sync via backend (recommended for UI triggers)
   * @returns {Promise<Object>} Sync response
   */
  async syncDocumentsViaBackend() {
    try {
      // Auth headers are now added automatically by the interceptor
      const response = await this.apiClient.post(`${BACKEND_URL}/api/documents/sync`);
      return response.data;
    } catch (error) {
      console.error('Error syncing documents via backend:', error);
      throw error;
    }
  }

  /**
   * Get sync status via backend
   * @returns {Promise<Object>} Status response
   */
  async getSyncStatusViaBackend() {
    try {
      // Auth headers are now added automatically by the interceptor
      const response = await this.apiClient.get(`${BACKEND_URL}/api/documents/sync/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting sync status via backend:', error);
      throw error;
    }
  }

  /**
   * Initialize Trust Center by ensuring documents are loaded.
   * (No changes needed here, as the try/catch logic is still valid)
   * @returns {Promise<Object>} Initialization result
   */
  async initializeTrustCenter() {
    try {
      // Check if the index already has documents
      const status = await this.getStatus();
      
      if (status && status.indexed_file_count > 0) {
        return {
          success: true,
          message: `Trust Center already initialized with ${status.indexed_file_count} documents`,
          ...status,
        };
      }

      // If not, trigger a sync via backend (more reliable)
      try {
        const result = await this.syncDocumentsViaBackend();
        return {
          success: true,
          message: 'Trust Center initialized successfully',
          ...result,
        };
      } catch (backendError) {
        // Fallback to direct agent sync
        const result = await this.syncDocuments();
        return {
          success: true,
          message: 'Trust Center initialized successfully (via agent)',
          ...result,
        };
      }
    } catch (error) {
      console.warn('Failed to initialize Trust Center with RAG:', error);
      
      return {
        success: false,
        message: 'Trust Center running in fallback mode',
        error: error.message,
        fallback: true,
      };
    }
  }

  /**
   * Get all documents (policies, certs, audits) from the backend.
   * @returns {Promise<Object>} Object with policies, certifications, audits
   */
  async getDocuments() {
    try {
      // Auth headers are automatically added by the interceptor
      const response = await this.apiClient.get(`${BACKEND_URL}/api/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }
}

export default new TrustCenterRAGService();