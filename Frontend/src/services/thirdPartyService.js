import axios from "axios";
import { getBackendUrl } from "@/config/env";

// Create axios instance with base URL set to the thirdparty endpoint
const api = axios.create({
  baseURL: getBackendUrl("/thirdparty"),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (429 Rate Limit and 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
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

    if (status === 401) {
      // Token expired or invalid, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

/**
 * Get all Third Parties for a given project
 * @param {string} projectId
 * @returns {Promise<object[]>}
 */
export const getThirdParties = async (projectId) => {
  if (!projectId) throw new Error("projectId is required");

  try {
    // Removed token argument and manual headers, using interceptor
    const { data } = await api.get(`/${projectId}`);
    return Array.isArray(data) ? data : data ? [data] : [];
  } catch (error) {
    // Interceptor handles 401/429. Catch other errors here.
    console.error(`Error fetching third parties for project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Create a new Third Party
 * @param {object} thirdPartyData
 * @returns {Promise<object>}
 */
export const createThirdParty = async (thirdPartyData) => {
  if (!thirdPartyData?.projectId) throw new Error("projectId is required");

  try {
    // Removed token argument and manual headers, using interceptor
    const { data } = await api.post('/', thirdPartyData);
    return data;
  } catch (error) {
    // Interceptor handles 401/429. Catch other errors here.
    console.error("Error creating third party:", error);
    throw error;
  }
};

/**
 * Update an existing Third Party by ID
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>}
 */
export const updateThirdParty = async (id, updates) => {
  if (!id) throw new Error("Third Party ID is required");

  try {
    // Removed token argument and manual headers, using interceptor
    const { data } = await api.put(`/${id}`, updates);
    return data;
  } catch (error) {
    // Interceptor handles 401/429. Catch other errors here.
    console.error(`Error updating third party with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a Third Party by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteThirdParty = async (id) => {
  if (!id) throw new Error("Third Party ID is required");

  try {
    // Removed token argument and manual headers, using interceptor
    const { data } = await api.delete(`/${id}`);
    return data;
  } catch (error) {
    // Interceptor handles 401/429. Catch other errors here.
    console.error(`Error deleting third party with ID ${id}:`, error);
    throw error;
  }
};
