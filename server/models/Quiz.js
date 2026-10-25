import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    questionText: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: [val => val.length === 4, 'Must have exactly 4 choices']
    },
    correctOption: { type: Number, required: true, min: 0, max: 3 },
    points: { type: Number, default: 1 },
    explanation: { type: String, default: '' }
  },
  { _id: false }
);

const quizPublishWindowSchema = new mongoose.Schema(
  {
    startAt: { type: String },
    endAt: { type: String },
    isAlwaysActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const quizAllocationSchema = new mongoose.Schema(
  {
    mode: { type: String, enum: ['all', 'classes', 'students'], default: 'classes' },
    targetClasses: { type: [String], default: [] },
    targetStudentIds: { type: [String], default: [] }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, index: true },
    targetClass: { type: String, trim: true },
    className: { type: String, trim: true },
    description: { type: String, default: '' },
    durationMinutes: { type: Number, default: 15 },
    passMarks: { type: Number, default: 5 },
    totalMarks: { type: Number, default: 10 },
    questions: [questionSchema],
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, required: true },
    isInQuizBank: { type: Boolean, default: true, index: true },
    publishStatus: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishWindow: { type: quizPublishWindowSchema, default: () => ({ isAlwaysActive: true }) },
    allocation: { type: quizAllocationSchema, default: () => ({ mode: 'classes', targetClasses: [], targetStudentIds: [] }) },
    enableAntiCheating: { type: Boolean, default: true },
    enableWebcamProctoring: { type: Boolean, default: false },
    enableTabSwitchDetection: { type: Boolean, default: true },
    enableFullscreenLockdown: { type: Boolean, default: false },
    enableClipboardBlocking: { type: Boolean, default: true },
    maxStrikes: { type: Number, default: 3 },
    shuffleQuestions: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

quizSchema.index({ teacherId: 1, publishStatus: 1 });
quizSchema.index({ subject: 1, publishStatus: 1 });

export const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
