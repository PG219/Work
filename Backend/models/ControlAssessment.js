// backend/models/ControlAssessment.js
import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789", 4);

const ControlSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
      default: () => `AI-${nanoid()}`,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    control: {
      type: String,
      required: true,
      trim: true,
    },
    requirements: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      default: "Not Implemented",
      trim: true,
    },
    tickets: {
      type: String,
      required: true,
      default: "None",
      trim: true,
    },
    projectId: {
      type: String,
      required: false,
      index: true,
      trim: true,
    },
    // IMPORTANT: must be a STRING (not array) in your DB
    relatedRisks: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, collection: "ControlAssessments" }
);

const Control = mongoose.model("ControlAssessment", ControlSchema);

export default Control;
