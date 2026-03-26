import axios from "axios";
import { getBackendUrl } from "@/config/env";

// Base URL for comments API
const API_URL = getBackendUrl("/comments");

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- PRIVATE AXIOS INSTANCE WITH INTERCEPTOR ---
const commentsApi = axios.create({
  baseURL: API_URL,
});

/**
 * Global error handler to dispatch events and handle common statuses (401, 429).
 * Note: This runs on all Axios errors for this instance.
 */
const responseErrorHandler = (error) => {
  const status = error.response?.status;
  const responseData = error.response?.data;
  const config = error.config;

  // 🚨 Handle rate limit exceeded (HTTP 429)
  if (status === 429) {
    const retryAfterHeader = error.response?.headers?.['retry-after'];
    
    let resetTimeSeconds;
    if (responseData && typeof responseData.reset_in_seconds === 'number') {
      resetTimeSeconds = responseData.reset_in_seconds;
    } else {
      // Fallback to 'Retry-After' header or default to 60 seconds
      resetTimeSeconds = parseInt(retryAfterHeader || '60', 10);
    }

    // Dispatch a global event that the React Snackbar component listens for
    window.dispatchEvent(
      new CustomEvent('rateLimitExceeded', {
        detail: { 
          resetTimeSeconds,
          message: responseData?.message || 'You have exceeded your request limit.' 
        },
      })
    );
    // Log and then let the Promise reject so the specific function can catch it too
    console.error(`❌ [AXIOS 429] Rate limit exceeded on ${config?.url}`);
    return Promise.reject(error);
  }
  
  // 🔐 Handle unauthorized (HTTP 401)
  if (status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    return Promise.reject(new Error("Authentication failed. Redirecting..."));
  }

  // Log other response errors
  console.error("❌ [RESPONSE ERROR]", {
    url: config?.url,
    status,
    data: responseData,
    message: error.message
  });
  
  return Promise.reject(error);
};

// Add the response interceptor to the instance
commentsApi.interceptors.response.use(
  (response) => response,
  responseErrorHandler
);
// --- END PRIVATE AXIOS INSTANCE ---


/**
 * Fetch comment data for a given project (returns an array).
 * @param {string} projectId
 * @returns {Promise<object[]>}
 */
export const getComments = async (projectId) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    // Use the commentsApi instance
    const { data } = await commentsApi.get(`/${projectId}`, {
      baseURL: API_URL, // Ensure baseURL is respected
      headers: getAuthHeaders(),
    });

    // Note: 401/429 handled by interceptor, so we only handle successful responses and expected errors here.

    // Handle the new API response format
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      // Fallback for old API format
      return data;
    } else {
      console.warn('Unexpected API response format:', data);
      return [];
    }
  } catch (error) {
    // Catch specific handled errors or re-throw after global handling
    if (error.response?.status === 404) {
      return []; // No comments found
    } else if (error.message === "Authentication failed. Redirecting...") {
      // Interceptor already handled 401
      throw error;
    } else {
      throw new Error(`Failed to fetch comments: ${error.response?.data?.message || error.message}`);
    }
  }
};

/**
 * Save a single comment with optional file attachment
 * @param {string} projectId
 * @param {string} text
 * @param {File} file
 * @returns {Promise<object>}
 */
export const saveComment = async (projectId, text, file) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }
  if (!text || text.trim().length === 0) {
    throw new Error("text is required");
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('text', text.trim());
    
    if (file) {
      formData.append('attachment', file);
    }

    // Use the commentsApi instance
    const { data } = await commentsApi.post(
      `/`,
      formData,
      { 
        baseURL: API_URL, // Ensure baseURL is respected
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to save comment');
    }
  } catch (error) {
    // Handle specific errors
    if (error.response?.status === 413) {
      throw new Error("File too large. Please choose a file smaller than 10MB.");
    } else if (error.response?.status === 400 && error.response?.data?.message?.includes('Only PDF files')) {
      throw new Error("Only PDF files are allowed as attachments.");
    } else if (error.message === "Authentication failed. Redirecting...") {
      throw error;
    } else {
      throw new Error(`Failed to save comment: ${error.response?.data?.message || error.message}`);
    }
  }
};

/**
 * Save multiple comments in one call (no file uploads for bulk).
 * @param {string} projectId
 * @param {{text: string, attachment?: string}[]} comments
 * @returns {Promise<object>}
 */
export const saveCommentsBulk = async (projectId, comments) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }
  if (!Array.isArray(comments)) {
    throw new Error("comments must be an array");
  }
  if (comments.length === 0) {
    throw new Error("comments array cannot be empty");
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    // Use the commentsApi instance
    const { data } = await commentsApi.post(
      `/bulk`,
      { projectId, comments },
      { 
        baseURL: API_URL, // Ensure baseURL is respected
        headers: getAuthHeaders() 
      }
    );

    if (data.success) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to save comments');
    }
  } catch (error) {
    if (error.message === "Authentication failed. Redirecting...") {
      throw error;
    } else {
      throw new Error(`Failed to save comments: ${error.response?.data?.message || error.message}`);
    }
  }
};

/**
 * Update a comment with optional new attachment
 * @param {string} commentId
 * @param {string} text
 * @param {File} file
 * @returns {Promise<object>}
 */
export const updateComment = async (commentId, text, file) => {
  if (!commentId) {
    throw new Error("commentId is required");
  }
  if (!text || text.trim().length === 0) {
    throw new Error("text is required");
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('text', text.trim());
    
    if (file) {
      formData.append('attachment', file);
    }

    // Use the commentsApi instance
    const { data } = await commentsApi.put(
      `/${commentId}`,
      formData,
      { 
        baseURL: API_URL, // Ensure baseURL is respected
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to update comment');
    }
  } catch (error) {
    // Handle specific errors
    if (error.response?.status === 404) {
      throw new Error("Comment not found or you don't have permission to update it");
    } else if (error.response?.status === 413) {
      throw new Error("File too large. Please choose a file smaller than 10MB.");
    } else if (error.response?.status === 400 && error.response?.data?.message?.includes('Only PDF files')) {
      throw new Error("Only PDF files are allowed as attachments.");
    } else if (error.message === "Authentication failed. Redirecting...") {
      throw error;
    } else {
      throw new Error(`Failed to update comment: ${error.response?.data?.message || error.message}`);
    }
  }
};

/**
 * Delete a comment
 * @param {string} commentId
 * @returns {Promise<object>}
 */
export const deleteComment = async (commentId) => {
  if (!commentId) {
    throw new Error("commentId is required");
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    // Use the commentsApi instance
    const { data } = await commentsApi.delete(
      `/${commentId}`,
      { 
        baseURL: API_URL, // Ensure baseURL is respected
        headers: getAuthHeaders() 
      }
    );

    if (data.success) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to delete comment');
    }
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Comment not found or you don't have permission to delete it");
    } else if (error.message === "Authentication failed. Redirecting...") {
      throw error;
    } else {
      throw new Error(`Failed to delete comment: ${error.response?.data?.message || error.message}`);
    }
  }
};
