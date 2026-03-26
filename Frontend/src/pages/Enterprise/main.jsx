import React from "react";
import { QUESTION_SETS } from "../../constants/enterpriseQuestions";

function renderQuestion(question, sectionTitle, qIdx) {
  switch (question.type) {
    case "mcq":
      return (
        <div>
          <p className="mb-2">{question.q}</p>
          <div className="flex flex-col gap-1">
            {question.options.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`${sectionTitle}-${qIdx}`}
                  className="accent-blue-600"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      );
    case "short_answer":
      return (
        <div>
          <label className="mb-2 block">{question.q}</label>
          <input
            type="text"
            name={`${sectionTitle}-${qIdx}`}
            className="border rounded p-2 w-full"
          />
        </div>
      );
    case "long_answer":
      return (
        <div>
          <label className="mb-2 block">{question.q}</label>
          <textarea
            name={`${sectionTitle}-${qIdx}`}
            className="border rounded p-2 w-full"
            rows={4}
          />
        </div>
      );
    case "numerical":
      return (
        <div>
          <label className="mb-2 block">{question.q}</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name={`${sectionTitle}-${qIdx}`}
              className="border rounded p-2 w-32"
            />
            {question.unit && <span className="text-gray-500">{question.unit}</span>}
          </div>
        </div>
      );
    default:
      return <p>Unsupported question type</p>;
  }
}

const Enterprise = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Enterprise AI Readiness</h1>
      <div className="bg-white p-6 rounded-xl shadow-xl border-t-gray-400">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">AI Readiness Assessment</h2>
          <p className="text-gray-600">
            Complete the questionnaire below to assess your organization's readiness.
          </p>
          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg mt-3 text-sm border border-blue-200">
            ℹ️ This assessment will help identify areas for AI governance and compliance.
          </div>
        </div>
        {Object.values(QUESTION_SETS).map((sectionArray, index) =>
          sectionArray.map((section, idx) => (
            <div key={`${index}-${idx}`} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              {section.questions.map((q, qIdx) => (
                <div key={qIdx} className="mb-4">
                  {renderQuestion(q, section.title, qIdx)}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Enterprise;
