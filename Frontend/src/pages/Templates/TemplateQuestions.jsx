import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RESPONSE_TYPES } from '../../constants/templates';
import templateService from '../../services/templateService';
import { useAuth } from '../../contexts/AuthContext';

const TemplateQuestions = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const data = await templateService.getTemplate(templateId);
      setTemplate(data);
    } catch (error) {
      console.error('Error loading template:', error);
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/templates');
  };

  const handleStartResponse = () => {
    navigate('/templates', { 
      state: { 
        selectedTemplate: template,
        showResponseForm: true 
      } 
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading template questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Template</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Back to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Template Not Found</h3>
            <p className="text-gray-500 mb-4">The requested template could not be found.</p>
            <button
              onClick={handleBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Back to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Templates
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {template.templateType && (
              <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                {template.templateType}
              </span>
            )}
          </div>
        </div>

        {/* Template Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Template Type</h3>
              <p className="text-lg font-semibold text-gray-900">{template.templateType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Questions</h3>
              <p className="text-lg font-semibold text-gray-900">{template.questions.length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="text-lg font-semibold text-gray-900">
                {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Template Questions</h2>
            <p className="text-gray-600 mt-1">Review all questions in this template</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {template.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {question.question}
                        </h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            {RESPONSE_TYPES.find(type => type.value === question.responseType)?.label}
                          </span>
                          {question.required && (
                            <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full">
                              Required
                            </span>
                          )}
                          {!question.required && (
                            <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                              Optional
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {question.options && question.options.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Options:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="text-sm bg-gray-50 text-gray-700 px-3 py-2 rounded border"
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TemplateQuestions; 