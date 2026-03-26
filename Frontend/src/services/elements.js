import axios from "axios";
import { getBackendUrl } from "@/config/env";

// Create a pre-configured instance of axios
const apiClient = axios.create({
  baseURL: getBackendUrl(""), // Base URL set here
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- Interceptors ---

// Request interceptor to automatically add the auth token to every request
apiClient.interceptors.request.use(
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

// ✅ Normalize base URL for elements API path
const API_ELEMENTS_PATH = "/elements";

/**
 * Fetch purpose data for a given project (returns an array).
 * @param {string} projectId
 * @returns {Promise<object[]>}
 */
export const getPurposeData = async (projectId) => {
  if (!projectId) throw new Error("projectId is required");

  try {
    // Use the apiClient instance
    const { data } = await apiClient.get(`${API_ELEMENTS_PATH}/${projectId}`);
    return Array.isArray(data) ? data : data ? [data] : [];
  } catch (error) {
    console.error(`Error fetching purpose data for project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Save multiple purpose elements in one call.
 * @param {string} projectId
 * @param {{category: string, elementName: string}[]} elements
 * @returns {Promise<object>}
 */
export const savePurposeDataBulk = async (projectId, elements) => {
  if (!projectId) throw new Error("projectId is required");
  if (!Array.isArray(elements)) throw new Error("elements must be an array");

  try {
    // Use the apiClient instance
    const { data } = await apiClient.post(
      `${API_ELEMENTS_PATH}/bulk`,
      { projectId, elements }
    );
    return data;
  } catch (error) {
    console.error(`Error saving purpose data (bulk) for project ${projectId}:`, error);
    throw error;
  }
};

/** (kept for compatibility) Save a single element — not used by Purpose.jsx now */
export const savePurposeData = async (projectId, category, elementName) => {
  if (!projectId) throw new Error("projectId is required");
  if (!category) throw new Error("category is required");
  if (!elementName) throw new Error("elementName is required");

  try {
    // Use the apiClient instance
    const { data } = await apiClient.post(
      `${API_ELEMENTS_PATH}/`,
      { projectId, category, elementName }
    );
    return data;
  } catch (error) {
    console.error(`Error saving purpose data for project ${projectId}:`, error);
    throw error;
  }
};
