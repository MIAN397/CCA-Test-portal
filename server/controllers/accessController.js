import { User, normalizeGmail } from '../models/User.js';
import { Enrollment } from '../models/Enrollment.js';
import { Subscription } from '../models/Subscription.js';
import { Class } from '../models/Class.js';

/**
 * Resolves a Student's Access Rights across all enrolled classes and subscription plans.
 * Bypasses the pricing portal if the student has AT LEAST ONE active enrollment OR an active plan.
 */
export async function resolveStudentAccess(studentUser) {
  const now = new Date();
  const userId = studentUser._id;
  const normalizedEmail = normalizeGmail(studentUser.email);

  // 1. Query all active class / subject enrollments for this student identity
  const activeEnrollments = await Enrollment.find({
    $or: [
      { studentId: userId },
      { studentEmail: normalizedEmail },
    ],
    status: 'active',
    validUntil: { $gte: now },
  })
    .populate('classId', 'name batchCode subjects')
    .populate('enrolledByTeacherId', 'name email')
    .lean();

  // 2. Query any active standalone subscriptions
  const activeSubscription = await Subscription.findOne({
    userId,
    status: 'active',
    expiryDate: { $gte: now },
  }).lean();

  // 3. Gatekeeper Decision:
  // If the cadet has ANY valid teacher-authorized class enrollment, they are exempt from the pricing paywall!
  const isEnrolledByTeacher = activeEnrollments.length > 0;
  const hasActivePlan = isEnrolledByTeacher || !!activeSubscription;

  return {
    studentId: userId,
    email: studentUser.email,
    normalizedEmail,
    hasAuthorizedAccess: hasActivePlan,
    shouldRedirectToPricing: !hasActivePlan,
    enrolledClasses: activeEnrollments.map((enr) => ({
      enrollmentId: enr._id,
      classId: enr.classId?._id,
      className: enr.classId?.name || 'Assigned Class',
      subjectId: enr.subjectId,
      teacherId: enr.enrolledByTeacherId?._id,
      teacherName: enr.enrolledByTeacherId?.name,
      validUntil: enr.validUntil,
    })),
    activeSubscription: activeSubscription || null,
  };
}

/**
 * Enrolls a student with a given Gmail into a class/subject.
 * DOES NOT create a duplicate User document if the student already exists.
 * Simply upserts a new Enrollment record linked to the same student document.
 */
export async function enrollStudentInClass({
  email,
  name,
  phone,
  classId,
  subjectId,
  teacherId,
  loginId,
}) {
  const normalizedEmail = normalizeGmail(email);

  // 1. Match or create canonical student identity
  let student = await User.findOne({ email: normalizedEmail });
  if (!student) {
    const rawLogin = (loginId || normalizedEmail.split('@')[0] || `std_${Date.now()}`).toLowerCase();
    student = await User.create({
      name,
      email: normalizedEmail,
      loginId: rawLogin,
      phone: phone || '',
      role: 'student',
    });
  }

  // 2. Upsert decoupled enrollment record (Compound index: studentId + classId + subjectId)
  const enrollment = await Enrollment.findOneAndUpdate(
    {
      studentId: student._id,
      classId,
      subjectId: subjectId || null,
    },
    {
      studentId: student._id,
      studentEmail: normalizedEmail,
      classId,
      subjectId: subjectId || null,
      enrolledByTeacherId: teacherId,
      enrollmentType: 'faculty_authorized',
      status: 'active',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days access
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 3. Ensure student has active institutional pass
  const existingSub = await Subscription.findOne({
    userId: student._id,
    status: 'active',
  });

  if (!existingSub) {
    await Subscription.create({
      userId: student._id,
      planId: 'plan-institutional',
      planName: 'Institutional Enrolled Pass',
      tier: 'annual',
      price: 'Complimentary (Faculty Enrolled)',
      durationDays: 365,
      status: 'active',
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      paymentMethod: 'cash',
      transactionRef: `FACULTY-ENROLLED-${teacherId}`,
      notes: 'Auto-authorized upon faculty enrollment',
    });
  }

  return {
    student,
    enrollment,
  };
}

/**
 * Handles Google OAuth / Gmail sign in:
 * Verifies profile, links credentials, resolves access across all classes, and returns desk status.
 */
export async function handleGoogleSignIn({ googleId, email, name, picture }) {
  const normalizedEmail = normalizeGmail(email);

  // Match existing student identity
  let student = await User.findOne({
    $or: [{ email: normalizedEmail }, { googleId }],
  });

  if (student) {
    // Link Google OAuth ID and picture
    if (!student.googleId || !student.googlePicture) {
      student.googleId = googleId || student.googleId;
      student.googlePicture = picture || student.googlePicture;
      await student.save();
    }
  } else {
    // New registration
    student = await User.create({
      name,
      email: normalizedEmail,
      googleId,
      googlePicture: picture,
      loginId: normalizedEmail.split('@')[0],
      role: 'student',
    });
  }

  // Resolve access across all decoupled enrollments
  const access = await resolveStudentAccess(student);

  return {
    user: student,
    access,
    redirectToPricing: access.shouldRedirectToPricing, // FALSE if enrolled in ANY class
  };
}
