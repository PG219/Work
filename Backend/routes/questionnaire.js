import express from "express";
import mongoose from "mongoose";
import RiskMatrixService from "../services/riskMatrixService.js";
import ControlMatrixService from "../services/controlAssessmentService.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { nanoid } from "nanoid";
import Project from "../models/Projects.js";
import axios from "axios";
import Template from "../models/Template.js";
import Question from "../models/Question.js";
import RiskMatrixRisk from "../models/Risks.js";

const router = express.Router();

const BASELINE_QUESTION_MAP = {
  requestOwner: "Name and country",
  projectType: "Project type (in-house vs third-party)",
  projectName: "Project Name",
  region: "Geographic regions",
  purpose: "AI system objective",
  dateRange: "Project timeline",
  delayFactors: "Potential delays",
  subSystemType: "Learning model",
};

async function getQuestionsMapByIds(ids) {
  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (objectIds.length === 0) return {};
  const templates = await Template.find({
    "questions._id": { $in: objectIds },
  }).lean();
  const map = {};
  templates.forEach((t) =>
    t.questions.forEach((q) => (map[q._id.toString()] = q.questionText))
  );
  return map;
}

async function generateSummaryFromResponses(responses) {
  let summary = "";
  const dbMap = await getQuestionsMapByIds(Object.keys(responses));
  for (const key of Object.keys(responses)) {
    const label =
      BASELINE_QUESTION_MAP[key] || dbMap[key] || `Question (${key})`;
    const val = responses[key];
    if (!val) continue;
    if (typeof val === "object" && val.name && val.country) {
      summary += `${label}: ${val.name} from ${val.country}\n`;
    } else if (Array.isArray(val)) {
      summary += `${label}: ${val.join(", ")}\n`;
    } else {
      summary += `${label}: ${val}\n`;
    }
  }
  return summary;
}

async function prepareGovernancePayload(
  questionnaireResponses,
  parsedControls
) {
  const questionIds = Object.keys(questionnaireResponses).filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  const objectIds = questionIds.map((id) => new mongoose.Types.ObjectId(id));

  let allQuestions = [];
  if (objectIds.length > 0) {
    const templates = await Template.find({
      "questions._id": { $in: objectIds },
    }).lean();
    templates.forEach((t) => {
      t.questions.forEach((q) => {
        if (questionIds.includes(q._id.toString())) {
          allQuestions.push(q);
        }
      });
    });
    allQuestions = Array.from(
      new Map(allQuestions.map((q) => [q._id.toString(), q])).values()
    );
  }

  const questionsPayload = allQuestions.map((q) => ({
    id: q._id.toString(),
    text: q.questionText,
    tags: q.tags || [],
    weights: q.weights || { EU: 1.0, NIST: 1.0, ISO: 1.0 },
  }));

  const controlsArray = Array.isArray(parsedControls) ? parsedControls : [];
  const controlsPayload = controlsArray.reduce((acc, c) => {
    if (c.code) {
      acc[c.code] = {
        desc: c.requirements || c.description || "N/A",
        evidence:
          c.status === "Compliant" ||
          c.status === "Implemented" ||
          c.status === "In Progress",
        weights: c.weights || { EU: 1.0, NIST: 1.0, ISO: 1.0 },
      };
    } else {
    }
    return acc;
  }, {});

  return {
    questions: questionsPayload,
    answers: questionnaireResponses,
    controls: controlsPayload,
  };
}

function familyFromUseCase(useCaseType = "") {
  return String(useCaseType || "")
    .toLowerCase()
    .includes("cyber")
    ? "cyber"
    : "ai";
}

