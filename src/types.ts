export type UserRole = 'admin' | 'teacher' | 'student' | 'developer';

export type SubscriptionPlanTier = 'trial' | 'monthly' | 'quarterly' | 'annual';
export type SubscriptionStatus = 'active' | 'pending_verification' | 'expired' | 'canceled';
export type PaymentMethod = 'free_trial' | 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'credit_card' | 'cash' | 'safepay';

export interface UserSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  loginId: string;
  planId: string;
  planName: string;
  tier: SubscriptionPlanTier;
  price: string;
  durationDays: number;
  maxClasses?: number;    // Lifetime class creation quota
  status: SubscriptionStatus;
  startDate: string;       // ISO date string
  expiryDate: string;      // ISO date string
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  activatedAt: string;     // ISO date string
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface PlanPackage {
  id: string;
  tier: SubscriptionPlanTier;
  name: string;
  price: string;
  priceAmount: number;
  durationDays: number;
  durationLabel: string;
  maxClasses: number;     // Lifetime class creation quota
  badge?: string;
  popular?: boolean;
  tagline: string;
  features: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loginId: string;
  password?: string;
  role: 'admin';
  googleId?: string;
  googlePicture?: string;
  createdAt: string;
  updatedAt?: string;
  subscription?: UserSubscription;
}

export interface DeveloperUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loginId: string;
  password?: string;
  role: 'developer';
  googleId?: string;
  googlePicture?: string;
  createdAt: string;
  updatedAt?: string;
  subscription?: UserSubscription;
}

export interface TeacherAssignment {
  className: string; // e.g. "Class 8 (Cadet Prep)", "Class 7 (Cadet Prep)"
  subject: string;   // e.g. "Mathematics", "Physics & General Science"
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  loginId: string;
  password?: string;
  assignments: TeacherAssignment[];
  maxClasses?: number; // Quota of total classes teacher is allowed to create (lifetime limit)
  lifetimeClassesCreated?: number; // Cumulative count of classes created in lifetime (does not decrease on delete)
  googleId?: string;
  googlePicture?: string;
  recruitedAt: string;
  updatedAt?: string;
  subscription?: UserSubscription;
  validityDays?: number;
}

export interface StudentClassEnrollment {
  enrollmentId: string;
  classId?: string;
  className: string; // e.g. "Class 8 (Cadet Prep)"
  subject?: string;   // e.g. "Mathematics"
  subjectId?: string;
  enrolledByTeacherId: string;
  teacherName?: string;
  status: 'active' | 'suspended' | 'completed';
  enrolledAt: string; // ISO date string
  validUntil?: string; // ISO date string
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  phone: string;
  className: string; // Primary / active class name (e.g. "Class 8 (Cadet Prep)")
  loginId: string;
  password?: string;
  enrolledByTeacherId?: string; // Primary / initial enrolling teacher ID
  enrolledClasses?: StudentClassEnrollment[]; // Decoupled multi-class & multi-subject enrollments
  googleId?: string;
  googlePicture?: string;
  enrolledAt: string;
  updatedAt?: string;
  maxClasses?: number; // Quota of total classes allowed to create (lifetime limit)
  lifetimeClassesCreated?: number; // Cumulative count of classes created in lifetime
  subscription?: UserSubscription;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[]; // exactly 4 choices
  correctOption: number; // 0, 1, 2, or 3
  points: number;
  explanation?: string;
}

export interface QuizPublishWindow {
  startAt?: string; // ISO string
  endAt?: string;   // ISO string (publishing timer)
  isAlwaysActive?: boolean;
}

export interface QuizAllocation {
  mode: 'all' | 'classes' | 'students';
  targetClasses: string[];    // e.g. ['Class 8 (Cadet Prep)', 'Class 7 (Cadet Prep)']
  targetStudentIds: string[]; // e.g. ['std-1', 'std-2']
}

