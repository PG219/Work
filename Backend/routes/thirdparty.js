import express from 'express';
import ThirdParty from '../models/ThirdParty.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { name, type, role, industry, website, description, notes, projectId } = req.body;

  // REMOVED: Redundant validation block. Mongoose handles this.

  try {
    const newTP = await ThirdParty.create({
      userId: req.user._id,
      projectId,
      name,
      type,
      website, // CHANGED: from url to website
      industry,
      role,
      description, // ADDED
      notes,       // ADDED
    });
    res.status(201).json(newTP);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * Get all Third Parties by projectId
 */
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const thirdParties = await ThirdParty.find({
      projectId: req.params.projectId,
      // NOTE: Scoping to userId is good practice, but a user might need to see all third parties for a project.
      // If so, you might remove the line below depending on your business logic.
      userId: req.user._id 
    });
    res.status(200).json(thirdParties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Update Third Party by ID
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedTP = await ThirdParty.findOneAndUpdate(
      // CHANGED: Query by '_id' not 'id'
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedTP) {
      return res.status(404).json({ message: 'Third Party not found' });
    }

    res.status(200).json(updatedTP);
  } catch (err) {
     if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * Delete Third Party by ID
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedTP = await ThirdParty.findOneAndDelete({
      // CHANGED: Query by '_id' not 'id'
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deletedTP) {
      return res.status(4e4).json({ message: 'Third Party not found' });
    }

    res.status(200).json({ message: 'Third Party deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;