import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  }, // e.g. "Mathematics", "Physics & General Science"
  code: {
    type: String,
    uppercase: true,
    trim: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    }, // e.g. "Class 8 (Cadet Prep)", "Military College Prep Batch"
    batchCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
    },
    subjects: [subjectSchema],
    leadTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

classSchema.index({ name: 1 });

export const Class = mongoose.model('Class', classSchema);
export default Class;
