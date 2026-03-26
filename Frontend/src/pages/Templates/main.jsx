import React, { useState, useEffect } from 'react';
import { RESPONSE_TYPES } from '../../constants/templates';
import templateService from '../../services/templateService';
import { useAuth, PERMISSIONS } from '../../contexts/AuthContext';
import TemplateItem from './components/TemplateItem';
import NewTemplateModal from './components/NewTemplateModal';
import TemplateResponse from './components/TemplateResponse';
import ResponsesList from './components/ResponsesList';

const Templates = () => {
  const { user, hasPermission, isAdmin } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [templateResponses, setTemplateResponses] = useState([]);
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'responses'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load templates on component mount
  useEffect(() => {
    if (user) {
      loadTemplates();
      if (hasPermission(PERMISSIONS.VIEW_RESPONSES)) {
        loadResponses();
      }
    }
  }, [user, hasPermission]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async () => {
    try {
      const data = await templateService.getResponses();
      setTemplateResponses(data);
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const handleCreateTemplate = async (newTemplate) => {
    try {
      const createdTemplate = await templateService.createTemplate(newTemplate);
      setTemplates([...templates, createdTemplate]);
      setShowNewTemplateModal(false);
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(selectedTemplate?.id === template.id ? null : template);
  };

  const handleStartResponse = (template) => {
    setSelectedTemplate(template);
    setShowResponseForm(true);
  };

  const handleSaveResponse = async (responseData) => {
    try {
      const savedResponse = await templateService.submitResponse(responseData);
      setTemplateResponses(prev => [...prev, savedResponse]);
      setShowResponseForm(false);
      setSelectedTemplate(null);
      alert('Response saved successfully!');
    } catch (error) {
      console.error('Error saving response:', error);
      alert('Failed to save response');
    }
  };

  const handleCancelResponse = () => {
    setShowResponseForm(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600 mt-2">
              {isAdmin() 
                ? 'Manage and create assessment templates' 
                : 'View and fill out assessment templates'
              }
            </p>
          </div>
          {activeTab === 'templates' && hasPermission(PERMISSIONS.CREATE_TEMPLATES) && (
            <button
              onClick={() => setShowNewTemplateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Template
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates ({templates.length})
            </button>
            {hasPermission(PERMISSIONS.VIEW_RESPONSES) && (
              <button
                onClick={() => setActiveTab('responses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'responses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Responses ({templateResponses.length})
              </button>
            )}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'templates' ? (
          <>
            {/* Loading State */}
            {
            !user ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
                  <p className="text-gray-500 mb-4">Please log in to access templates.</p>
                  {/* Optionally, add a login button/modal trigger here */}
                </div>
              ): 
              loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading templates...</p>
              </div>
            ): error? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Templates</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={loadTemplates}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Try Again
                </button>
              </div>
            ): (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <TemplateItem
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={handleTemplateSelect}
                    onStartResponse={handleStartResponse}
                  />
                ))}
              </div>
            )}

            {/* Template Response Form */}
            {showResponseForm && selectedTemplate && (
              <div className="mt-8">
                <TemplateResponse
                  template={selectedTemplate}
                  onSave={handleSaveResponse}
                  onCancel={handleCancelResponse}
                />
              </div>
            )}
          </>
        ) : activeTab === 'responses' && hasPermission(PERMISSIONS.VIEW_RESPONSES) ? (
          /* Responses Tab */
          <ResponsesList responses={templateResponses} templates={templates} />
        ) : (
          /* Fallback for unauthorized access to responses */
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500 mb-4">You don't have permission to view responses.</p>
            <button
              onClick={() => setActiveTab('templates')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Back to Templates
            </button>
          </div>
        )}

        {/* New Template Modal */}
        {showNewTemplateModal && (
          <NewTemplateModal
            onClose={() => setShowNewTemplateModal(false)}
            onCreate={handleCreateTemplate}
            responseTypes={RESPONSE_TYPES}
          />
        )}
      </div>
    </div>
  );
};

export default Templates; 