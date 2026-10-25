import mongoose from 'mongoose';

/**
 * Normalized Junction Collection:
 * Decouples Student User documents from Class and Subject allocations.
 * A single Student User ID / Gmail can have unlimited active enrollment records
 * across different teachers, classes, and subjects.
 */
const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId, // Optional: if enrolling in a specific subject
      default: null,
    },
    enrolledByTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    enrollmentType: {
      type: String,
      enum: ['faculty_authorized', 'self_enrolled', 'scholarship', 'institutional'],
      default: 'faculty_authorized',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'completed'],
      default: 'active',
      index: true,
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1-year default institutional validity
      index: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL COMPOUND UNIQUE INDEX:
// Guarantees that a student cannot be duplicate-enrolled in the EXACT SAME class/subject,
// while allowing the exact same student Gmail to be enrolled in UNLIMITED DISTINCT classes/subjects.
enrollmentSchema.index(
  { studentId: 1, classId: 1, subjectId: 1 },
  { unique: true }
);

// High-speed authorization gatekeeper index
enrollmentSchema.index({ studentId: 1, status: 1, validUntil: 1 });
enrollmentSchema.index({ studentEmail: 1, status: 1 });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
