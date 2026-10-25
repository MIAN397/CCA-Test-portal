import mongoose from 'mongoose';

/**
 * Normalizes email address for Gmail / Googlemail accounts
 * (strips dot variations and plus-tags so all map to the identical canonical user identity)
 */
export const normalizeGmail = (email) => {
  if (!email) return '';
  const clean = email.trim().toLowerCase();
  const [local, domain] = clean.split('@');
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `${local.split('+')[0].replace(/\./g, '')}@gmail.com`;
  }
  return clean;
};

const teacherAssignmentSchema = new mongoose.Schema(
  {
    className: { type: String, required: true },
    subject: { type: String, required: true }
  },
  { _id: false }
);

const studentClassEnrollmentSchema = new mongoose.Schema(
  {
    enrollmentId: { type: String },
    classId: { type: String },
    className: { type: String, required: true },
    subject: { type: String },
    subjectId: { type: String },
    enrolledByTeacherId: { type: String, required: true },
    teacherName: { type: String },
    status: { type: String, enum: ['active', 'suspended', 'completed'], default: 'active' },
    enrolledAt: { type: String, default: () => new Date().toISOString() },
    validUntil: { type: String }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      set: normalizeGmail,
      index: true
    },
    loginId: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin', 'developer'],
      default: 'student',
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    className: {
      type: String,
      trim: true,
      default: ''
    },
    assignments: {
      type: [teacherAssignmentSchema],
      default: []
    },
    enrolledClasses: {
      type: [studentClassEnrollmentSchema],
      default: []
    },
    enrolledByTeacherId: {
      type: String,
      default: ''
    },
    maxClasses: {
      type: Number,
      default: 5
    },
    lifetimeClassesCreated: {
      type: Number,
      default: 0
    },
    googleId: {
      type: String,
      index: true,
      default: ''
    },
    googlePicture: {
      type: String,
      default: ''
    },
    subscription: {
      type: Object,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    recruitedAt: {
      type: String,
      default: () => new Date().toISOString()
    },
    enrolledAt: {
      type: String,
      default: () => new Date().toISOString()
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual relationship: all active enrollments for this user
userSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'studentId'
});

// Virtual relationship: all subscriptions for this user
userSchema.virtual('subscriptions', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'userId'
});

export const User = mongoose.model('User', userSchema);
export default User;
