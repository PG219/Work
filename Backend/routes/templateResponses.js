import express from 'express';
import TemplateResponse from '../models/TemplateResponse.js';
import Template from '../models/Template.js';
import { authenticateToken, requireAdmin, requireAdminOrOwner } from '../middleware/auth.js';

const router = express.Router();

// Get all responses (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const responses = await TemplateResponse.find()
      .populate('templateId', 'name description')
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform the data to match frontend expectations
    const transformedResponses = responses.map(response => ({
      id: response._id,
      templateId: response.templateId._id,
      templateName: response.templateId.name,
      respondentInfo: {
        name: response.respondentName,
        email: response.respondentEmail
      },
      status: response.status,
      submittedAt: response.submittedAt,
      responses: response.responses.reduce((acc, resp) => {
        acc[resp.questionId] = resp.answerText || resp.answerNumeric || resp.answerBoolean || resp.selectedOptions;
        return acc;
      }, {}),
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    }));
    
    res.json(transformedResponses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Get responses by template ID (authenticated users)
router.get('/template/:templateId', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const responses = await TemplateResponse.find({ templateId })
      .populate('templateId', 'name description')
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform the data to match frontend expectations
    const transformedResponses = responses.map(response => ({
      id: response._id,
      templateId: response.templateId._id,
      templateName: response.templateId.name,
      respondentInfo: {
        name: response.respondentName,
        email: response.respondentEmail
      },
      status: response.status,
      submittedAt: response.submittedAt,
      responses: response.responses.reduce((acc, resp) => {
        acc[resp.questionId] = resp.answerText || resp.answerNumeric || resp.answerBoolean || resp.selectedOptions;
        return acc;
      }, {}),
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    }));
    
    res.json(transformedResponses);
  } catch (error) {
    console.error('Error fetching template responses:', error);
    res.status(500).json({ error: 'Failed to fetch template responses' });
  }
});

// Submit template response (authenticated users)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { templateId, respondentInfo, responses } = req.body;
    const createdBy = req.user._id;
    
    // Validate template exists
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Transform responses to match MongoDB schema
    const transformedResponses = Object.entries(responses).map(([questionId, value]) => {
      const question = template.questions.find(q => q._id.toString() === questionId);
      if (!question) return null;
      
      const response = {
        questionId: questionId
      };
      
      switch (question.responseType) {
        case 'text':
          response.answerText = value;
          break;
        case 'numeric':
          response.answerNumeric = parseFloat(value);
          break;
        case 'boolean':
          response.answerBoolean = Boolean(value);
          break;
        case 'mcq':
          response.answerText = value;
          break;
        case 'msq':
          response.selectedOptions = Array.isArray(value) ? value : [value];
          break;
      }
      
      return response;
    }).filter(Boolean);
    
    const templateResponse = new TemplateResponse({
      templateId,
      respondentName: respondentInfo.name,
      respondentEmail: respondentInfo.email,
      status: 'submitted',
      submittedAt: new Date(),
      responses: transformedResponses,
      createdBy
    });
    
    const savedResponse = await templateResponse.save();
    
    // Transform the response to match frontend expectations
    const responseData = {
      id: savedResponse._id,
      templateId: savedResponse.templateId,
      respondentInfo: {
        name: savedResponse.respondentName,
        email: savedResponse.respondentEmail
      },
      status: savedResponse.status,
      submittedAt: savedResponse.submittedAt,
      responses: savedResponse.responses.reduce((acc, resp) => {
        acc[resp.questionId] = resp.answerText || resp.answerNumeric || resp.answerBoolean || resp.selectedOptions;
        return acc;
      }, {}),
      createdAt: savedResponse.createdAt,
      updatedAt: savedResponse.updatedAt
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// Get response by ID (admin or response owner)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await TemplateResponse.findById(id)
      .populate('templateId', 'name description questions')
      .lean();
    
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    // Check if user is admin or the response owner
    if (req.user.role !== 'admin' && response.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Transform the data to match frontend expectations
    const transformedResponse = {
      id: response._id,
      templateId: response.templateId._id,
      templateName: response.templateId.name,
      templateDescription: response.templateId.description,
      respondentInfo: {
        name: response.respondentName,
        email: response.respondentEmail
      },
      status: response.status,
      submittedAt: response.submittedAt,
      responses: response.responses.reduce((acc, resp) => {
        acc[resp.questionId] = resp.answerText || resp.answerNumeric || resp.answerBoolean || resp.selectedOptions;
        return acc;
      }, {}),
      questions: response.templateId.questions.map(q => ({
        id: q._id,
        question: q.questionText,
        responseType: q.responseType,
        required: q.isRequired,
        options: q.options ? q.options.map(opt => opt.optionText) : []
      })),
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    };
    
    res.json(transformedResponse);
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({ error: 'Failed to fetch response' });
  }
});

// Update response status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedResponse = await TemplateResponse.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedResponse) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    res.json({ message: 'Response status updated successfully' });
  } catch (error) {
    console.error('Error updating response status:', error);
    res.status(500).json({ error: 'Failed to update response status' });
  }
});

// Delete response (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedResponse = await TemplateResponse.findByIdAndDelete(id);
    
    if (!deletedResponse) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({ error: 'Failed to delete response' });
  }
});

export default router; 