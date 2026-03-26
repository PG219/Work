import mongoose from "mongoose";

const ThirdPartySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `TP-${numericNanoid()}`
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    role: {
      type: [String], // Changed to an array of strings to match request body
      required: true,
    },
    website: { // Renamed from 'url' to match request body
      type: String,
      required: true,
    },
    industry: {
      type: [String], // Changed to an array of strings
      required: true,
    },
    description: { // Added new optional field
        type: String,
    },
    notes: { // Added new optional field
        type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    projectId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true,collection: 'Third Party' }
);

export default mongoose.model("ThirdParty", ThirdPartySchema);