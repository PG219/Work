import { useState } from 'react';

const ResponsesList = ({ responses, templates }) => {
  const [selectedResponse, setSelectedResponse] = useState(null);

  const getTemplateName = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : 'Unknown Template';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderResponseValue = (question, response) => {
    const value = response.responses[question.id];
    
    if (!value) return <span className="text-gray-400">No response</span>;

    switch (question.responseType) {
      case 'text':
        return <span className="text-gray-900">{value}</span>;
      
      case 'numeric':
        return <span className="text-gray-900 font-mono">{value}</span>;
      
      case 'boolean':
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      
      case 'mcq':
        return <span className="text-gray-900">{value}</span>;
      
      case 'msq':
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((option, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
              >
                {option}
              </span>
            ))}
          </div>
        );
      
      default:
        return <span className="text-gray-900">{String(value)}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Template Responses</h2>
        <span className="text-sm text-gray-500">
          {responses.length} response{responses.length !== 1 ? 's' : ''}
        </span>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
          <p className="text-gray-500">Start filling out templates to see responses here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {responses.map((response) => (
            <div
              key={response.id}
              className={`bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedResponse?.id === response.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedResponse(selectedResponse?.id === response.id ? null : response)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getTemplateName(response.templateId)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Submitted by {response.respondentInfo.name} ({response.respondentInfo.email})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Submitted
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(response.submittedAt)}
                    </span>
                  </div>
                </div>

                {/* Response Details */}
                {selectedResponse?.id === response.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-3">Response Details:</h4>
                    <div className="space-y-3">
                      {templates
                        .find(t => t.id === response.templateId)
                        ?.questions.map((question, index) => (
                          <div key={question.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900 text-sm">
                                {index + 1}. {question.question}
                              </h5>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {question.responseType.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm">
                              {renderResponseValue(question, response)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Response ID: {response.id}</span>
                    <span className="text-blue-600 font-medium">
                      {selectedResponse?.id === response.id ? 'Expanded' : 'Click to expand'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponsesList; 