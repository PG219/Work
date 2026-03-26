export const RESPONSE_TYPES = [
  { value: 'text', label: 'Text Answer' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'mcq', label: 'Multiple Choice (Single Answer - MCQ)' },
  { value: 'msq', label: 'Multiple Select (MSQ)' },
  { value: 'boolean', label: 'Boolean (Yes/No)' }
];

export const TEMPLATE_TYPES = [
  { value: 'AI System', label: 'AI System' },
  { value: 'Cybersecurity Management System', label: 'Cybersecurity Management System' },
  { value: 'Third-party AI System', label: 'Third-party AI System' },
  { value: 'Third-party Cybersecurity System', label: 'Third-party Cybersecurity System' }
];

export const sampleTemplates = [
  {
    id: 1,
    name: "AI Product Use-case Assessment",
    description: "Comprehensive assessment for AI product development including model safety, risk analysis, and monitoring",
    templateType: "AI System",
    questions: [
      {
        id: 1,
        question: "Which AI model(s) will be used?",
        responseType: "text",
        required: true
      },
      {
        id: 2,
        question: "Link to, or copy of, the terms under which each of the AI model(s) used are licensed.",
        responseType: "text",
        required: true
      },
      {
        id: 3,
        question: "Will the input data provided by our organization be used for training AI models?",
        responseType: "boolean",
        required: true
      },
      {
        id: 4,
        question: "Any other documentation that you might have available providing information on the model and the intended uses.",
        responseType: "text",
        required: false
      },
      {
        id: 5,
        question: "If applicable, how (if at all) the model has been trained (fine-tuned) or prompt tuned (prompt engineered), and how the training or tuning was evaluated.",
        responseType: "text",
        required: false
      },
      {
        id: 6,
        question: "Time period data is retained in the model (in hours/days).",
        responseType: "text",
        required: true
      },
      {
        id: 7,
        question: "Documented model safety and risk analysis based on potential for unintended uses.",
        responseType: "text",
        required: true
      },
      {
        id: 8,
        question: "Documented pre-deployment effectiveness testing for the intended use cases identified above.",
        responseType: "text",
        required: true
      },
      {
        id: 9,
        question: "Documented pre-deployment safety and risk testing for potential risks and harms associated with the model.",
        responseType: "text",
        required: true
      },
      {
        id: 10,
        question: "Information on how the models provide transparency and explainability as part of the output. (This includes how the output was generated, and what material/data were used.)",
        responseType: "text",
        required: true
      },
      {
        id: 11,
        question: "How the AI model is monitored on an ongoing basis for performance and accuracy.",
        responseType: "text",
        required: true
      },
      {
        id: 12,
        question: "What are the data sources (data supply chain)? Are they trusted?",
        responseType: "text",
        required: true
      },
      {
        id: 13,
        question: "Are there any controls/guardrails implemented to protect the AI system from prompt injection attacks (AI-specific attacks)?",
        responseType: "boolean",
        required: true
      },
      {
        id: 14,
        question: "Do you have a penetration testing and/or vulnerability assessment process for the AI system?",
        responseType: "boolean",
        required: true
      },
      {
        id: 15,
        question: "Are prompts and AI-generated content sanitized or validated?",
        responseType: "boolean",
        required: true
      },
      {
        id: 16,
        question: "Are model, agent, or AI interactions monitored?",
        responseType: "boolean",
        required: true
      },
      {
        id: 17,
        question: "Are there any AI incident response plans in place?",
        responseType: "boolean",
        required: true
      }
    ]
  },
  {
    id: 2,
    name: "Third-party AI Security Assessment",
    description: "Comprehensive security assessment for third-party AI systems",
    templateType: "Third-party AI System",
    questions: [
      {
        id: 1,
        question: "How do you safeguard deployed AI models against risks like model inversion, tampering, or theft?",
        responseType: "text",
        required: true
      },
      {
        id: 2,
        question: "Are there established procedures to intervene manually in high-impact AI decisions, especially those involving personal or sensitive data?",
        responseType: "boolean",
        required: true
      },
      {
        id: 3,
        question: "Do you have controls in place to ensure AI-generated outputs are accessible and understandable to external, non-technical stakeholders?",
        responseType: "boolean",
        required: true
      },
      {
        id: 4,
        question: "Is your organization actively integrating AI-specific threat intelligence into its broader security monitoring framework?",
        responseType: "boolean",
        required: true
      },
      {
        id: 5,
        question: "What strategies are used to ensure that your AI systems remain transparent and explainable to both technical and business teams?",
        responseType: "text",
        required: true
      },
      {
        id: 6,
        question: "Do you implement version control and rollback mechanisms for your AI models to prevent unintentional changes or failures during updates?",
        responseType: "boolean",
        required: true
      },
      {
        id: 7,
        question: "How do you verify the quality and trustworthiness of data inputs, and what measures are in place to detect adversarial or poisoned data?",
        responseType: "text",
        required: true
      },
      {
        id: 8,
        question: "Are AI systems continuously observed for anomalies, biased behavior, or security-related events after deployment?",
        responseType: "boolean",
        required: true
      },
      {
        id: 9,
        question: "Is a dedicated AI incident response plan in place, and how quickly are clients or partners informed in the event of an incident?",
        responseType: "text",
        required: true
      },
      {
        id: 10,
        question: "What methods are used to test your models for bias prior to deployment, particularly in regulated or high-risk domains?",
        responseType: "text",
        required: true
      },
      {
        id: 11,
        question: "Have you conducted formal bias audits, and do you maintain a remediation process for identified issues?",
        responseType: "boolean",
        required: true
      },
      {
        id: 12,
        question: "Do you support deactivation or emergency shutdown mechanisms for your AI systems in case of critical system failures?",
        responseType: "boolean",
        required: true
      },
      {
        id: 13,
        question: "Is role-based access control (RBAC) enforced across all teams interacting with AI infrastructure and data pipelines?",
        responseType: "boolean",
        required: true
      },
      {
        id: 14,
        question: "Do you maintain detailed documentation that outlines the decision-making process of your AI models for audit or regulatory review?",
        responseType: "boolean",
        required: true
      },
      {
        id: 15,
        question: "Are adversarial stress tests conducted to evaluate the robustness of your AI systems against malicious prompts or manipulation attempts?",
        responseType: "boolean",
        required: true
      },
      {
        id: 16,
        question: "How are encryption, data masking, and anonymization applied to protect personal or regulated data in your AI workflows?",
        responseType: "text",
        required: true
      },
      {
        id: 17,
        question: "Are deployed AI models isolated in secure environments to prevent unauthorized access or interference?",
        responseType: "boolean",
        required: true
      },
      {
        id: 18,
        question: "What techniques do you use to validate or sanitize prompts and outputs to ensure safe and appropriate AI behavior?",
        responseType: "text",
        required: true
      }
    ]
  },
  {
    id: 3,
    name: "Third-party Security Assessment",
    description: "Comprehensive security assessment for third-party vendors and systems",
    templateType: "Third-party Cybersecurity System",
    questions: [
      {
        id: 1,
        question: "Does your org have a documented information security policy?",
        responseType: "boolean",
        required: true
      },
      {
        id: 2,
        question: "Vendor security policy?",
        responseType: "boolean",
        required: true
      },
      {
        id: 3,
        question: "For your current or proposed engagement with our org are there any dependencies on critical third party service providers?",
        responseType: "boolean",
        required: true
      },
      {
        id: 4,
        question: "Do you have data protection policy or standard in place?",
        responseType: "boolean",
        required: true
      },
      {
        id: 5,
        question: "Do you have risk management framework in place?",
        responseType: "boolean",
        required: true
      },
      {
        id: 6,
        question: "Do you conduct security assessments of third parties? If so, provide evidence of your third party reviews.",
        responseType: "text",
        required: true
      },
      {
        id: 7,
        question: "Will be third parties receiving our data?",
        responseType: "boolean",
        required: true
      },
      {
        id: 8,
        question: "Do you conduct reviews of your security policies and procedure annually?",
        responseType: "boolean",
        required: true
      },
      {
        id: 9,
        question: "How frequently update your risk management framework?",
        responseType: "text",
        required: true
      },
      {
        id: 10,
        question: "Do you conduct and require annual security awareness training for all contracts and employees?",
        responseType: "boolean",
        required: true
      },
      {
        id: 11,
        question: "Do you maintain an inventory of all assets, regualry review and update?",
        responseType: "boolean",
        required: true
      },
      {
        id: 12,
        question: "Do you have process for classifying and handling assets?",
        responseType: "boolean",
        required: true
      },
      {
        id: 13,
        question: "Do you have procedure of secure disposal?",
        responseType: "boolean",
        required: true
      },
      {
        id: 14,
        question: "Are all endpoints that connect directly to production networks centrally managed?",
        responseType: "boolean",
        required: true
      },
      {
        id: 15,
        question: "Does both standard and employee issued device security configuration/feature and required BYOD configs?",
        responseType: "boolean",
        required: true
      },
      {
        id: 16,
        question: "Do you have IAM system?",
        responseType: "boolean",
        required: true
      },
      {
        id: 17,
        question: "Do you have PAM?",
        responseType: "boolean",
        required: true
      },
      {
        id: 18,
        question: "Do you enforce MFA?",
        responseType: "boolean",
        required: true
      },
      {
        id: 19,
        question: "What is the frequency of your access reviews?",
        responseType: "text",
        required: true
      },
      {
        id: 20,
        question: "Do you have process to manage third party access?",
        responseType: "boolean",
        required: true
      },
      {
        id: 21,
        question: "Does your org apply deny-by-exception policy to prevent the use of unauthorized software?",
        responseType: "boolean",
        required: true
      },
      {
        id: 22,
        question: "Do you have SIEM in place?",
        responseType: "boolean",
        required: true
      },
      {
        id: 23,
        question: "Do you have incident response?",
        responseType: "boolean",
        required: true
      },
      {
        id: 24,
        question: "Do you conduct regular vulernabilty scans?",
        responseType: "boolean",
        required: true
      },
      {
        id: 25,
        question: "Do you have threat intelligence in palce?",
        responseType: "boolean",
        required: true
      },
      {
        id: 26,
        question: "Do you have process for handling zero-day attacks?",
        responseType: "boolean",
        required: true
      }
    ]
  },
  {
    id: 4,
    name: "Cybersecurity Management Assessment",
    description: "Comprehensive cybersecurity management assessment covering threat modeling, data protection, and security controls",
    templateType: "Cybersecurity Management System",
    questions: [
      {
        id: 1,
        question: "Have you performed threat modeling for the system? What risks were identified and how were they mitigated?",
        responseType: "text",
        required: true
      },
      {
        id: 2,
        question: "How is sensitive data (e.g., PII, credentials, financial data) stored and protected at rest and in transit?",
        responseType: "text",
        required: true
      },
      {
        id: 3,
        question: "Are input validation and output encoding implemented to prevent injection attacks (e.g., SQLi, XSS)?",
        responseType: "boolean",
        required: true
      },
      {
        id: 4,
        question: "Is file upload functionality (if any) protected against malware, file type spoofing, and excessive size uploads?",
        responseType: "boolean",
        required: true
      },
      {
        id: 5,
        question: "Are cryptographic functions (e.g., hashing, encryption) implemented using industry-standard libraries and algorithms?",
        responseType: "boolean",
        required: true
      },
      {
        id: 6,
        question: "Are secrets (e.g., API keys, DB passwords) stored securely (e.g., not hard-coded or in source control)?",
        responseType: "boolean",
        required: true
      },
      {
        id: 7,
        question: "Is authentication implemented using secure protocols (e.g., OAuth2, SAML, OpenID Connect)?",
        responseType: "boolean",
        required: true
      },
      {
        id: 8,
        question: "Are password policies enforced (e.g., length, complexity, expiration)?",
        responseType: "boolean",
        required: true
      },
      {
        id: 9,
        question: "Are multi-factor authentication (MFA) mechanisms in place for privileged access?",
        responseType: "boolean",
        required: true
      },
      {
        id: 10,
        question: "Is role-based access control (RBAC) or attribute-based access control (ABAC) implemented?",
        responseType: "boolean",
        required: true
      },
      {
        id: 11,
        question: "Are authorization checks enforced both at the API and UI layers?",
        responseType: "boolean",
        required: true
      },
      {
        id: 12,
        question: "Is the application hosted on a secure and patched operating system or container?",
        responseType: "boolean",
        required: true
      },
      {
        id: 13,
        question: "Are network communications secured using TLS/SSL?",
        responseType: "boolean",
        required: true
      },
      {
        id: 14,
        question: "Are unused ports and services disabled on all production environments?",
        responseType: "boolean",
        required: true
      },
      {
        id: 15,
        question: "Is the CI/CD pipeline configured to perform security scans (e.g., SAST, DAST, dependency scans)?",
        responseType: "boolean",
        required: true
      },
      {
        id: 16,
        question: "Are container images (if used) scanned for vulnerabilities before deployment?",
        responseType: "boolean",
        required: true
      },
      {
        id: 17,
        question: "Are access logs, error logs, and security logs generated and stored securely?",
        responseType: "boolean",
        required: true
      },
      {
        id: 18,
        question: "Is logging implemented in a way that avoids storing sensitive data in plaintext?",
        responseType: "boolean",
        required: true
      },
      {
        id: 19,
        question: "Are log files monitored for unusual or unauthorized activity?",
        responseType: "boolean",
        required: true
      },
      {
        id: 20,
        question: "Is user and admin activity auditable and traceable?",
        responseType: "boolean",
        required: true
      },
      {
        id: 21,
        question: "Is there an incident response plan in place specific to this application or service?",
        responseType: "boolean",
        required: true
      },
      {
        id: 22,
        question: "How are security incidents detected, reported, and escalated?",
        responseType: "text",
        required: true
      },
      {
        id: 23,
        question: "Are backups taken regularly and tested for restoration?",
        responseType: "boolean",
        required: true
      },
      {
        id: 24,
        question: "Are disaster recovery and business continuity plans documented and tested?",
        responseType: "boolean",
        required: true
      },
      {
        id: 25,
        question: "Are developers trained in secure coding practices?",
        responseType: "boolean",
        required: true
      },
      {
        id: 26,
        question: "Is code reviewed manually and/or using automated static analysis tools?",
        responseType: "boolean",
        required: true
      },
      {
        id: 27,
        question: "Are dependencies regularly checked and updated to patch known vulnerabilities?",
        responseType: "boolean",
        required: true
      },
      {
        id: 28,
        question: "Are security requirements incorporated into each stage of the SDLC (requirements, design, implementation, testing)?",
        responseType: "boolean",
        required: true
      },
      {
        id: 29,
        question: "Is the system compliant with relevant security standards or regulations (e.g., ISO 27001, GDPR, HIPAA)?",
        responseType: "boolean",
        required: true
      },
      {
        id: 30,
        question: "Are data retention and deletion policies clearly defined and enforced?",
        responseType: "boolean",
        required: true
      }
    ]
  }
]; 