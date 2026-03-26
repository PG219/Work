import express from 'express';
import Template from '../models/Template.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Manual seed endpoint (for debugging - remove in production)
router.post('/seed', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Import seed data
    const { default: seedData } = await import('../seedData.js');
    await seedData();
    
    const count = await Template.countDocuments({ isActive: true });
    res.json({ 
      message: 'Templates seeded successfully', 
      count 
    });
  } catch (error) {
    console.error('Error seeding templates:', error);
    res.status(500).json({ error: 'Failed to seed templates' });
  }
});

// Test endpoint to check template count (for debugging)
router.get('/test/count', authenticateToken, async (req, res) => {
  try {
    const count = await Template.countDocuments({ isActive: true });
    const templates = await Template.find({ isActive: true }).select('name templateType');
    
    res.json({
      count,
      templates: templates.map(t => ({ name: t.name, templateType: t.templateType }))
    });
  } catch (error) {
    console.error('Error checking template count:', error);
    res.status(500).json({ error: 'Failed to check template count' });
  }
});

// Get all templates (authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const templates = await Template.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform the data to match frontend expectations
    const transformedTemplates = templates.map(template => ({
      id: template._id,
      name: template.name,
      description: template.description,
      templateType: template.templateType,
      questions: template.questions.map(q => ({
        id: q._id,
        question: q.questionText, // Keep both for compatibility
        questionText: q.questionText,
        responseType: q.responseType,
        required: q.isRequired,
        isRequired: q.isRequired,
        options: q.options ? q.options.map(opt => opt.optionText) : []
      })),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }));
    
    res.json(transformedTemplates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get template by ID (authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await Template.findOne({ _id: id, isActive: true }).lean();
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Transform the data to match frontend expectations
    const transformedTemplate = {
      id: template._id,
      name: template.name,
      description: template.description,
      templateType: template.templateType,
      questions: template.questions.map(q => ({
        id: q._id,
        question: q.questionText, // Keep both for compatibility
        questionText: q.questionText,
        responseType: q.responseType,
        required: q.isRequired,
        isRequired: q.isRequired,
        options: q.options ? q.options.map(opt => opt.optionText) : []
      })),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
    
    res.json(transformedTemplate);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create new template (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, templateType, questions } = req.body;
    const createdBy = req.user._id;
    
    // Transform questions to match MongoDB schema
    const transformedQuestions = questions.map((question, index) => ({
      questionText: question.question,
      responseType: question.responseType,
      isRequired: question.required,
      questionOrder: index + 1,
      options: question.options ? question.options.map((option, optIndex) => ({
        optionText: option,
        optionOrder: optIndex + 1
      })) : []
    }));
    
    const template = new Template({
      name,
      description,
      templateType,
      questions: transformedQuestions,
      createdBy
    });
    
    const savedTemplate = await template.save();
    
    // Transform the response to match frontend expectations
    const responseTemplate = {
      id: savedTemplate._id,
      name: savedTemplate.name,
      description: savedTemplate.description,
      templateType: savedTemplate.templateType,
      questions: savedTemplate.questions.map(q => ({
        id: q._id,
        question: q.questionText,
        responseType: q.responseType,
        required: q.isRequired,
        options: q.options ? q.options.map(opt => opt.optionText) : []
      })),
      createdAt: savedTemplate.createdAt,
      updatedAt: savedTemplate.updatedAt
    };
    
    res.status(201).json(responseTemplate);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, templateType, questions } = req.body;
    
    // Transform questions to match MongoDB schema
    const transformedQuestions = questions.map((question, index) => ({
      questionText: question.question,
      responseType: question.responseType,
      isRequired: question.required,
      questionOrder: index + 1,
      options: question.options ? question.options.map((option, optIndex) => ({
        optionText: option,
        optionOrder: optIndex + 1
      })) : []
    }));
    
    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      {
        name,
        description,
        templateType,
        questions: transformedQuestions,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ message: 'Template updated successfully' });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template (soft delete) (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedTemplate = await Template.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!deletedTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router; 