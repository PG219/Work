import mongoose from 'mongoose';

const questionResponseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answerText: {
    type: String
  },
  answerNumeric: {
    type: Number
  },
  answerBoolean: {
    type: Boolean
  },
  selectedOptions: [{
    type: String
  }]
}, { _id: true });

const templateResponseSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  respondentName: {
    type: String,
    required: true,
    trim: true
  },
  respondentEmail: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  responses: [questionResponseSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
templateResponseSchema.index({ templateId: 1, createdAt: -1 });
templateResponseSchema.index({ status: 1 });
templateResponseSchema.index({ createdBy: 1 });
templateResponseSchema.index({ respondentEmail: 1 });

const TemplateResponse = mongoose.model('TemplateResponse', templateResponseSchema);

export default TemplateResponse; 