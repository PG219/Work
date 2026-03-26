import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet("0123456789", 6);

const RisksSchema = new mongoose.Schema({
  riskAssessmentId: {
    type: String,
    required: true,
    index: true,
    default: () => `R-${nanoid()}`,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
    default: () => `S-${nanoid()}`,
  },
  projectId: {
    type: String,
    required: false,
    index: true
  },
  riskName: {
    type: String,
    required: true
  },
  riskOwner: {
    type: String,
    required: true,
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  justification: {
    type: String,
    required: false
  },
  mitigation: {
    type: String,
    required: false
  },
  targetDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    default: 'Not Set'
  },
  strategyStatus:{
    type: String,
    default: 'Not Set'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,collection: 'Risks'
});

// Indexes for efficient queries
RisksSchema.index({ riskAssessmentId: 1, createdAt: -1 });
RisksSchema.index({ sessionId: 1, createdAt: -1 });
RisksSchema.index({ projectId: 1, createdAt: -1 });
RisksSchema.index({ severity: 1 });
RisksSchema.index({ riskOwner: 1 });

const Risks = mongoose.model('Risks', RisksSchema);

export default Risks; 