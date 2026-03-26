export const defaultQuestions = [
  {
    id: 1,
    type: 'text-country',
    label: "Please enter your name or the name of the person for whom you are submitting this request and the country in which the request owner located?",
    fields: [
      { type: 'text', label: 'Name, role & country of the request owner', value: '' }
    ]
  },
  {
    id: 2,
    type: 'radio',
    label: "Is this project internal to our organization or does it involve any third parties?",
    options: [
      'Developing a product in-house',
      'Adopting/integrating third party AI system'
    ],
    value: ''
  },
  {
    id: 3,
    type: 'text',
    label: "From which regions do you need data for your use-case?",
    value: ''
  },
  {
    id: 4,
    type: 'textarea',
    label: "What is the intended purpose of your system?",
    placeholder: "Describe the intended purpose of your system...",
    value: ''
  },
  {
    id: 5,
    type: 'date-range',
    label: "Select a date range for when would like to start and complete the project?",
    start: '',
    end: ''
  },
  {
    id: 6,
    type: 'textarea',
    label: "Are there any factors might extend your project timeline?",
    placeholder: "Describe any potential delays or factors that might extend the timeline...",
    value: ''
  }
];

export const QUESTION_TYPES = [
  { value: 'text', label: 'Short Answer' },
  { value: 'textarea', label: 'Paragraph' },
  { value: 'radio', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' }
];

// Template type mapping based on selection
export const TEMPLATE_TYPE_MAPPING = {
  'Developing a product in-house': {
    'AI System': 'AI System',
    'Cybersecurity Management System': 'Cybersecurity Management System'
  },
  'Adopting/integrating third party AI system': {
    'Third-party AI System': 'Third-party AI System',
    'Third-party Cybersecurity System': 'Third-party Cybersecurity System'
  }
};