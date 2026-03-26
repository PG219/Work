// routes/risks.js (or relevant file)

import express from "express";
import mongoose from "mongoose"; // Ensure mongoose is imported
import Risks from "../models/Risks.js";
import Project from "../models/Projects.js";
import RiskMatrixService from "../services/riskMatrixService.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// --- GET ALL RISKS (Unchanged) ---
router.get("/", authenticateToken, async (req, res) => {
  // ... existing code ...
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      projectId, // Can filter by projectId here too
      sessionId,
      severity,
      status, // Added status filter based on your other code
    } = req.query;

    const matchQuery = { isActive: true }; // Default to only active risks
    if (projectId) matchQuery.projectId = projectId;
    if (sessionId) matchQuery.sessionId = sessionId;
    if (severity) matchQuery.severity = parseInt(severity);
    if (status && status !== "all") matchQuery.status = status; // Added status match

    if (search) {
      matchQuery.$or = [
        { riskName: { $regex: search, $options: "i" } },
        { riskAssessmentId: { $regex: search, $options: "i" } }, // Search by ID too
        // { riskOwner: { $regex: search, $options: "i" } }, // May not exist directly
        { justification: { $regex: search, $options: "i" } },
        { mitigation: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Use countDocuments for efficiency
    const total = await Risks.countDocuments(matchQuery);
    const pages = Math.ceil(total / parseInt(limit));

    // Fetch risks only if there are any to fetch for the current page
    let risks = [];
    if (total > 0 && skip < total) {
      const risksPipeline = [
        { $match: matchQuery },
        { $sort: sort },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            // Corrected: Use riskAssessmentId for linking
            from: "controlassessments",
            localField: "riskAssessmentId", // Link controls based on the assessment ID
            foreignField: "relatedRisks", // Assuming controls store riskAssessmentId(s)
            as: "mappedControls",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        {
          $addFields: {
            controlCount: { $size: "$mappedControls" },
            // Ensure createdBy is an object or null, not an array
            createdBy: {
              $cond: {
                if: { $isArray: "$createdBy" },
                then: { $arrayElemAt: ["$createdBy", 0] },
                else: null,
              },
            },
          },
        },
        {
          // Project after addFields
          $project: {
            mappedControls: 0, // Exclude the full controls array
            "createdBy.password": 0, // Exclude sensitive fields
            "createdBy.roles": 0,
            // Add other fields to exclude if needed
          },
        },
      ];
      risks = await Risks.aggregate(risksPipeline);
    }

    res.json({
      risks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching risks:", error);
    res.status(500).json({ error: "Failed to fetch risks" });
  }
});

// --- GET RISKS BY SYSTEM TYPE (AI / Cybersecurity) - UPDATED ---
router.get("/type", authenticateToken, async (req, res) => {
  try {
    const {
      type,
      projectId, // <-- Added projectId query parameter
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      search, // <-- Added search
      status, // <-- Added status
    } = req.query;

    if (!type) {
      return res
        .status(400)
        .json({ error: "Query parameter 'type' is required." });
    }

    let useCaseTypes;
    const lowerCaseType = type.toLowerCase();

    if (lowerCaseType === "ai") {
      useCaseTypes = ["AI System", "Third-party AI System"]; // Example types
    } else if (lowerCaseType === "cybersecurity") {
      useCaseTypes = [
        "Cybersecurity Management System",
        "Third-party Cybersecurity",
      ]; // Example types
    } else {
      return res
        .status(400)
        .json({ error: "Invalid 'type'. Must be 'AI' or 'Cybersecurity'." });
    }

    const matchQuery = { isActive: true }; // Start with base query for active risks

    if (projectId && projectId !== "all") {
      // --- If a specific projectId is provided ---
      // 1. Verify this project actually matches the requested type
      const specificProject = await Project.findOne({
        projectId: projectId, // Assuming projectId is the field in Project model
        template: { $in: useCaseTypes },
      }).lean();

      if (!specificProject) {
        // Project doesn't exist or doesn't match the type, return empty
        return res.json({
          risks: [],
          pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 },
        });
      }
      // 2. Set the match query to this specific project
      matchQuery.projectId = projectId;
    } else {
      // --- If NO specific projectId is provided, find all projects of the type ---
      const relevantProjects = await Project.find({
        template: { $in: useCaseTypes },
      })
        .select("projectId -_id")
        .lean(); // Get only projectId field

      const projectIds = relevantProjects.map((p) => p.projectId);

      if (projectIds.length === 0) {
        // No projects of this type found, return empty
        return res.json({
          risks: [],
          pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 },
        });
      }
      // 3. Set the match query to risks belonging to any of these projects
      matchQuery.projectId = { $in: projectIds };
    }

    // --- Add Search and Status filters (consistent with GET /) ---
    if (search) {
      matchQuery.$or = [
        { riskName: { $regex: search, $options: "i" } },
        { riskAssessmentId: { $regex: search, $options: "i" } },
        { justification: { $regex: search, $options: "i" } },
        { mitigation: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "all") {
      matchQuery.status = status;
    }
    // --- End adding Search/Status ---

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Use countDocuments for efficiency based on the final matchQuery
    const total = await Risks.countDocuments(matchQuery);
    const pages = Math.ceil(total / parseInt(limit));

    let risks = [];
    if (total > 0 && skip < total) {
      // Apply the final matchQuery to the aggregation pipeline
      const risksPipeline = [
        { $match: matchQuery }, // Use the constructed matchQuery
        { $sort: sort },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          // Corrected $lookup based on previous example
          $lookup: {
            from: "controlassessments",
            localField: "riskAssessmentId", // Link via assessment ID
            foreignField: "relatedRisks",
            as: "mappedControls",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        {
          $addFields: {
            controlCount: { $size: "$mappedControls" },
            createdBy: {
              $cond: {
                if: { $isArray: "$createdBy" },
                then: { $arrayElemAt: ["$createdBy", 0] },
                else: null,
              },
            },
          },
        },
        {
          $project: {
            mappedControls: 0,
            "createdBy.password": 0,
            "createdBy.roles": 0,
          },
        },
      ];
      risks = await Risks.aggregate(risksPipeline);
    }

    res.json({
      risks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching risks by system type:", error);
    res.status(500).json({ error: "Failed to fetch risks by system type" });
  }
});

// --- Other Routes (Unchanged) ---
router.get(
  "/assessment/:riskAssessmentId",
  authenticateToken,
  async (req, res) => {
    // ... existing code ...
    try {
      const { riskAssessmentId } = req.params;
      // Ensure service method fetches necessary populated fields if needed
      const risks = await RiskMatrixService.getRisksByAssessment(
        riskAssessmentId
      );
      if (!risks || risks.length === 0) {
        return res
          .status(404)
          .json({ error: "No risks found for this assessment ID" });
      }
      res.json(risks);
    } catch (error) {
      console.error("Error fetching risks for assessment:", error);
      res.status(500).json({ error: "Failed to fetch risks" });
    }
  }
);

router.get("/session/:sessionId", authenticateToken, async (req, res) => {
  // ... existing code ...
  try {
    const { sessionId } = req.params;
    const risks = await RiskMatrixService.getRisksBySession(sessionId);
    if (!risks || risks.length === 0) {
      return res
        .status(404)
        .json({ error: "No risks found for this session ID" });
    }
    res.json(risks);
  } catch (error) {
    console.error("Error fetching risks for session:", error);
    res.status(500).json({ error: "Failed to fetch risks" });
  }
});

router.get("/project/:projectId", authenticateToken, async (req, res) => {
  // ... existing code ...
  try {
    const { projectId } = req.params;
    const {
      page = 1,
      limit = 10,
      severity,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query; // Match filters
    const result = await RiskMatrixService.getRisksByProject(
      projectId,
      parseInt(page),
      parseInt(limit),
      severity ? parseInt(severity) : undefined,
      status && status !== "all" ? status : undefined,
      search,
      sortBy,
      sortOrder
    );
    if (
      !result ||
      (result.risks.length === 0 && result.pagination.total === 0)
    ) {
      // Check if it's just an empty page vs no risks at all
      if (parseInt(page) === 1) {
        // No risks found for this project at all with these filters
        // Return empty result rather than 404, as the project might exist but have no matching risks
      }
    }
    res.json(result); // Service likely returns { risks, pagination } structure
  } catch (error) {
    console.error("Error fetching risks for project:", error);
    res.status(500).json({ error: "Failed to fetch risks" });
  }
});

// --- CUD OPERATIONS (Unchanged) ---
router.post("/", authenticateToken, async (req, res) => {
  // ... existing code ...
  try {
    // Add validation for severity if applicable
    const riskData = {
      ...req.body,
      createdBy: req.user._id,
      isActive: true,
      status: req.body.status || "Pending",
    }; // Set defaults

    if (
      !riskData.riskName ||
      !riskData.riskAssessmentId ||
      !riskData.sessionId ||
      !riskData.projectId ||
      riskData.severity === undefined // Check severity presence
    ) {
      return res.status(400).json({
        error:
          "Required fields are missing (riskName, riskAssessmentId, sessionId, projectId, severity).",
      });
    }
    // Add more specific validation (e.g., severity range) if needed
    if (
      typeof riskData.severity !== "number" ||
      riskData.severity < 1 ||
      riskData.severity > 5
    ) {
      return res
        .status(400)
        .json({ error: "Severity must be a number between 1 and 5." });
    }

    const newRisk = await RiskMatrixService.addRisk(riskData);
    res.status(201).json(newRisk);
  } catch (error) {
    console.error("Error creating a single risk:", error);
    // Handle potential duplicate key errors etc.
    res
      .status(500)
      .json({ error: "Failed to create risk", detail: error.message });
  }
});

router.post("/bulk", authenticateToken, async (req, res) => {
  // ... existing code ...
  try {
    const { risks, riskAssessmentId, sessionId, projectId } = req.body;
    const createdBy = req.user._id;

    if (!risks || !Array.isArray(risks) || risks.length === 0) {
      return res
        .status(400)
        .json({ error: "Risks array is required and must not be empty" });
    }
    if (!riskAssessmentId || !sessionId || !projectId) {
      // Ensure projectId is required for bulk too
      return res
        .status(400)
        .json({
          error: "Risk assessment ID, session ID, and project ID are required",
        });
    }

    // Validate each risk in the array
    const risksToInsert = [];
    const validationErrors = [];
    for (const [index, risk] of risks.entries()) {
      if (!risk.risk_name || risk.severity === undefined) {
        validationErrors.push(
          `Risk at index ${index} is missing required fields (risk_name, severity).`
        );
        continue; // Skip this invalid risk
      }
      if (
        typeof risk.severity !== "number" ||
        risk.severity < 1 ||
        risk.severity > 5
      ) {
        validationErrors.push(
          `Risk '${risk.risk_name}' (index ${index}) has invalid severity. Must be number 1-5.`
        );
        continue; // Skip this invalid risk
      }
      risksToInsert.push({
        riskAssessmentId,
        sessionId,
        projectId,
        riskName: risk.risk_name,
        riskOwner: risk.risk_owner, // May not exist, handle undefined
        severity: risk.severity,
        justification: risk.justification,
        mitigation: risk.mitigation,
        status: risk.status || "Pending", // Default status
        targetDate: risk.target_date ? new Date(risk.target_date) : null,
        isActive: true, // Default to active
        createdBy,
      });
    }

    // If there were validation errors, report them and don't insert
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json({
          error: "Validation failed for some risks",
          details: validationErrors,
        });
    }

    if (risksToInsert.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid risks provided to insert." });
    }

    const insertedRisks = await Risks.insertMany(risksToInsert, {
      ordered: false,
    }); // ordered: false attempts to insert all valid ones even if some fail

    // Populate after insertMany if needed (less efficient than lookup in aggregation)
    // await Risks.populate(insertedRisks, { path: "createdBy", select: "name surname email" });

    res.status(201).json({
      message: `${insertedRisks.length} risks created successfully`,
      risks: insertedRisks, // Note: Populate might not work directly on insertMany result depending on Mongoose version
    });
  } catch (error) {
    console.error("Error creating bulk risks:", error);
    // Handle potential bulk write errors
    res
      .status(500)
      .json({ error: "Failed to create risks", detail: error.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  // ... existing code ...
  try {
    const { id } = req.params;
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid risk ID format." });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
      updatedAt: new Date(),
    };

    // Remove fields that shouldn't be updated this way
    delete updateData._id;
    delete updateData.id; // if you have a custom id field
    delete updateData.projectId;
    delete updateData.sessionId;
    delete updateData.riskAssessmentId;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.isActive; // Control activation/deactivation via a separate route if needed

    // Validate severity if present
    if (updateData.severity !== undefined) {
      if (
        typeof updateData.severity !== "number" ||
        updateData.severity < 1 ||
        updateData.severity > 5
      ) {
        return res
          .status(400)
          .json({ error: "Severity must be a number between 1 and 5." });
      }
    }
    if (updateData.targetDate) {
      updateData.targetDate = new Date(updateData.targetDate);
      if (isNaN(updateData.targetDate)) {
        // Check if date is valid
        return res.status(400).json({ error: "Invalid targetDate format." });
      }
    }

    const updatedRisk = await RiskMatrixService.updateRisk(id, updateData); // Pass validated updateData

    res.json(updatedRisk);
  } catch (error) {
    console.error("Error updating risk:", error);
    if (error.message === "Risk not found") {
      res.status(404).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to update risk", detail: error.message });
    }
  }
});

router.patch(
  "/:riskAssessmentId/status",
  authenticateToken,
  async (req, res) => {
    // ... existing code ...
    try {
      const { riskAssessmentId } = req.params;
      const { status, projectId } = req.body;
      const validStatuses = ["Pending", "Completed", "Rejected", "In Progress"]; // Define valid statuses

      if (!status || !projectId) {
        return res
          .status(400)
          .json({ error: "Both 'status' and 'projectId' are required." });
      }
      if (!validStatuses.includes(status)) {
        return res
          .status(400)
          .json({
            error: `Invalid status. Must be one of: ${validStatuses.join(
              ", "
            )}.`,
          });
      }

      const updatedRisk = await Risks.findOneAndUpdate(
        {
          riskAssessmentId: riskAssessmentId,
          projectId: projectId,
          isActive: true,
        }, // Ensure it's active
        {
          $set: {
            status: status,
            updatedAt: new Date(),
            updatedBy: req.user._id,
          },
        }, // Record who updated and when
        { new: true }
      ).populate("createdBy", "name surname email"); // Keep populate

      if (!updatedRisk) {
        return res
          .status(404)
          .json({
            error:
              "Active risk not found for the specified risk ID and project ID.",
          });
      }

      res.json(updatedRisk);
    } catch (error) {
      console.error("Error updating risk status:", error);
      res
        .status(500)
        .json({ error: "Failed to update risk status", detail: error.message });
    }
  }
);

router.delete("/:id", authenticateToken, async (req, res) => {
  // ... existing code ...
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid risk ID format." });
    }
    // Consider soft delete (setting isActive: false) instead of hard delete
    const result = await RiskMatrixService.deleteRisk(id); // Ensure this service handles not found correctly
    res.json(result); // Service should return { message: "..." } on success
  } catch (error) {
    console.error("Error deleting risk:", error);
    if (error.message === "Risk not found") {
      res.status(404).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to delete risk", detail: error.message });
    }
  }
});

// --- STATISTICS (Unchanged) ---
router.get("/stats/summary", authenticateToken, async (req, res) => {
  // ... existing code ...
  try {
    const { projectId } = req.query; // Allow filtering stats by project
    const stats = await RiskMatrixService.getRiskStatistics(projectId || null); // Pass null if no projectId
    res.json(stats);
  } catch (error) {
    console.error("Error fetching risk statistics:", error);
    res.status(500).json({ error: "Failed to fetch risk statistics" });
  }
});

export default router;
