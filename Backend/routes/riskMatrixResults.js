import express from 'express';
import RiskMatrixRisk from '../models/RiskMatrixRisk.js';
import RiskMatrixService from '../services/riskMatrixService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all risks with pagination and filtering (authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search = '',
      projectId = '',
      sessionId = ''
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Add filters
    if (projectId) {
      query.projectId = projectId;
    }
    
    if (sessionId) {
      query.sessionId = sessionId;
    }
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { riskName: { $regex: search, $options: 'i' } },
        { sessionId: { $regex: search, $options: 'i' } },
        { riskAssessmentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get results with pagination
    const risks = await RiskMatrixRisk.find(query)
      .populate('createdBy', 'name surname email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await RiskMatrixRisk.countDocuments(query);
    
    res.json({
      risks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

// Get all risks for a project (authenticated users)
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const risks = await RiskMatrixRisk.find({ 
      projectId, 
      isActive: true 
    })
    .populate('createdBy', 'name surname email')
    .sort({ severity: -1, createdAt: -1 })
    .lean();
    
    res.json(risks);
  } catch (error) {
    console.error('Error fetching risks for project:', error);
    res.status(500).json({ error: 'Failed to fetch risks for project' });
  }
});

// Get risks by session ID (authenticated users)
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const risks = await RiskMatrixRisk.find({ 
      sessionId, 
      isActive: true 
    })
    .populate('createdBy', 'name surname email')
    .sort({ severity: -1, createdAt: -1 })
    .lean();
    
    if (risks.length === 0) {
      return res.status(404).json({ error: 'Risks not found for this session' });
    }
    
    // Group risks by assessment
    const riskAssessmentId = risks[0]?.riskAssessmentId;
    const groupedRisks = risks.filter(risk => risk.riskAssessmentId === riskAssessmentId);
    
    res.json({
      sessionId,
      riskAssessmentId,
      risksCount: groupedRisks.length,
      risks: groupedRisks
    });
  } catch (error) {
    console.error('Error fetching risks by session:', error);
    res.status(500).json({ error: 'Failed to fetch risks by session' });
  }
});

// Store risks from agent response (authenticated users)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, sessionId, parsedRisks } = req.body;
    const createdBy = req.user._id;
    
    if (!parsedRisks || !Array.isArray(parsedRisks) || parsedRisks.length === 0) {
      return res.status(400).json({ error: 'No risks to store' });
    }
    
    const result = await RiskMatrixService.storeRisks({
      projectId,
      sessionId,
      parsedRisks
    }, createdBy);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error storing risks:', error);
    res.status(500).json({ error: 'Failed to store risks' });
  }
});

// Update a risk (authenticated users)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { riskName, riskOwner, severity, justification, mitigation, targetDate } = req.body;
    
    const updatedRisk = await RiskMatrixService.updateRisk(id, {
      riskName,
      riskOwner,
      severity,
      justification,
      mitigation,
      targetDate: targetDate ? new Date(targetDate) : null
    });
    
    res.json(updatedRisk);
  } catch (error) {
    console.error('Error updating risk:', error);
    if (error.message === 'Risk not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update risk' });
    }
  }
});

// Delete a risk (soft delete) (authenticated users)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await RiskMatrixService.deleteRisk(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting risk:', error);
    if (error.message === 'Risk not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete risk' });
    }
  }
});

// Get risk summary statistics (authenticated users)
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    // Build query
    const query = { isActive: true };
    if (projectId) {
      query.projectId = projectId;
    }
    
    // Get all risks
    const risks = await RiskMatrixRisk.find(query)
      .populate('createdBy', 'name surname email')
      .lean();
    
    // Analyze risk levels
    const riskLevels = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0
    };
    
    let totalRisks = 0;
    let totalAssessments = 0;
    const uniqueAssessments = new Set();
    
    risks.forEach(risk => {
      totalRisks++;
      uniqueAssessments.add(risk.riskAssessmentId);
      
      // Categorize by severity
      if (risk.severity >= 5) riskLevels.Critical++;
      else if (risk.severity >= 4) riskLevels.High++;
      else if (risk.severity >= 3) riskLevels.Medium++;
      else riskLevels.Low++;
    });
    
    totalAssessments = uniqueAssessments.size;
    
    // Calculate percentages
    const total = Object.values(riskLevels).reduce((sum, count) => sum + count, 0);
    const percentages = {};
    Object.keys(riskLevels).forEach(level => {
      percentages[level] = total > 0 ? Math.round((riskLevels[level] / total) * 100) : 0;
    });
    
    // Get recent assessments
    const recentAssessments = risks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(risk => ({
        id: risk._id,
        sessionId: risk.sessionId,
        riskName: risk.riskName,
        severity: risk.severity,
        createdAt: risk.createdAt,
        createdBy: risk.createdBy?.name || 'Unknown'
      }));
    
    res.json({
      riskLevels,
      percentages,
      totalRisks,
      totalAssessments,
      recentAssessments,
      summary: {
        totalAssessments,
        totalRisks,
        averageSeverity: totalRisks > 0 ? (risks.reduce((sum, risk) => sum + risk.severity, 0) / totalRisks).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching risk summary statistics:', error);
    res.status(500).json({ error: 'Failed to fetch risk summary statistics' });
  }
});

export default router; 