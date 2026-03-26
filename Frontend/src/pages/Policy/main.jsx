const policies = [
  {
    title: "Responsible AI Development",
    description:
      "Our organization is committed to developing AI systems that are fair, transparent, and accountable. All AI development must follow our ethical guidelines and undergo regular review.",
    link: "#",
  },
  {
    title: "Data Privacy and Protection",
    description:
      "All AI systems must comply with data protection regulations including GDPR. Personal data used for AI training and operation must be properly anonymized and secured.",
    link: "#",
  },
  {
    title: "AI Risk Assessment",
    description:
      "Every AI system must undergo a comprehensive risk assessment before deployment. High-risk systems require additional oversight and continuous monitoring.",
    link: "#",
  },
  {
    title: "Human Oversight",
    description:
      "All AI systems must maintain appropriate levels of human oversight. Critical decisions should not be fully automated without human review capabilities.",
    link: "#",
  },
  {
    title: "Transparency and Explainability",
    description:
      "AI systems should be designed to provide explanations for their decisions when possible. Users must be informed when they are interacting with AI systems.",
    link: "#",
  },
];

const Policies = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto">
        <h1 className="font-bold text-3xl md:text-4xl mb-2">
          AI Policies
        </h1>
        <p className="text-gray-600 mb-8">
          Company AI Governance Policies
        </p>
        <div className="flex flex-col gap-6">
          {policies.map((policy, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition flex flex-col gap-2 p-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-8 bg-blue-500 rounded-full mr-4"></div>
                <h2 className="font-semibold text-lg text-gray-900">{policy.title}</h2>
              </div>
              <p className="text-gray-600 mt-2">{policy.description}</p>
              <a
                href={policy.link}
                className="text-blue-600 hover:text-blue-800 font-medium mt-2 w-max transition"
              >
                Read Full Policy &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Policies;
