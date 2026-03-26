import express from 'express';
import DataElements from '../models/DataElements.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /elements
 * Create a single data element (kept for compatibility)
 */
router.post('/', authenticateToken, async (req, res) => {
  const { projectId, elementName, category } = req.body;

  if (!projectId || !category || !elementName) {
    return res.status(400).json({ message: 'Project ID, category, and element name are required' });
  }

  try {
    const newElement = await DataElements.create({
      userId: req.user._id,
      projectId,
      category,
      elementName,
    });

    res.status(201).json(newElement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /elements/bulk
 * Create multiple data elements in one request
 * Body: { projectId: string, elements: [{category, elementName}, ...] }
 */
router.post('/bulk', authenticateToken, async (req, res) => {
  const { projectId, elements } = req.body;

  if (!projectId || !Array.isArray(elements)) {
    return res.status(400).json({ message: 'projectId and elements[] are required' });
  }
  if (elements.length === 0) {
    return res.status(400).json({ message: 'elements[] cannot be empty' });
  }

  try {
    const docs = elements.map(({ category, elementName }) => ({
      userId: req.user._id,
      projectId,
      category,
      elementName,
    }));
    
    const inserted = await DataElements.insertMany(docs);
    res.status(201).json({ message: 'All elements saved', count: inserted.length });
  } catch (err) {
    // If you used ordered:false, you might want to parse bulkWriteError for partial success
    res.status(500).json({ message: 'Failed to save elements', error: err.message });
  }
});

/**
 * GET /elements/:projectId
 * Return ALL data elements for the authenticated user & project
 */
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const data = await DataElements.find({
      userId: req.user._id,
      projectId: req.params.projectId
    }).lean();

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
