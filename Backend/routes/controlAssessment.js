import express from "express";
import mongoose from "mongoose"; // Keep mongoose for ObjectId checks if needed elsewhere
import ControlMatrixService from "../services/controlAssessmentService.js";
import { authenticateToken } from "../middleware/auth.js";
// Removed unused Project and RiskMatrixRisk imports for this specific route logic
import ControlAssessment from "../models/ControlAssessment.js"; // Assuming this is your control model

const router = express.Router();

// --- GET ALL CONTROLS ---
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Adding pagination to be consistent with other paginated endpoints
    const { page = 1, limit = 20 } = req.query;
    const result = await ControlMatrixService.getAllControls(page, limit);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to get controls" });
  }
});

// --- GET CONTROLS BY HIGH-LEVEL SYSTEM TYPE (AI or Cybersecurity) - SIMPLIFIED ---
router.get("/type", authenticateToken, async (req, res) => {
  try {
    const {
      type, // 'AI' or 'Cybersecurity'
      page = 1,
      limit = 20,
    } = req.query;

    if (!type) {
      return res
        .status(400)
        .json({ error: "Query parameter 'type' is required." });
    }

    let projectIdRegex;
    const lowerCaseType = type.toLowerCase();

    // --- UPDATED LOGIC ---
    // Create Regex based on the first two letters of projectId
    if (lowerCaseType === "ai") {
      // Match projectIds starting with AI- or AT-
      projectIdRegex = /^(AI-|AT-)/i;
    } else if (lowerCaseType === "cybersecurity") {
      // Match projectIds starting with CB- or CT-
      projectIdRegex = /^(CB-|CT-)/i;
    } else {
      return res
        .status(400)
        .json({ error: "Invalid 'type'. Must be 'AI' or 'Cybersecurity'." });
    }

    // Directly query ControlAssessment using the regex on the projectId field
    // (Assuming 'projectId' field exists on the ControlAssessment model)
    const matchQuery = {
      projectId: { $regex: projectIdRegex },
    };
    // --- END OF UPDATED LOGIC ---

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const controls = await ControlAssessment.find(matchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("owner", "name surname email"); // Assuming 'owner' is correct, adjust if needed

    const total = await ControlAssessment.countDocuments(matchQuery);
    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      controls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching controls by system type:", error);
    res.status(500).json({ error: "Failed to fetch controls by system type" });
  }
});

// Store a new batch of controls
router.post("/", authenticateToken, async (req, res) => {
  try {
    // The body should contain the array of controls and the parent IDs
    const { parsedControls, riskAssessmentId, sessionId, projectId } = req.body;
    const createdBy = req.user._id;
    const result = await ControlMatrixService.storeControls(
      parsedControls,
      createdBy,
      projectId // Pass projectId here
    );
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to store controls" });
  }
});

// Update a single control by ID
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await ControlMatrixService.updateControl(
      req.params.id,
      req.body
    );
    res.json(updated);
  } catch (e) {
    if (e.message === "Control not found") {
      return res.status(404).json({ error: e.message });
    }
    res.status(500).json({ error: e.message || "Failed to update control" });
  }
});

// Delete a control (soft) by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await ControlMatrixService.deleteControl(req.params.id);
    res.json(result);
  } catch (e) {
    if (e.message === "Control not found") {
      return res.status(404).json({ error: e.message });
    }
    res.status(500).json({ error: e.message || "Failed to delete control" });
  }
});

export default router;
