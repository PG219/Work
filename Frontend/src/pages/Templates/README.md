# Templates Page

This page allows users to manage and create assessment templates for AI governance.

## Features

### Template List View
- Displays all available templates in a grid layout
- Shows template name, description, and question count
- Click on a template to view its associated questions
- Visual indicators for selected templates

### Template Details
- When a template is selected, shows all questions below the grid
- Displays question text, response type, and options (if applicable)
- Shows whether questions are required or optional

### Create New Template
- "New Template" button opens a modal for template creation
- Users can enter template name and description
- Add multiple questions with different response types:
  - **Text Answer**: Free text input
  - **Numeric**: Number input
  - **Multiple Choice (MCQ)**: Single selection from options
  - **Multiple Select (MSQ)**: Multiple selections from options
  - **Boolean (Yes/No)**: True/False selection
- For MCQ and MSQ questions, users can add custom options
- Questions can be marked as required or optional
- Remove questions or options as needed

## File Structure

```
src/pages/Templates/
├── main.jsx                 # Main Templates page component
├── components/
│   ├── TemplateItem.jsx     # Individual template card component
│   └── NewTemplateModal.jsx # Modal for creating new templates
└── README.md               # This documentation
```

## Data Structure

Templates are stored in `src/constants/templates.js` with the following structure:

```javascript
{
  id: number,
  name: string,
  description: string,
  questions: [
    {
      id: number,
      question: string,
      responseType: 'text' | 'numeric' | 'mcq' | 'msq' | 'boolean',
      required: boolean,
      options?: string[] // For MCQ and MSQ questions
    }
  ]
}
```

## Usage

1. Navigate to the Templates page from the sidebar
2. View existing templates by clicking on them
3. Create new templates using the "New Template" button
4. Add questions with appropriate response types
5. Save the template to see it in the list

## State Management

Currently, templates are stored in component state. In a production environment, this would be connected to a backend API for persistence. 