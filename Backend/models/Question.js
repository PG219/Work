import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'textarea', 'radio', 'checkbox', 'text-country', 'radio-text', 'checkbox-text', 'date-range']
  },
  label: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  fields: [{
    type: {
      type: String,
      enum: ['text', 'select']
    },
    label: String,
    value: String,
    options: [String]
  }],
  placeholder: String,
  required: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient querying
questionSchema.index({ isActive: 1, order: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question; 