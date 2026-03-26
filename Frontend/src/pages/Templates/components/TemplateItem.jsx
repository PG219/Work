import { useNavigate } from 'react-router-dom';

const TemplateItem = ({ template, isSelected, onSelect, onStartResponse }) => {
  const navigate = useNavigate();

  const handleViewQuestions = (e) => {
    e.stopPropagation();
    navigate(`/templates/${template.id}`);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(template)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {template.name}
            </h3>
            {template.templateType && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full mt-1 inline-block">
                {template.templateType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {template.questions.length} questions
            </span>
            {isSelected && (
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
        
        {template.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {template.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1">
          {template.questions.slice(0, 3).map((question, index) => (
            <span
              key={index}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
            >
              {question.responseType}
            </span>
          ))}
          {template.questions.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              +{template.questions.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Template ID: {template.id}</span>
            <div className="flex gap-2">
              <button
                onClick={handleViewQuestions}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
              >
                View Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateItem; 