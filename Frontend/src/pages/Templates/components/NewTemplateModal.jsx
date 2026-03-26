import { useState } from 'react';
import { TEMPLATE_TYPES } from '../../../constants/templates';

const NewTemplateModal = ({ onClose, onCreate, responseTypes }) => {
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    templateType: 'AI System',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    responseType: 'text',
    required: true,
    options: []
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newOption, setNewOption] = useState('');

  const handleAddQuestion = () => {
    if (currentQuestion.question.trim()) {
      const questionWithId = {
        ...currentQuestion,
        id: templateData.questions.length + 1
      };
      
      setTemplateData({
        ...templateData,
        questions: [...templateData.questions, questionWithId]
      });
      
      setCurrentQuestion({
        question: '',
        responseType: 'text',
        required: true,
        options: []
      });
      setShowQuestionForm(false);
    }
  };

  const handleAddOption = () => {
    if (newOption.trim() && !currentQuestion.options.includes(newOption.trim())) {
      setCurrentQuestion({
        ...currentQuestion,
        options: [...currentQuestion.options, newOption.trim()]
      });
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.filter((_, i) => i !== index)
    });
  };

  const handleRemoveQuestion = (index) => {
    setTemplateData({
      ...templateData,
      questions: templateData.questions.filter((_, i) => i !== index)
    });
  };

  const handleCreateTemplate = () => {
    if (templateData.name.trim() && templateData.questions.length > 0) {
      onCreate(templateData);
    }
  };

  const canCreate = templateData.name.trim() && templateData.questions.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Template</h2>
                <p className="text-gray-600 text-sm">Design your assessment template with custom questions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Template Basic Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Template Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateData.name}
                    onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type *
                  </label>
                  <select
                    value={templateData.templateType}
                    onChange={(e) => setTemplateData({ ...templateData, templateType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {TEMPLATE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={templateData.description}
                  onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  rows="3"
                  placeholder="Enter template description"
                />
              </div>
            </div>

            {/* Questions Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {templateData.questions.length} added
                  </span>
                </div>
                <button
                  onClick={() => setShowQuestionForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Question
                </button>
              </div>

              {/* Questions List */}
              {templateData.questions.length > 0 && (
                <div className="space-y-4">
                  {templateData.questions.map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">
                                {question.question}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {responseTypes.find(type => type.value === question.responseType)?.label}
                                </span>
                                {question.required ? (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                    Required
                                  </span>
                                ) : (
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                    Optional
                                  </span>
                                )}
                              </div>
                              {question.options && question.options.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs text-gray-600 mb-2">Options:</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {question.options.map((option, optIndex) => (
                                      <div
                                        key={optIndex}
                                        className="text-xs bg-gray-50 text-gray-700 px-3 py-2 rounded border"
                                      >
                                        {option}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-red-600 hover:text-red-800 ml-2 p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {templateData.questions.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first question.</p>
                </div>
              )}

              {/* Add Question Form */}
              {showQuestionForm && (
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900">Add New Question</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        rows="3"
                        placeholder="Enter your question"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Response Type *
                        </label>
                        <select
                          value={currentQuestion.responseType}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, responseType: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          {responseTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center h-full">
                        <div className="flex items-center h-12">
                          <input
                            type="checkbox"
                            id="required"
                            checked={currentQuestion.required}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, required: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                            This question is required
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Options for MCQ and MSQ */}
                    {(currentQuestion.responseType === 'mcq' || currentQuestion.responseType === 'msq') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options *
                        </label>
                        <div className="space-y-2">
                          {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 w-6">{index + 1}.</span>
                              <span className="flex-1 text-sm bg-white px-3 py-2 border border-gray-300 rounded-lg">
                                {option}
                              </span>
                              <button
                                onClick={() => handleRemoveOption(index)}
                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 w-6">{currentQuestion.options.length + 1}.</span>
                            <input
                              type="text"
                              value={newOption}
                              onChange={(e) => setNewOption(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="Add new option"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                            />
                            <button
                              onClick={handleAddOption}
                              disabled={!newOption.trim()}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleAddQuestion}
                        disabled={!currentQuestion.question.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Question
                      </button>
                      <button
                        onClick={() => setShowQuestionForm(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {templateData.questions.length > 0 ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {templateData.questions.length} question{templateData.questions.length !== 1 ? 's' : ''} added
                </span>
              ) : (
                <span className="text-gray-500">No questions added yet</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!canCreate}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTemplateModal; 