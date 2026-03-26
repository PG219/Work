import express from 'express';
import Comment from '../models/Comments.js';
import { authenticateToken } from '../middleware/auth.js';
import upload, { uploadToGCS, deleteFromGCS } from '../middleware/upload.js';

const router = express.Router();

/**
 * @desc    POST /comments
 * @route   Create a single comment with optional file attachment
 */
router.post('/', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const { projectId, text } = req.body;
    const author = req.user._id;
    const file = req.file;

    // Validation
    if (!projectId || !text || !author) {
      return res.status(400).json({ 
        success: false,
        message: 'Project ID, author, and text are required' 
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Comment text cannot be empty' 
      });
    }

    let attachmentUrl = null;
    let attachmentInfo = null;

    // Handle file upload if present
    if (file) {
      try {
        // Generate a temporary comment ID for file naming
        const tempCommentId = `temp_${Date.now()}`;
        const uploadResult = await uploadToGCS(file, projectId, tempCommentId);
        attachmentUrl = uploadResult.url;
        attachmentInfo = {
          url: uploadResult.url,
          filename: uploadResult.filename,
          originalName: uploadResult.originalName,
          size: uploadResult.size
        };
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload attachment',
          error: uploadError.message
        });
      }
    }

    const newComment = await Comment.create({
      author: author,
      projectId: projectId,
      text: text.trim(),
      attachment: attachmentUrl,
      attachmentInfo: attachmentInfo
    });

    // Populate author details for response
    await newComment.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: newComment
    });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create comment',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

/**
 * @desc    POST /comments/bulk
 * @route   Create multiple comments in one request (no file uploads for bulk)
 */
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { projectId, comments } = req.body;
    const author = req.user._id;

    // Validation
    if (!projectId || !Array.isArray(comments)) {
      return res.status(400).json({ 
        success: false,
        message: 'projectId and comments array are required' 
      });
    }

    if (comments.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Comments array cannot be empty' 
      });
    }

    // Validate each comment
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      if (!comment.text || comment.text.trim().length === 0) {
        return res.status(400).json({ 
          success: false,
          message: `Comment at index ${i} is invalid: text is required` 
        });
      }
    }

    const docs = comments.map(({ text, attachment }) => ({
      author: author,
      projectId: projectId,
      text: text.trim(),
      attachment: attachment || null,
    }));
    
    const inserted = await Comment.insertMany(docs);
    
    res.status(201).json({ 
      success: true,
      message: 'All comments saved successfully', 
      count: inserted.length,
      data: inserted
    });
  } catch (err) {
    console.error('Error creating bulk comments:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save comments', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

/**
 * @desc    GET /comments/:projectId
 * @route   Return ALL comments for a given project ID
 */
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const author = req.user._id;

    if (!projectId) {
      return res.status(400).json({ 
        success: false,
        message: 'Project ID is required' 
      });
    }

    const comments = await Comment.find({
      author: author,
      projectId: projectId
    })
    .populate('author', 'name email')
    .sort({ createdAt: -1 }) // Most recent first
    .lean();

    res.json({
      success: true,
      message: 'Comments retrieved successfully',
      data: comments || []
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch comments',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

/**
 * @desc    PUT /comments/:commentId
 * @route   Update a comment with optional new attachment
 */
router.put('/:commentId', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const file = req.file;
    const author = req.user._id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Comment text is required' 
      });
    }

    // Find existing comment
    const existingComment = await Comment.findOne({
      commentId: commentId,
      author: author
    });

    if (!existingComment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found or you do not have permission to update it' 
      });
    }

    let attachmentUrl = existingComment.attachment;
    let attachmentInfo = existingComment.attachmentInfo;

    // Handle new file upload if present
    if (file) {
      try {
        // Delete old file if it exists
        if (existingComment.attachment) {
          await deleteFromGCS(existingComment.attachment);
        }

        // Upload new file
        const uploadResult = await uploadToGCS(file, existingComment.projectId, commentId);
        attachmentUrl = uploadResult.url;
        attachmentInfo = {
          url: uploadResult.url,
          filename: uploadResult.filename,
          originalName: uploadResult.originalName,
          size: uploadResult.size
        };
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload new attachment',
          error: uploadError.message
        });
      }
    }

    const updatedComment = await Comment.findOneAndUpdate(
      { 
        commentId: commentId,
        author: author
      },
      { 
        text: text.trim(),
        attachment: attachmentUrl,
        attachmentInfo: attachmentInfo
      },
      { new: true }
    ).populate('author', 'name email');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment
    });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update comment',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

/**
 * @desc    DELETE /comments/:commentId
 * @route   Delete a comment and its attachment
 */
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const author = req.user._id;

    const comment = await Comment.findOne({
      commentId: commentId,
      author: author
    });

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found or you do not have permission to delete it' 
      });
    }

    // Delete attachment from GCS if it exists
    if (comment.attachment) {
      await deleteFromGCS(comment.attachment);
    }

    // Delete comment from database
    await Comment.findOneAndDelete({
      commentId: commentId,
      author: author
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete comment',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

export default router;
