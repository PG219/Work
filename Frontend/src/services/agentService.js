import axios from 'axios';
import { getAgentUrl } from '@/config/env';

// Create axios instance
const api = axios.create({
  baseURL: getAgentUrl(''),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token + log
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("➡️ [REQUEST]", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error("❌ [REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

// ✅ SINGLE, unified response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("⬅️ [RESPONSE]", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // 🔐 Handle unauthorized
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }

    // 🚨 Handle rate limit exceeded
    if (status === 429) {
      const resetTimeSeconds = parseInt(
        error.response?.headers['retry-after'] || 60,
        10
      );

      window.dispatchEvent(
        new CustomEvent('rateLimitExceeded', {
          detail: { resetTimeSeconds },
        })
      );
    }

    console.error("❌ [RESPONSE ERROR]", {
      url: error.config?.url,
      status,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);


class AgentService {
  // ========================================
  // LEGACY METHODS (kept for backward compatibility)
  // ========================================
  
  // Start AI agent assessment
  async startAgentAssessment(assessmentData) {
    try {
      const response = await api.post('/agent/start-assessment', assessmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to start agent assessment');
    }
  }

  // Get agent assessment status
  async getAgentAssessmentStatus(sessionId) {
    try {
      const response = await api.get(`/agent/assessment-status/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get agent assessment status');
    }
  }

  // Get agent assessment results
  async getAgentAssessmentResults(sessionId) {
    try {
      const response = await api.get(`/agent/assessment-results/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get agent assessment results');
    }
  }

  // Stop agent assessment
  async stopAgentAssessment(sessionId) {
    try {
      const response = await api.post(`/agent/stop-assessment/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to stop agent assessment');
    }
  }

  // ========================================
  // NEW RISK & CONTROL ASSESSMENT METHODS
  // ========================================

  /**
   * Run combined risk and control assessment
   * @param {Object} assessmentData - { summary, session_id, project_id?, controls_path? }
   * @returns {Promise<Object>} Combined risk and control assessment results
   */
  async runRiskControlAssessment(assessmentData) {
    try {
      const response = await api.post('/agent/risk-control', {
        summary: assessmentData.summary,
        session_id: assessmentData.session_id,
        project_id: assessmentData.project_id || null,
        controls_path: assessmentData.controls_path || 'predefined_controls.xlsx'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to run risk-control assessment');
    }
  }

  /**
   * Run risk assessment only (legacy endpoint)
   * @param {Object} riskData - { summary, session_id, project_id? }
   * @returns {Promise<Object>} Risk assessment results
   */
  async runRiskAssessment(riskData) {
    try {
      const response = await api.post('/agent/risk-matrix', {
        summary: riskData.summary,
        session_id: riskData.session_id,
        project_id: riskData.project_id || null
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to run risk assessment');
    }
  }

  /**
   * Store risk and control data in database
   * @param {Object} storageData - { session_id, risk_assessment_id, risks, controls }
   * @returns {Promise<Object>} Storage confirmation
   */
  async storeRiskControlData(storageData) {
    try {
      const response = await api.post('/agent/risk-control/store', storageData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to store risk-control data');
    }
  }

  /**
   * Get all risks for a specific assessment
   * @param {string} assessmentId - Risk assessment ID
   * @returns {Promise<Array>} List of risks
   */
  async getRisksByAssessment(assessmentId) {
    try {
      const response = await api.get(`/agent/risk-control/assessment/${assessmentId}/risks`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get risks by assessment');
    }
  }

  /**
   * Get all controls for a specific assessment
   * @param {string} assessmentId - Risk assessment ID
   * @returns {Promise<Array>} List of controls
   */
  async getControlsByAssessment(assessmentId) {
    try {
      const response = await api.get(`/agent/risk-control/assessment/${assessmentId}/controls`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get controls by assessment');
    }
  }

  /**
   * Update control status
   * @param {string} controlId - Control ID
   * @param {string} status - New status ("Compliant", "In Progress", "Not Implemented")
   * @param {string} tickets - Ticket numbers (optional)
   * @returns {Promise<Object>} Update confirmation
   */
  async updateControlStatus(controlId, status, tickets = null) {
    try {
      const response = await api.put(`/agent/risk-control/control/${controlId}`, {
        status,
        tickets
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update control status');
    }
  }

  // ========================================
  // CHAT AGENT METHODS
  // ========================================

  /**
   * Send message to chat agent
   * @param {Object} messageData - { message, session_id, context? }
   * @returns {Promise<Object>} Chat response
   */
  async sendChatMessage(messageData) {
    try {
      const response = await api.post('/agent/chat', messageData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to send chat message');
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  // Get agent capabilities
  async getAgentCapabilities() {
    try {
      const response = await api.get('/agent/capabilities');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get agent capabilities');
    }
  }

  // Configure agent settings
  async configureAgent(settings) {
    try {
      const response = await api.post('/agent/configure', settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to configure agent');
    }
  }

  // ========================================
  // CONVENIENCE METHODS
  // ========================================

  /**
   * Generate session ID for new assessment
   * @returns {string} New session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate assessment response structure
   * @param {Object} response - Assessment response
   * @returns {boolean} Is valid response
   */
  validateAssessmentResponse(response) {
    return (
      response &&
      response.session_id &&
      response.risk_assessment_id &&
      response.parsed_risks &&
      response.parsed_controls &&
      Array.isArray(response.parsed_risks) &&
      Array.isArray(response.parsed_controls)
    );
  }

  /**
   * Format assessment data for storage
   * @param {Object} assessmentResponse - Response from risk-control assessment
   * @returns {Object} Formatted data for storage
   */
  formatForStorage(assessmentResponse) {
    if (!this.validateAssessmentResponse(assessmentResponse)) {
      throw new Error('Invalid assessment response structure');
    }

    return {
      session_id: assessmentResponse.session_id,
      risk_assessment_id: assessmentResponse.risk_assessment_id,
      risks: assessmentResponse.parsed_risks.map(risk => ({
        ...risk,
        created_at: new Date().toISOString()
      })),
      controls: assessmentResponse.parsed_controls.map(control => ({
        ...control,
        created_at: new Date().toISOString()
      }))
    };
  }

  /**
   * Get assessment summary statistics
   * @param {Object} assessmentResponse - Assessment response
   * @returns {Object} Summary statistics
   */
  getAssessmentStats(assessmentResponse) {
    if (!this.validateAssessmentResponse(assessmentResponse)) {
      return null;
    }

    const risks = assessmentResponse.parsed_risks;
    const controls = assessmentResponse.parsed_controls;

    // Risk statistics
    const riskStats = {
      total: risks.length,
      bySeverity: risks.reduce((acc, risk) => {
        acc[risk.severity] = (acc[risk.severity] || 0) + 1;
        return acc;
      }, {}),
      byOwner: risks.reduce((acc, risk) => {
        acc[risk.risk_owner] = (acc[risk.risk_owner] || 0) + 1;
        return acc;
      }, {})
    };

    // Control statistics
    const controlStats = {
      total: controls.length,
      byStatus: controls.reduce((acc, control) => {
        acc[control.status] = (acc[control.status] || 0) + 1;
        return acc;
      }, {}),
      bySection: controls.reduce((acc, control) => {
        acc[control.section] = (acc[control.section] || 0) + 1;
        return acc;
      }, {})
    };

    return {
      assessment_id: assessmentResponse.risk_assessment_id,
      session_id: assessmentResponse.session_id,
      risks: riskStats,
      controls: controlStats,
      generated_at: new Date().toISOString()
    };
  }
}

export default new AgentService();