export interface Quiz {
  id: string;
  title: string;
  subject: string; // e.g. "Mathematics", "Verbal Intelligence"
  targetClass?: string; // primary target class if applicable
  description: string;
  durationMinutes: number; // Test-taking timer (e.g. 15 mins)
  passMarks: number;
  totalMarks: number;
  questions: Question[];
  teacherId: string;
  teacherName: string;
  isInQuizBank: boolean; // stored in reusable Quiz Bank
  publishStatus: 'draft' | 'published';
  publishWindow: QuizPublishWindow; // publishing schedule timer
  allocation: QuizAllocation; // flexible target combinations
  enableAntiCheating?: boolean; // Master Anti-Cheating & Bust Protocols switch
  enableWebcamProctoring?: boolean; // AI Webcam Gaze & Head Tracking Proctor
  enableTabSwitchDetection?: boolean; // Anti-Cheating Tab & Application Switching Detection
  enableFullscreenLockdown?: boolean; // Strict Fullscreen Immersion Lockdown Mode
  enableClipboardBlocking?: boolean; // Block Copy (Ctrl+C), Paste (Ctrl+V), Context Menu & DevTools
  maxStrikes?: number; // Max allowed strikes before automatic disqualification
  shuffleQuestions?: boolean; // Randomize Question & Option Sequence per student attempt
  createdAt: string;
  updatedAt: string;
}

export interface ProctorSnapshot {
  timestamp: string;
  reason: string;
  imageBase64: string;
}

export interface WebcamAudit {
  isCameraEnabled: boolean;
  gazeAwayCount: number;
  faceAbsenceCount: number;
  totalGazeAwaySeconds?: number;
  snapshots: ProctorSnapshot[];
}

export interface IntegrityAudit {
  tabSwitches: number;
  copyAttempts: number;
  fullscreenExits: number;
  isDisqualified: boolean;
  disqualificationReason?: string;
  infractionTimestamps: string[];
  webcamAudit?: WebcamAudit;
}

export interface Submission {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  teacherId: string;
  teacherName: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex (0-3)
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  integrityAudit?: IntegrityAudit;
  submittedAt: string;
}

export const SUBJECT_OPTIONS = [
  'Mathematics',
  'Verbal Intelligence',
  'Non-Verbal Intelligence',
  'General Knowledge & Current Affairs',
  'English Language',
  'Physics & General Science',
  'Urdu / Islamic Studies'
];

export const CLASS_OPTIONS = [
  'Class 6 (Cadet Prep)',
  'Class 7 (Cadet Prep)',
  'Class 8 (Cadet Prep)',
  'Grade 9 & 10',
  'Military College Prep Batch',
  'PMA / Armed Forces Entry Batch'
];

// Helper to check if a quiz is currently active for students to take
export const getQuizPublishState = (quiz: Quiz): {
  status: 'active' | 'scheduled' | 'expired' | 'draft';
  label: string;
  timeLeftFormatted?: string;
} => {
  if (quiz.publishStatus === 'draft') {
    return { status: 'draft', label: 'Draft' };
  }

  if (quiz.publishWindow?.isAlwaysActive) {
    return { status: 'active', label: 'Always Active' };
  }

  const now = new Date().getTime();
  const start = quiz.publishWindow?.startAt ? new Date(quiz.publishWindow.startAt).getTime() : now;
  const end = quiz.publishWindow?.endAt ? new Date(quiz.publishWindow.endAt).getTime() : now + 72 * 60 * 60 * 1000;

  if (now < start) {
    const diffHours = Math.max(1, Math.ceil((start - now) / (1000 * 60 * 60)));
    return {
      status: 'scheduled',
      label: `Scheduled (Starts in ${diffHours}h)`,
    };
  }

  if (now > end) {
    return { status: 'expired', label: 'Publish Window Expired' };
  }

  const diffMinutes = Math.max(0, Math.floor((end - now) / (1000 * 60)));
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  const timeLeft = hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;

  return {
    status: 'active',
    label: `Active (${timeLeft})`,
    timeLeftFormatted: timeLeft,
  };
};
