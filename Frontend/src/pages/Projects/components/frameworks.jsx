import { useState } from "react";

// --- Framework Data ---
const frameworks = [
  {
    id: "eu",
    logo: "AIA",
    title: "EU AI Act",
    description: "European Artificial Intelligence Act",
    status: "Enabled",
    details: {
      sections: [
        {
          key: "organizationalPolicies",
          title: "Organizational Policies",
          completed: 2,
          total: 7,
          color: "bg-emerald-500",
        },
        {
          key: "useCaseQuestions",
          title: "Use Case Questions",
          completed: 12,
          total: 19,
          color: "bg-blue-500",
        },
      ],
    },
  },
  {
    id: "nist",
    logo: "NIST",
    title: "NIST AI RMF",
    description:
      "National Institute of Standards and Technology Artificial Intelligence Risk Management Framework",
    status: "Enabled",
  },
  {
    id: "col",
    logo: "COL",
    title: "Colorado Life Insurance Regulation",
    description:
      "Governance and RMF Requirements for ECDIS, Algorithms, and Predictive Models",
    status: "Enabled",
  },
  {
    id: "iso",
    logo: "ISO",
    title: "ISO 42001 Standard",
    description:
      "ISO Standard for implementing and maintaining Artificial Intelligence Management Systems",
    status: "Enabled",
  },
  {
    id: "adc1",
    logo: "ADC",
    title: "Additional Framework 1",
    description: "Description for the first additional framework.",
    status: "Additional",
  },
];

// --- Progress Row ---
const FrameworkProgressRow = ({ section }) => {
  const pct = Math.round((section.completed / section.total) * 100);
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{section.title}</span>
        <span>
          {section.completed}/{section.total} ({pct}%)
        </span>
      </div>
      <div className="relative mt-1 w-full h-2 bg-gray-200 rounded">
        <div
          className={`h-2 rounded ${section.color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// --- Frameworks List ---
const FrameworksList = ({ frameworks, onSelect }) => {
  const enabledFrameworks = frameworks.filter((f) => f.status === "Enabled");
  const additionalFrameworks = frameworks.filter(
    (f) => f.status === "Additional"
  );

  const renderFrameworkCard = (fw) => (
    <div
      key={fw.id}
      onClick={() => onSelect(fw)}
      className="p-4 flex justify-between bg-white border rounded-lg shadow-sm hover:shadow-md cursor-pointer transition mb-4"
    >
      <div className="flex items-center mb-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-700 font-bold mr-4">
          {fw.logo}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{fw.title}</h3>
          <p className="text-sm text-gray-600">{fw.description}</p>
        </div>
      </div>

      {/* Show progress rows if details exist */}
      {fw.details?.sections && (
        <div className="mt-2">
          {fw.details.sections.map((section) => (
            <FrameworkProgressRow key={section.key} section={section} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <h2 className="text-xl text-gray-700 font-semibold mb-2">
        Enabled ({enabledFrameworks.length})
      </h2>
      {enabledFrameworks.map(renderFrameworkCard)}

      {additionalFrameworks.length > 0 && (
        <>
          <hr className="my-6" />
          <h2 className="text-xl text-gray-700 font-semibold mb-2">
            Additional ({additionalFrameworks.length})
          </h2>
          {additionalFrameworks.map(renderFrameworkCard)}
        </>
      )}
    </>
  );
};

// --- Framework Detail (placeholder) ---
const FrameworkDetail = ({ framework, onBack }) => {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:underline mb-4"
      >
        ← Frameworks
      </button>

      <div className="mb-4">
        <h2 className="text-2xl font-bold">{framework.title}</h2>
        <p className="text-gray-600">{framework.description}</p>
      </div>

      {/* You can add more detail view data here */}
      <p className="text-gray-500 italic">More detailed content goes here…</p>
    </div>
  );
};

// --- Main Page ---
const Frameworks = () => {
  const [selectedFramework, setSelectedFramework] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {!selectedFramework ? (
        <>
          <h1 className="text-3xl font-bold mb-6">Frameworks</h1>
          <FrameworksList
            frameworks={frameworks}
            onSelect={setSelectedFramework}
          />
        </>
      ) : (
        <FrameworkDetail
          framework={selectedFramework}
          onBack={() => setSelectedFramework(null)}
        />
      )}
    </div>
  );
};

export default Frameworks;