router.post("/process", authenticateToken, async (req, res) => {
  let { questionnaireResponses, useCaseType } = req.body;
  const createdBy = req.user._id;
  const sessionId = nanoid();

  try {
    if (typeof questionnaireResponses === "string") {
      try {
        questionnaireResponses = JSON.parse(questionnaireResponses);
      } catch (parseError) {
        console.error(
          `[${sessionId}] Failed to parse questionnaireResponses string:`,
          parseError
        );
        return res
          .status(400)
          .json({ error: "Invalid JSON in questionnaireResponses string" });
      }
    }
    if (
      !questionnaireResponses ||
      typeof questionnaireResponses !== "object" ||
      Array.isArray(questionnaireResponses)
    ) {
      console.error(
        `[${sessionId}] Invalid questionnaireResponses payload type:`,
        typeof questionnaireResponses
      );
      return res.status(400).json({
        error: "Invalid questionnaireResponses payload: must be an object",
      });
    }

    const summary = await generateSummaryFromResponses(questionnaireResponses);

    const proj = await new Project({
      projectName: questionnaireResponses?.projectName || "AI Risk Project",
      workflow: "Default Workflow",
      template: useCaseType,
      owner: req.user._id,
      questionnaireResponses: questionnaireResponses,
    }).save();
    const projectId = proj.projectId;

    const AGENT_BASE = (
      process.env.AGENT_URL || "http://localhost:8000"
    ).replace(/\/+$/, "");
    const family = familyFromUseCase(useCaseType);

    const riskAgentUrl = `${AGENT_BASE}/agent/${family}/risk`;
    const riskAgentPayload = {
      session_id: sessionId,
      project_id: String(projectId),
      summary,
    };
    let riskRes;
    try {
      riskRes = await axios.post(riskAgentUrl, riskAgentPayload, {
        timeout: 120000,
      });
    } catch (e) {
      const status = e.response?.status || 502;
      const detail = e.response?.data || e.message || String(e);
      console.error(
        `[${sessionId}] Error calling /agent/${family}/risk:`,
        status,
        detail
      );
      return res.status(status).json({
        error: `The ${family.toUpperCase()} risk agent failed.`,
        status,
        detail,
      });
    }

    const { risk_assessment_id, parsed_risks = [] } = riskRes.data || {};

    let risksResult = {
      riskAssessmentId: risk_assessment_id,
      risksCount: 0,
      risks: [],
    };
    if (Array.isArray(parsed_risks) && parsed_risks.length) {
      risksResult = await RiskMatrixService.storeRisks(
        { projectId, sessionId, parsedRisks: parsed_risks },
        createdBy
      );
    } else {
    }

    const riskIds = Array.isArray(parsed_risks)
      ? parsed_risks.map((r) => r?.risk_id).filter(Boolean)
      : [];

    const controlAgentUrl = `${AGENT_BASE}/agent/${family}/controls`;
    const controlAgentPayload = {
      session_id: sessionId,
      project_id: String(projectId),
      risk_assessment_id,
      risk_ids: riskIds,
    };
    let ctrlRes;
    try {
      ctrlRes = await axios.post(controlAgentUrl, controlAgentPayload, {
        timeout: 120000,
      });
    } catch (e) {
      const status = e.response?.status || 502;
      const detail = e.response?.data || e.message || String(e);
      console.error(
        `[${sessionId}] Error calling /agent/${family}/controls:`,
        status,
        detail
      );
      return res.status(status).json({
        error: `The ${family.toUpperCase()} controls agent failed.`,
        status,
        detail,
      });
    }

    const { parsed_controls = [] } = ctrlRes.data || {};

    const normalizedControls = parsed_controls.map((c) => {
      const related = c.relatedRisks ?? c.related_risk ?? c.relatedRisk;
      let relatedRisks = Array.isArray(related)
        ? related.filter(Boolean).map(String)
        : related
        ? [String(related)]
        : [];
      return {
        ...c,
        tickets: typeof c.tickets === "string" ? c.tickets : "",
        status: "Not Implemented",
        relatedRisks,
      };
    });

    let controlsResult = { controlsCount: 0, controls: [] };
    if (normalizedControls.length) {
      controlsResult = await ControlMatrixService.storeControls(
        normalizedControls,
        createdBy,
        projectId
      );
    } else {
    }

    let governanceReport = null;
    try {
      const payload = await prepareGovernancePayload(
        questionnaireResponses,
        normalizedControls
      );
      const govUrl = `${AGENT_BASE}/agent/governance/assess`;

      const gov = await axios.post(govUrl, payload, { timeout: 180000 });
      governanceReport = gov.data;

      if (governanceReport?.scores && !governanceReport.error) {
        const GovernanceAssessmentService = (
          await import("../services/governanceAssessmentService.js")
        ).default;
        const implementedControlsCount = normalizedControls.filter(
          (c) => c.status === "Implemented" || c.status === "Compliant"
        ).length;
        const totalControlsCount = normalizedControls.length;
        await GovernanceAssessmentService.storeGovernanceScores(
          projectId,
          governanceReport,
          implementedControlsCount,
          totalControlsCount
        );
      } else {
      }
    } catch (e) {
      console.error(
        `[${sessionId}] Error calling/processing governance assessment agent:`,
        e.response ? JSON.stringify(e.response.data, null, 2) : e.message
      );
      if (e.stack) {
        console.error(e.stack);
      }
      governanceReport = { error: "Failed to generate governance report." };
    }

    return res.status(201).json({
      message: "Questionnaire processed successfully",
      sessionId,
      riskAssessmentId: risk_assessment_id,
      risksCount: risksResult.risksCount,
      risks: risksResult.risks,
      controlsCount: controlsResult.controlsCount,
      controls: controlsResult.controls,
      governanceReport,
    });
  } catch (error) {
    console.error(
      `[${sessionId}] Unhandled error in /process route:`,
      error
    );
    if (error.stack) {
      console.error(error.stack);
    }
    res.status(500).json({
      error: "Failed to process questionnaire due to an internal error",
      sessionId: sessionId,
      detail: error.message,
    });
  }
});

