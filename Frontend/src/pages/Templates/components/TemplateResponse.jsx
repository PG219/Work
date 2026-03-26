import { useState, useEffect } from 'react';

const TemplateResponse = ({ template, onSave, onCancel }) => {
  const [responses, setResponses] = useState({});
  const [respondentInfo, setRespondentInfo] = useState({
    name: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize responses for all questions
  useEffect(() => {
    const initialResponses = {};
    template.questions.forEach(question => {
      if (question.responseType === 'msq') {
        initialResponses[question.id] = [];
      } else if (question.responseType === 'boolean') {
        initialResponses[question.id] = null;
      } else {
        initialResponses[question.id] = '';
      }
    });
    setResponses(initialResponses);
  }, [template]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: null
      }));
    }
  };

  const handleMSQChange = (questionId, option, checked) => {
    setResponses(prev => {
      const currentValues = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter(val => val !== option)
        };
      }
    });
  };

  const validateResponses = () => {
    const newErrors = {};

    // Validate respondent info
    if (!respondentInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!respondentInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(respondentInfo.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Validate required questions
    template.questions.forEach(question => {
      if (question.required) {
        const response = responses[question.id];
        
        if (question.responseType === 'msq') {
          if (!response || response.length === 0) {
            newErrors[question.id] = 'Please select at least one option';
          }
        } else if (question.responseType === 'boolean') {
          if (response === null) {
            newErrors[question.id] = 'Please select an option';
          }
        } else {
          if (!response || response.toString().trim() === '') {
            newErrors[question.id] = 'This field is required';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateResponses()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const responseData = {
        templateId: template.id,
        respondentInfo,
        responses,
        submittedAt: new Date().toISOString()
      };

      // Here you would typically send to your backend
      // For now, we'll just call the onSave callback
      await onSave(responseData);
    } catch (error) {
      console.error('Error saving responses:', error);
      setErrors({ submit: 'Failed to save responses. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = (question) => {
    const value = responses[question.id];
    const error = errors[question.id];

    switch (question.responseType) {
      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="3"
            placeholder="Enter your answer..."
          />
        );

      case 'numeric':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter a number..."
          />
        );

      case 'mcq':
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'msq':
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={value && value.includes(option)}
                  onChange={(e) => handleMSQChange(question.id, option, e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="true"
                checked={value === true}
                onChange={() => handleResponseChange(question.id, true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="false"
                checked={value === false}
                onChange={() => handleResponseChange(question.id, false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {template.name}
        </h2>
        {template.description && (
          <p className="text-gray-600">{template.description}</p>
        )}
      </div>

      {/* Respondent Information */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={respondentInfo.name}
              onChange={(e) => setRespondentInfo(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={respondentInfo.email}
              onChange={(e) => setRespondentInfo(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
        {template.questions.map((question, index) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {index + 1}. {question.question}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {question.responseType.toUpperCase()}
                </span>
                {question.required && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Required
                  </span>
                )}
              </div>
            </div>

            <div className="mb-2">
              {renderQuestionInput(question)}
            </div>

            {errors[question.id] && (
              <p className="text-red-500 text-sm">{errors[question.id]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Submit Responses'}
        </button>
      </div>
    </div>
  );
};

export default TemplateResponse; 