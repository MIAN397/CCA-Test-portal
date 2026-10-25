import mongoose from 'mongoose';

const proctorSnapshotSchema = new mongoose.Schema(
  {
    timestamp: { type: String, required: true },
    reason: { type: String, required: true },
    imageBase64: { type: String, required: true }
  },
  { _id: false }
);

const integrityAuditSchema = new mongoose.Schema(
  {
    tabSwitches: { type: Number, default: 0 },
    copyAttempts: { type: Number, default: 0 },
    fullscreenExits: { type: Number, default: 0 },
    isDisqualified: { type: Boolean, default: false },
    disqualificationReason: { type: String },
    infractionTimestamps: { type: [String], default: [] },
    webcamAudit: {
      isCameraEnabled: { type: Boolean, default: false },
      gazeAwayCount: { type: Number, default: 0 },
      faceAbsenceCount: { type: Number, default: 0 },
      totalGazeAwaySeconds: { type: Number, default: 0 },
      snapshots: [proctorSnapshotSchema]
    }
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    quizId: { type: String, required: true, index: true },
    quizTitle: { type: String, required: true },
    subject: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    studentClass: { type: String, required: true },
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, required: true },
    answers: { type: Map, of: Number, default: {} },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    integrityAudit: integrityAuditSchema,
    submittedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

submissionSchema.index({ teacherId: 1, submittedAt: -1 });
submissionSchema.index({ studentId: 1, submittedAt: -1 });
submissionSchema.index({ quizId: 1, studentId: 1 });

export const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
