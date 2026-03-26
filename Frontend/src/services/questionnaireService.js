import axios from "axios";
import { getBackendUrl } from "@/config/env";

const api = axios.create({
  baseURL: getBackendUrl(""),
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const responseData = error.response?.data;
    
    if (status === 429) {
      const retryAfterHeader = error.response?.headers?.['retry-after'];
      let resetTimeSeconds;
      if (responseData && typeof responseData.reset_in_seconds === 'number') {
        resetTimeSeconds = responseData.reset_in_seconds;
      } else {
        resetTimeSeconds = parseInt(retryAfterHeader || '60', 10);
      }

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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

class QuestionnaireService {
  async processQuestionnaire(data) {
    try {
      const response = await api.post("/questionnaire/process", data);
      return response.data;
    } catch (error) {
      const e = error.response?.data;
      const msg =
        e?.detail || 
        e?.message || 
        e?.error || 
        error.message || 
        "Failed to process questionnaire"; 
      throw new Error(msg);
    }
  }

  async getQuestionnaireStatus(sessionId) {
    try {
      const response = await api.get(`/questionnaire/status/${sessionId}`);
      return response.data;
    } catch (error) {
      const e = error.response?.data;
      const msg =
        e?.detail ||
        e?.message ||
        e?.error ||
        "Failed to get questionnaire status";
      throw new Error(msg);
    }
  }
}

export default new QuestionnaireService();
