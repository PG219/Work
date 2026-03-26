import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout";
import Templates from "./pages/Templates/main";
import TemplateQuestions from "./pages/Templates/TemplateQuestions";
import UseCase from "./pages/useCase/main";
import Questionare from "./pages/quetionare/main";
import Projects from "./pages/Projects/main";
import NotFound from "./components/notFound";
import ProjectView from "./pages/Projects/projectView";
import UserManagement from "./pages/UserManagement/main";
import ChatAgent from "./pages/ChatAgent/main";
import ControlAssessment from "./pages/CyberSecurity Management/Control Assessment";
import AIRiskAssessment from "./pages/AI System/AI_Risk_Assessment";
import AIPolicy from "./pages/AI System/AIPolicy";
import AIRegulatoryAssessment from "./pages/AI System/AIRegulatoryAssessment";
import AIInventory from "./pages/AI System/AIInventory";
import AssetDetail from "./pages/AI System/AssetDetail";
import AIControlAssessment from "./pages/AI System/AI_Control_Assessment";
import Reports from "./pages/Reports/main";
import TrustCenterDocuments from "./pages/Trust Center/Documents";
import TrustCenterInsight from "./pages/Trust Center/Insights";
import Demo from "./pages/Demo/Demo";
import RiskAssessment from "./pages/CyberSecurity Management/Risk Assessment/RiskAssessment";
import RiskAnalysis from "./pages/CyberSecurity Management/RiskAnalysis";
import ThirdPartyAssessment from "./pages/ThirdPartyAssessment/main";
import RiskManager from "./pages/CyberSecurity Management/Risk Manager/RiskManager";
import Login from "./pages/Login/login";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthGuard from "./components/AuthGuard";
import OAuthRedirectHandler from "./components/OAuthRedirectHandler";
import Dashboard from "./pages/Dashboard/DahboardMain";
import Inventory from "./pages/Inventory/main";
import Support from "./support";
import RateLimitSnackbar from "./components/rateLimitSnackbar";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/oauth/callback" element={<OAuthRedirectHandler />} />

      <Route element={<AuthGuard />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="templates" element={<Templates />} />
          <Route path="templates/:templateId" element={<TemplateQuestions />} />
          <Route path="usecase" element={<UseCase />} />
          <Route path="questionare" element={<Questionare />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId?" element={<ProjectView />} />
          <Route path="reports" element={<Reports />} />
          <Route
            path="users"
            element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>}
          />
          <Route path="chat" element={<ChatAgent />} />
          <Route path="demo" element={<Demo />} />
          <Route path="ai-inventory" element={<AIInventory />} />
          <Route path="ai-inventory/:assetId" element={<AssetDetail />} />
          <Route path="ai-risk-assessment" element={<AIRiskAssessment />} />
          <Route path="ai-control-assessment" element={<AIControlAssessment />} />
          <Route path="ai-policy" element={<AIPolicy />} />
          <Route path="ai-regulatory-assessment" element={<AIRegulatoryAssessment />} />
          <Route path="cyber-risk-assessment" element={<RiskAssessment />} />
          <Route path="cyber-control-assessment" element={<ControlAssessment />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="cyber-risk-manager" element={<RiskManager />} />
          <Route path="cyber-risk-analysis" element={<RiskAnalysis />} />
          <Route path="3passessements" element={<ThirdPartyAssessment />} />
          <Route path="documents" element={<TrustCenterDocuments />} />
          <Route path="insights" element={<TrustCenterInsight />} />
          <Route path="support" element={<Support />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  // 🔥 Snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [resetTime, setResetTime] = useState(0);

  useEffect(() => {
    // Listen for the 429 global event
    const handleRateLimit = (event) => {
      const { resetTimeSeconds } = event.detail;
      setResetTime(resetTimeSeconds);
      setShowSnackbar(true);
    };

    window.addEventListener("rateLimitExceeded", handleRateLimit);

    return () => {
      window.removeEventListener("rateLimitExceeded", handleRateLimit);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />

        {/* ✅ Global Snackbar */}
        <RateLimitSnackbar
          isVisible={showSnackbar}
          resetTimeSeconds={resetTime}
          onClose={() => setShowSnackbar(false)}
        />
      </Router>
    </AuthProvider>
  );
}
