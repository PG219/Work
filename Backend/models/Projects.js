import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789", 4);

const templatePrefixMap = {
  "AI System": "AI",
  "Cybersecurity Management System": "CB",
  "Third-party AI System": "AT",
  "Third-party Cybersecurity System": "CT",
};

const ProjectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    workflow: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Opened",
    },
    questionnaireResponses: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "Projects",
  }
);

ProjectSchema.pre("validate", function (next) {
  if (this.isNew && !this.projectId) {
    const prefix = templatePrefixMap[this.template];
    const finalPrefix = prefix || "P";
    this.projectId = `${finalPrefix}-${nanoid()}`;
  }
  next();
});

const Project = mongoose.model("Project", ProjectSchema);

export default Project;
