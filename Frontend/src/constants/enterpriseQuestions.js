// src/constants/enterpriseQuestions.js
export const QUESTION_SETS = {
  governance: [
    {
      title: "1. AI Governance",
      questions: [
        {
          q: "Does your organization have a formal AI governance structure?",
          type: "mcq",
          options: ["Yes", "Partially", "No"],
        },
        {
          q: "Please describe your AI governance structure.",
          type: "long_answer",
        },
      ],
    },
  ],
  risk: [
    {
      title: "2. Risk Management",
      questions: [
        {
          q: "Does your organization conduct AI risk assessments?",
          type: "mcq",
          options: ["Yes, for all AI systems", "Only for some systems", "No"],
        },
        {
          q: "How often do you conduct risk assessments?",
          type: "numerical",
          unit: "times per year",
        },
      ],
    },
  ],
  compliance: [
    {
      title: "3. Compliance",
      questions: [
        {
          q: "Is your organization familiar with AI regulations applicable to your industry?",
          type: "mcq",
          options: ["Yes, very familiar", "Somewhat familiar", "Not familiar"],
        },
        {
          q: "Do you maintain documentation of AI systems for compliance purposes?",
          type: "mcq",
          options: [
            "Yes, comprehensive",
            "Partial documentation",
            "No documentation",
          ],
        },
      ],
    },
  ],
  technical: [
    {
      title: "4. Technical Capabilities",
      questions: [
        {
          q: "Does your organization have the technical expertise to evaluate AI systems?",
          type: "mcq",
          options: ["Yes", "Limited expertise", "No"],
        },
        {
          q: "Are there processes in place to test AI systems for bias and fairness?",
          type: "short_answer",
        },
      ],
    },
  ],
};
