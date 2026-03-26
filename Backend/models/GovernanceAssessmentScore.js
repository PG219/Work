import mongoose from "mongoose";

const GovernanceAssessmentScoreSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    euScore: { type: Number, default: 0 },
    nistScore: { type: Number, default: 0 },
    isoScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    implementedControlsCount: { type: Number, default: 0 },
    totalControlsCount: { type: Number, default: 0 },
    assessmentDate: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: false, collection: "GovernanceAssessmentScores" }
);

const GovernanceAssessmentScore = mongoose.model(
  "GovernanceAssessmentScore",
  GovernanceAssessmentScoreSchema
);

export default GovernanceAssessmentScore;