router.get("/status/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const risks = await RiskMatrixRisk.find({ sessionId, isActive: true })
      .populate("createdBy", "name surname email")
      .sort({ severity: -1, createdAt: -1 })
      .lean();

    if (risks.length === 0) {
      return res.status(404).json({
        error:
          "Questionnaire processing result not found or still in progress.",
      });
    }
    const riskAssessmentId = risks[0]?.riskAssessmentId;
    res.json({
      sessionId,
      riskAssessmentId,
      risksCount: risks.length,
      risks: risks,
    });
  } catch (error) {
    console.error("Error fetching questionnaire status:", error);
    res.status(500).json({ error: "Failed to fetch questionnaire status" });
  }
});

router.get("/questions", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .sort({ order: 1 })
      .populate("createdBy", "name surname email")
      .populate("updatedBy", "name surname email");
    res.json(questions);
  } catch (e) {
    console.error("Error fetching questions:", e);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

router.post("/questions", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, label, options, fields, placeholder, required, order } =
      req.body;
    if (!type || !label)
      return res.status(400).json({ error: "Type and label are required" });
    const q = await new Question({
      id: nanoid(),
      type,
      label,
      options: options || [],
      fields: fields || [],
      placeholder,
      required: required !== false,
      order: order || 0,
      createdBy: req.user._id,
    }).save();
    await q.populate("createdBy", "name surname email");
    res.status(201).json(q);
  } catch (e) {
    console.error("Error creating question:", e);
    res.status(500).json({ error: "Failed to create question" });
  }
});

router.put(
  "/questions/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const up = await Question.findOneAndUpdate(
        { id: id, isActive: true },
        { ...req.body, updatedBy: req.user._id, updatedAt: Date.now() },
        { new: true }
      )
        .populate("createdBy", "name surname email")
        .populate("updatedBy", "name surname email");
      if (!up)
        return res
          .status(4404)
          .json({ error: "Question not found or not active" });
      res.json(up);
    } catch (e) {
      console.error("Error updating question:", e);
      res.status(500).json({ error: "Failed to update question" });
    }
  }
);

router.delete(
  "/questions/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const up = await Question.findOneAndUpdate(
        { id: id, isActive: true },
        { isActive: false, updatedBy: req.user._id, updatedAt: Date.now() },
        { new: true }
      );
      if (!up)
        return res
          .status(404)
          .json({ error: "Question not found or already deleted" });
      res.json({ message: "Question marked as inactive successfully" });
    } catch (e) {
      console.error("Error deleting question:", e);
      res.status(500).json({ error: "Failed to delete question" });
    }
  }
);

router.get("/questions/public", async (req, res) => {
  try {
    const qs = await Question.find({ isActive: true })
      .sort({ order: 1 })
      .select("id type label options fields placeholder required order -_id");
    res.json(qs);
  } catch (e) {
    console.error("Error fetching public questions:", e);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

export default router;