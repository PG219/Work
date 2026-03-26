import GovernanceAssessmentScore from "../models/GovernanceAssessmentScore.js";
import Control from "../models/ControlAssessment.js";
import Project from "../models/Projects.js";
import Template from "../models/Template.js";
import axios from "axios";
import mongoose from "mongoose"; // Added missing import for mongoose

async function prepareRecalculationPayload(projectId) {
  const project = await Project.findById(projectId)
    .select("+questionnaireResponses")
    .lean();
  if (!project || !project.questionnaireResponses) {
    throw new Error(
      `Project or questionnaire responses not found for ID: ${projectId}`
    );
  }
  const questionnaireResponses = project.questionnaireResponses;

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

  const currentControls = await Control.find({
    projectId: projectId,
    isActive: true,
  }).lean();

  const controlsPayload = currentControls.reduce((acc, c) => {
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
      console.warn(
        `Control missing code for project ${projectId}, ID: ${c._id}`
      );
    }
    return acc;
  }, {});

  return {
    questions: questionsPayload,
    answers: questionnaireResponses,
    controls: controlsPayload,
  };
}

class GovernanceAssessmentService {
  static async storeGovernanceScores(
    projectId,
    governanceReport,
    implementedControlsCount,
    totalControlsCount
  ) {
    const now = new Date();
    const scores = governanceReport?.scores || {};
    const overallScore = governanceReport?.overall || 0;

    const update = {
      projectId,
      euScore: scores.EU || 0,
      nistScore: scores.NIST || 0,
      isoScore: scores.ISO || 0,
      overallScore: overallScore,
      implementedControlsCount: implementedControlsCount || 0,
      totalControlsCount: totalControlsCount || 0,
      updatedAt: now,
      isActive: true,
    };

    try {
      const doc = await GovernanceAssessmentScore.findOneAndUpdate(
        { projectId },
        { $set: { assessmentDate: now, ...update } },
        { new: true, upsert: true }
      ).lean();
      return doc;
    } catch (error) {
      console.error(
        `Error storing governance scores for project ${projectId}:`,
        error
      );
      throw error;
    }
  }

  static async getLatestGovernanceScores(projectId) {
    try {
      const doc = await GovernanceAssessmentScore.findOne({
        projectId: projectId,
        isActive: true,
      })
        .sort({ assessmentDate: -1 })
        .lean();
      return doc || null;
    } catch (error) {
      console.error(
        `Error fetching latest governance scores for project ${projectId}:`,
        error
      );
      throw error;
    }
  }

  static async getGovernanceScoreHistory(projectId, limit = 10) {
    try {
      const docs = await GovernanceAssessmentScore.find({
        projectId,
        isActive: true,
      })
        .sort({ assessmentDate: -1 })
        .limit(limit)
        .lean();
      return docs;
    } catch (error) {
      console.error(
        `Error fetching governance score history for project ${projectId}:`,
        error
      );
      throw error;
    }
  }

  static async recalculateGovernanceScores(projectId) {
    console.log(
      `Recalculating governance scores via agent for project ${projectId}...`
    );
    try {
      const payload = await prepareRecalculationPayload(projectId);

      const AGENT_BASE = (
        process.env.AGENT_URL || "http://localhost:8000"
      ).replace(/\/+$/, "");
      const govUrl = `${AGENT_BASE}/agent/governance/assess`;
      let newGovernanceReport;
      try {
        const govResponse = await axios.post(govUrl, payload, {
          timeout: 180000,
        });
        newGovernanceReport = govResponse.data;
        console.log(
          `Recalculation agent response for ${projectId}:`,
          newGovernanceReport
        );

        if (!newGovernanceReport || !newGovernanceReport.scores) {
          throw new Error(
            "Invalid response received from governance agent during recalculation."
          );
        }
      } catch (agentError) {
        console.error(
          `Error calling governance assessment agent during recalculation for project ${projectId}:`,
          agentError.response ? agentError.response.data : agentError.message
        );
        throw new Error(
          `Failed to get updated assessment from governance agent. ${agentError.message}`
        );
      }

      const totalControlsCount = Object.keys(payload.controls).length;
      const implementedControlsCount = Object.values(payload.controls).filter(
        (c) => c.evidence
      ).length;

      const updatedScores = await this.storeGovernanceScores(
        projectId,
        newGovernanceReport,
        implementedControlsCount,
        totalControlsCount
      );

      return updatedScores;
    } catch (error) {
      console.error(
        `Error during governance score recalculation for project ${projectId}:`,
        error
      );
      throw error;
    }
  }

  static async getGovernanceStatistics() {
    try {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const pipeline = [
        { $match: { isActive: true, assessmentDate: { $gte: since } } },
        { $sort: { assessmentDate: -1 } },
        {
          $group: {
            _id: "$projectId",
            latestAssessment: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$latestAssessment" } },
        {
          $group: {
            _id: null,
            total_projects_assessed: { $sum: 1 },
            average_overall_score: { $avg: "$overallScore" },
            average_eu_score: { $avg: "$euScore" },
            average_nist_score: { $avg: "$nistScore" },
            average_iso_score: { $avg: "$isoScore" },
            average_implementation_ratio: {
              $avg: {
                $cond: [
                  { $gt: ["$totalControlsCount", 0] },
                  {
                    $divide: [
                      "$implementedControlsCount",
                      "$totalControlsCount",
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
        { $project: { _id: 0 } },
      ];
      const result = await GovernanceAssessmentScore.aggregate(pipeline);
      return (
        result[0] || {
          total_projects_assessed: 0,
          average_overall_score: 0,
          average_eu_score: 0,
          average_nist_score: 0,
          average_iso_score: 0,
          average_implementation_ratio: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching governance statistics:", error);
      throw error;
    }
  }
}

export default GovernanceAssessmentService;
