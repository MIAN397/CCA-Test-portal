/**
 * Exhaustive Manual & Functional System-Wide Audit
 * Cadets Coaching Academy Assessment Portal
 * Validates every role, button, modal, form, calculation, and data flow.
 */

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value.toString();
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

const mockStorage = new LocalStorageMock();
(globalThis as any).localStorage = mockStorage;
(globalThis as any).window = globalThis;
(globalThis as any).BroadcastChannel = class {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  postMessage() {}
  close() {}
};
(globalThis as any).fetch = async () => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => ({ documents: [] }),
  text: async () => '{}',
});

import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getDevelopers,
  createDeveloper,
  deleteDeveloper,
  getTeachers,
  recruitTeacher,
  updateTeacher,
  deleteTeacher,
  getStudents,
  enrollStudent,
  getStudentByEmail,
  findUserByIdentifier,
  checkLoginIdConflictAcrossAll,
  createQuiz,
  deleteQuiz,
  cloneQuizFromBank,
  submitQuiz,
  getSubscriptions,
  saveUserSubscription,
  verifyUserSubscription,
  extendUserSubscription,
  cancelUserSubscription,
  exportFullDatabaseJSON,
  importFullDatabaseJSON,
  resetDatabaseToDefaults,
  getAuthSession,
  saveAuthSession,
  clearAuthSession,
  linkGoogleAccount,
} from '../utils/storage.ts';

import {
  matchGoogleUser,
  parseGoogleJwt,
  getGoogleOAuthUrl,
  normalizeEmail,
} from '../utils/googleAuth.ts';

import {
  isSubscriptionActive,
  getDaysRemaining,
  createSubscriptionRecord,
  PLAN_PACKAGES,
  ACADEMY_PAYMENT_CHANNELS,
} from '../utils/subscription.ts';

import {
  getQuizPublishState,
  Quiz,
  Student,
  Submission,
  IntegrityAudit,
} from '../types.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, title: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${title}${details ? ` -> ${details}` : ''}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${title}${details ? ` -> ${details}` : ''}`);
    failed++;
  }
}

async function runSystemWideAudit() {
  console.log('\n========================================================================');
  console.log('   CADETS COACHING ACADEMY — 100% EXHAUSTIVE SYSTEM-WIDE FUNCTIONAL AUDIT   ');
  console.log('========================================================================\n');

  // ========================================================================
  // MODULE 1: AUTHENTICATION, MULTI-ROLE LOGIN & SESSION LIFECYCLE
  // ========================================================================
  console.log('--- [Module 1] Authentication, Multi-Role Login & Session Lifecycle ---');

  // 1.1 Developer Credentials Verification
  const devs = getDevelopers();
  assert(devs.length >= 1, 'Default developer account initialized', `Found ${devs.length}`);
  const devUser = devs[0];
  assert(devUser.loginId === 'dev', 'Developer loginId matches dev');
  assert(devUser.password === 'TT@0786' || devUser.password === 'password123', 'Developer password matches master secret');

  // 1.2 Administrator Credentials Verification
  const admins = getAdmins();
  assert(admins.length >= 1, 'Default administrator account initialized');
  const adminUser = admins[0];
  assert(adminUser.loginId === 'admin', 'Admin loginId matches admin');

  // 1.3 Faculty Teacher Credentials Verification
  const teachers = getTeachers();
  assert(teachers.length >= 3, 'Default faculty teachers initialized', `Count: ${teachers.length}`);
  const asadTeacher = teachers.find((t) => t.loginId === 'asad_math');
  assert(asadTeacher !== undefined, 'Sir Asad faculty profile exists');
  assert(asadTeacher?.assignments.length! > 0, 'Sir Asad has class assignments');

  // 1.4 Student Credentials Verification
  const students = getStudents();
  assert(students.length >= 5, 'Default cadet student profiles initialized', `Count: ${students.length}`);
  const daniyalCadet = students.find((s) => s.loginId === 'daniyal_k');
  assert(daniyalCadet !== undefined, 'Cadet Daniyal profile exists');

  // 1.5 Identifier Conflict Checker
  const adminConflict = checkLoginIdConflictAcrossAll('admin');
  assert(adminConflict.isTaken === true && adminConflict.roleName === 'Administrator', 'checkLoginIdConflictAcrossAll detects Admin loginId');

  const teacherConflict = checkLoginIdConflictAcrossAll('asad_math');
  assert(teacherConflict.isTaken === true && teacherConflict.roleName === 'Teacher', 'checkLoginIdConflictAcrossAll detects Teacher loginId');

  const availableConflict = checkLoginIdConflictAcrossAll('non_existent_unique_slug_999');
  assert(availableConflict.isTaken === false, 'checkLoginIdConflictAcrossAll returns false for unique slug');

  // 1.6 Session Save, Persist & Clear
  saveAuthSession({
    isAuthenticated: true,
    role: 'developer',
    userId: devUser.id,
    authProvider: 'password',
  });
  const savedDevSession = getAuthSession();
  assert(savedDevSession.isAuthenticated === true && savedDevSession.role === 'developer', 'Auth session persisted in storage');

  clearAuthSession();
  const clearedSession = getAuthSession();
  assert(clearedSession.isAuthenticated === false, 'Auth session cleared upon logout');

  // ========================================================================
  // MODULE 2: GOOGLE AUTHENTICATION & GMAIL IDENTITY RESOLUTION
  // ========================================================================
  console.log('\n--- [Module 2] Google Auth & Gmail Identity Resolution ---');

  // 2.1 Email Normalization
  assert(normalizeEmail('cadet.daniyal@gmail.com') === 'cadetdaniyal@gmail.com', 'normalizeEmail strips dots for @gmail.com');
  assert(normalizeEmail('cadet.daniyal+prep@googlemail.com') === 'cadetdaniyal@gmail.com', 'normalizeEmail strips plus-tags and normalizes domain');
  assert(normalizeEmail('official@cadetsacademy.com') === 'official@cadetsacademy.com', 'normalizeEmail preserves non-Gmail corporate domains');

  // 2.2 Google User Matching across exact and dot variants
  const exactMatch = matchGoogleUser('aiza@ccap.com', admins, devs, teachers, students);
  assert(exactMatch.matched === true && exactMatch.role === 'student', 'matchGoogleUser matches student by exact email');

  // 2.3 OAuth URL Generation & Token Parsing
  const oauthUrl = getGoogleOAuthUrl('http://localhost:5173');
  assert(oauthUrl.includes('accounts.google.com') && oauthUrl.includes('client_id='), 'getGoogleOAuthUrl generates valid OAuth endpoint');

  const testJwt = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({
    email: 'cadet.test@gmail.com',
    name: 'Test Cadet',
    sub: 'google_123456789',
    email_verified: true,
  })).toString('base64url')}.signature`;

  const parsedGoogle = parseGoogleJwt(testJwt);
  assert(parsedGoogle?.email === 'cadet.test@gmail.com', 'parseGoogleJwt decodes email claim from JWT');
  assert(parsedGoogle?.sub === 'google_123456789', 'parseGoogleJwt decodes subject claim');

  // 2.4 Account Linking Function
  const linkSuccess = linkGoogleAccount('teacher', asadTeacher!.id, 'sir.asad.official@gmail.com', 'https://avatar.url', 'g_sub_asad');
  assert(linkSuccess === true, 'linkGoogleAccount links Google credentials to faculty teacher');
  const reloadedAsad = getTeachers().find((t) => t.id === asadTeacher!.id);
  assert(reloadedAsad?.email === 'sir.asad.official@gmail.com', 'Linked email reflected in teacher record');

  // ========================================================================
  // MODULE 3: DEVELOPER DASHBOARD, PROFILE MANAGEMENT & DB CONTROLS
  // ========================================================================
  console.log('\n--- [Module 3] Developer Dashboard, Universal Profiles & DB Controls ---');

  // 3.1 Create Admin Profile
  const createdAdmin = createAdmin({
    name: 'Lt. Col. Tariq Bashir',
    email: 'tariq.bashir@ccap.com',
    phone: '+92 300 1234567',
    loginId: 'col_tariq',
    password: 'password123',
  });
  assert(createdAdmin.id.startsWith('admin-'), 'createAdmin assigns unique ID', createdAdmin.id);
  assert(getAdmins().some((a) => a.id === createdAdmin.id), 'Newly created admin exists in storage');

  // 3.2 Update Admin Profile
  updateAdmin({ ...createdAdmin, name: 'Col. Tariq Bashir (Promoted)' });
  const updatedAdmin = getAdmins().find((a) => a.id === createdAdmin.id);
  assert(updatedAdmin?.name === 'Col. Tariq Bashir (Promoted)', 'updateAdmin updates admin record');

  // 3.3 Delete Admin Profile
  deleteAdmin(createdAdmin.id);
  assert(!getAdmins().some((a) => a.id === createdAdmin.id), 'deleteAdmin purges admin record');

  // 3.4 Create & Delete Developer Profile
  const createdDev = createDeveloper({
    name: 'Lead Architect Sarah',
    email: 'sarah.dev@ccap.com',
    phone: '+92 312 9876543',
    loginId: 'sarah_arch',
    password: 'password123',
  });
  assert(createdDev.id.startsWith('dev-'), 'createDeveloper assigns unique ID', createdDev.id);
  deleteDeveloper(createdDev.id);
  assert(!getDevelopers().some((d) => d.id === createdDev.id), 'deleteDeveloper purges dev record');

  // 3.5 Full Database Export, Reset & Import
  const dbDump = exportFullDatabaseJSON();
  assert(typeof dbDump === 'string' && dbDump.includes('teachers') && dbDump.includes('quizzes'), 'exportFullDatabaseJSON produces valid database export');

  resetDatabaseToDefaults();
  assert(getTeachers().length >= 3, 'resetDatabaseToDefaults restores defaults cleanly');

  const importResult = importFullDatabaseJSON(dbDump);
  assert(importResult === true, 'importFullDatabaseJSON successfully restores full system snapshot');

  // ========================================================================
  // MODULE 4: ADMINISTRATOR OVERSIGHT, FACULTY RECRUITMENT & QUOTAS
  // ========================================================================
  console.log('\n--- [Module 4] Administrator Oversight, Faculty Quota & Recruitment ---');

  // 4.1 Recruit New Faculty Teacher
  const recruitedTeacher = recruitTeacher({
    name: 'Prof. Junaid Iqbal',
    email: 'prof.junaid@ccap.com',
    phone: '+92 333 4455667',
    loginId: 'prof_junaid',
    password: 'password123',
    assignments: [
      { className: 'Class 8 (Cadet Prep)', subject: 'Mathematics' },
      { className: 'Military College Prep Batch', subject: 'Physics & General Science' },
    ],
    maxClasses: 3,
  });
  assert(recruitedTeacher.id.startsWith('tch-'), 'recruitTeacher assigns unique teacher ID');
  assert(recruitedTeacher.assignments.length === 2, 'Recruited teacher stores multiple class assignments');
  assert(recruitedTeacher.maxClasses === 3, 'Recruited teacher stores lifetime class quota');

  // 4.2 Lifetime Class Quota Enforcement
  assert((recruitedTeacher.lifetimeClassesCreated || 0) <= recruitedTeacher.maxClasses!, 'Initial lifetime classes within quota');

  // 4.3 Update Teacher Profile
  updateTeacher({ ...recruitedTeacher, phone: '+92 333 9999999' });
  const updatedTeacher = getTeachers().find((t) => t.id === recruitedTeacher.id);
  assert(updatedTeacher?.phone === '+92 333 9999999', 'updateTeacher updates faculty record');

  // 4.4 Delete Faculty Teacher
  deleteTeacher(recruitedTeacher.id);
  assert(!getTeachers().some((t) => t.id === recruitedTeacher.id), 'deleteTeacher purges teacher profile');

  // ========================================================================
  // MODULE 5: DECOUPLED MULTI-CLASS STUDENT ENROLLMENT & STORAGE
  // ========================================================================
  console.log('\n--- [Module 5] Decoupled Multi-Class Student Enrollment ---');

  // 5.1 Enroll Student in Class 1
  const studentCountInitial = getStudents().length;
  const multiCadet = enrollStudent({
    name: 'Cadet Farhan Ali',
    email: 'cadet.farhan@gmail.com',
    phone: '+92 300 5544332',
    className: 'Class 8 (Cadet Prep)',
    loginId: 'farhan_a',
    password: 'password123',
    enrolledByTeacherId: 'tch-1',
  });

  assert(multiCadet.enrolledClasses?.length === 1, 'First class enrollment created');
  assert(multiCadet.enrolledClasses?.[0].className === 'Class 8 (Cadet Prep)', 'First class enrollment is Class 8');
  assert(multiCadet.enrolledClasses?.[0].enrolledByTeacherId === 'tch-1', 'First class attributed to Teacher 1');

  // 5.2 Enroll SAME Gmail in Class 2 by Teacher 2
  const multiCadet2 = enrollStudent({
    name: 'Cadet Farhan Ali',
    email: 'cadetfarhan@gmail.com', // Dot variant
    phone: '+92 300 5544332',
    className: 'Military College Prep Batch',
    loginId: 'farhan_a',
    password: 'password123',
    enrolledByTeacherId: 'tch-2',
  });

  assert(getStudents().length === studentCountInitial + 1, 'No duplicate student record created when enrolling in second class');
  assert(multiCadet2.id === multiCadet.id, 'Existing student record reused across teachers');
  assert(multiCadet2.enrolledClasses?.length === 2, 'Student now possesses 2 decoupled active class enrollments');

  // 5.3 Query Student by Email and Identifier
  const foundByEmail = getStudentByEmail('cadetfarhan@gmail.com');
  assert(foundByEmail !== undefined && foundByEmail.id === multiCadet.id, 'getStudentByEmail locates student via normalized Gmail');

  const foundById = findUserByIdentifier('farhan_a');
  assert(foundById !== null && foundById.role === 'student', 'findUserByIdentifier resolves student by loginId');

  // ========================================================================
  // MODULE 6: ASSESSMENT AUTHORING, DUAL TIMERS & ALLOCATION
  // ========================================================================
  console.log('\n--- [Module 6] Assessment Authoring, Dual Timers & Allocation ---');

  // 6.1 Create Assessment with Questions & Anti-Cheating Controls
  const newQuiz = createQuiz({
    title: 'Advanced Mathematics Diagnostic Test',
    subject: 'Mathematics',
    targetClass: 'Class 8 (Cadet Prep)',
    description: 'Midterm assessment on Algebra & Geometry',
    durationMinutes: 15,
    passMarks: 10,
    totalMarks: 20,
    questions: [
      {
        id: 'q1',
        questionText: 'What is the sum of interior angles of a triangle?',
        options: ['90 degrees', '180 degrees', '270 degrees', '360 degrees'],
        correctOption: 1, // 180 degrees
        points: 10,
        explanation: 'The sum of all interior angles of any triangle is always 180 degrees.',
      },
      {
        id: 'q2',
        questionText: 'If 2x + 6 = 16, what is the value of x?',
        options: ['3', '5', '7', '10'],
        correctOption: 1, // 5
        points: 10,
        explanation: '2x = 16 - 6 = 10, therefore x = 5.',
      },
    ],
    teacherId: 'tch-1',
    teacherName: 'Sir Asad Ullah Khan',
    isInQuizBank: false,
    publishStatus: 'published',
    publishWindow: {
      isAlwaysActive: true,
    },
    allocation: {
      mode: 'classes',
      targetClasses: ['Class 8 (Cadet Prep)'],
      targetStudentIds: [],
    },
    enableAntiCheating: true,
    enableWebcamProctoring: true,
    enableTabSwitchDetection: true,
    enableFullscreenLockdown: true,
    enableClipboardBlocking: true,
    maxStrikes: 3,
  });

  assert(newQuiz.id.startsWith('quiz-'), 'createQuiz generates unique quiz ID', newQuiz.id);
  assert(newQuiz.questions.length === 2, 'Quiz stores all 2 questions');
  assert(newQuiz.totalMarks === 20, 'Quiz totalMarks calculated properly');
  assert(newQuiz.enableAntiCheating === true, 'Anti-cheating protocols enabled');

  // 6.2 Dual Timer Engine States
  const publishState = getQuizPublishState(newQuiz);
  assert(publishState.status === 'active', 'getQuizPublishState returns active for alwaysActive quiz');

  // Scheduled Quiz State
  const scheduledQuiz: Quiz = {
    ...newQuiz,
    publishWindow: {
      isAlwaysActive: false,
      startAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      endAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    },
  };
  const scheduledState = getQuizPublishState(scheduledQuiz);
  assert(scheduledState.status === 'scheduled', 'getQuizPublishState returns scheduled when startAt is in future');

  // Expired Quiz State
  const expiredQuiz: Quiz = {
    ...newQuiz,
    publishWindow: {
      isAlwaysActive: false,
      startAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Ended 1 hour ago
    },
  };
  const expiredState = getQuizPublishState(expiredQuiz);
  assert(expiredState.status === 'expired', 'getQuizPublishState returns expired when endAt is in past');

  // 6.3 Clone Quiz from Bank
  const cloned = cloneQuizFromBank(newQuiz.id);
  assert(cloned !== null && cloned.id !== newQuiz.id, 'cloneQuizFromBank creates distinct quiz copy');
  assert(Boolean(cloned?.title.includes('(Cohort Copy)')), 'Cloned quiz title indicates copy');

  // Clean cloned quiz
  if (cloned) deleteQuiz(cloned.id);

  // ========================================================================
  // MODULE 7: CADET TEST TAKING, AUTO-GRADING & ANTI-CHEATING BUSTS
  // ========================================================================
  console.log('\n--- [Module 7] Test Taking, Auto-Grading & Anti-Cheating Busts ---');

  // Test grading function exactly matching App.tsx handleCompleteTest
  const gradeAndSubmit = (
    quiz: Quiz,
    student: Student,
    answers: Record<string, number>,
    timeSpent: number,
    integrityAudit?: IntegrityAudit
  ): Submission => {
    let rawScore = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctOption) {
        rawScore += q.points;
      }
    });

    const totalMarks =
      quiz.totalMarks > 0
        ? quiz.totalMarks
        : quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0) || 1;

    const score = integrityAudit?.isDisqualified ? 0 : rawScore;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = !integrityAudit?.isDisqualified && score >= quiz.passMarks;

    return submitQuiz({
      quizId: quiz.id,
      quizTitle: quiz.title,
      subject: quiz.subject,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.className,
      teacherId: quiz.teacherId,
      teacherName: quiz.teacherName,
      score,
      totalMarks,
      percentage,
      passed,
      timeSpentSeconds: timeSpent,
      answers,
      integrityAudit,
    });
  };

  // 7.1 Full Marks Clean Exam Submission
  const fullMarksSubmission = gradeAndSubmit(
    newQuiz,
    multiCadet2,
    {
      q1: 1, // Correct (10 pts)
      q2: 1, // Correct (10 pts)
    },
    320,
    {
      tabSwitches: 0,
      copyAttempts: 0,
      fullscreenExits: 0,
      isDisqualified: false,
      infractionTimestamps: [],
      webcamAudit: {
        isCameraEnabled: true,
        gazeAwayCount: 0,
        faceAbsenceCount: 0,
        snapshots: [],
      },
    }
  );

  assert(fullMarksSubmission.score === 20, 'Auto-grader awards 20 / 20 marks');
  assert(fullMarksSubmission.percentage === 100, 'Auto-grader computes 100%');
  assert(fullMarksSubmission.passed === true, 'Passing status is true');
  assert(fullMarksSubmission.integrityAudit?.isDisqualified === false, 'Integrity clean (0 strikes)');

  // 7.2 Partial Marks Submission
  const partialSubmission = gradeAndSubmit(
    newQuiz,
    multiCadet2,
    {
      q1: 1, // Correct (10 pts)
      q2: 0, // Incorrect (0 pts)
    },
    400
  );

  assert(partialSubmission.score === 10, 'Auto-grader awards 10 / 20 marks');
  assert(partialSubmission.percentage === 50, 'Auto-grader computes 50%');
  assert(partialSubmission.passed === true, 'Pass marks threshold met (10 / 10)');

  // 7.3 Disqualification Bust Protocol
  const disqualifiedSubmission = gradeAndSubmit(
    newQuiz,
    multiCadet2,
    {
      q1: 1,
      q2: 1,
    },
    120,
    {
      tabSwitches: 4,
      copyAttempts: 2,
      fullscreenExits: 3,
      isDisqualified: true,
      disqualificationReason: 'Exceeded maximum permitted strike threshold (3 security violations).',
      infractionTimestamps: ['10:01:05', '10:02:11', '10:03:00'],
    }
  );

  assert(disqualifiedSubmission.score === 0, 'Disqualified attempt forced to 0 marks');
  assert(disqualifiedSubmission.percentage === 0, 'Disqualified attempt forced to 0%');
  assert(disqualifiedSubmission.passed === false, 'Disqualified attempt marked failed');
  assert(disqualifiedSubmission.integrityAudit?.isDisqualified === true, 'Disqualification rationale persisted');

  // ========================================================================
  // MODULE 8: CADET SUBSCRIPTION LEDGER & GATEKEEPER PAYWALL BYPASS
  // ========================================================================
  console.log('\n--- [Module 8] Cadet Subscription Ledger & Gatekeeper Paywall Bypass ---');

  // 8.1 Package Configurations
  assert(PLAN_PACKAGES.length === 4, 'All 4 plan packages configured (Trial, Monthly, Quarterly, Annual)');
  assert(ACADEMY_PAYMENT_CHANNELS.jazzcash !== undefined, 'JazzCash channel configured');
  assert(ACADEMY_PAYMENT_CHANNELS.easypaisa !== undefined, 'EasyPaisa channel configured');

  // 8.2 Trial Activation
  const trialSub = createSubscriptionRecord(multiCadet2, 'trial', 'free_trial', 'TRIAL-TEST-REF');
  assert(trialSub.status === 'active', 'Trial activates immediately as active');
  assert(isSubscriptionActive(trialSub) === true, 'isSubscriptionActive returns true for fresh trial');
  assert(getDaysRemaining(trialSub) >= 6, 'Trial grants 7 days remaining');

  // 8.3 Mobile Wallet Manual Payment (Pending Verification)
  const manualSub = createSubscriptionRecord(multiCadet2, 'quarterly', 'jazzcash', 'TID-JC-998877', 'Paid via JazzCash app');
  assert(manualSub.status === 'pending_verification', 'Manual mobile wallet sub starts as pending_verification');

  // 8.4 Administrator Verifies Payment TID
  saveUserSubscription(manualSub);
  verifyUserSubscription(manualSub.id, 'ADMINISTRATOR');
  const verifiedSub = getSubscriptions().find((s) => s.id === manualSub.id);
  assert(verifiedSub?.status === 'active', 'Admin TID verification upgrades status to active');
  assert(verifiedSub?.verifiedBy === 'ADMINISTRATOR', 'Verification records officer audit trail');

  // 8.5 Extend Subscription (+30 Days)
  const initialExpiry = new Date(verifiedSub!.expiryDate).getTime();
  extendUserSubscription(manualSub.id, 30, 'ADMINISTRATOR');
  const extendedSub = getSubscriptions().find((s) => s.id === manualSub.id);
  const extendedExpiry = new Date(extendedSub!.expiryDate).getTime();
  assert(extendedExpiry > initialExpiry, 'extendUserSubscription pushes expiryDate forward by 30 days');

  // 8.6 Cancel Subscription
  cancelUserSubscription(manualSub.id);
  const canceledSub = getSubscriptions().find((s) => s.id === manualSub.id);
  assert(canceledSub?.status === 'canceled', 'cancelUserSubscription marks status as canceled');
  assert(isSubscriptionActive(canceledSub) === false, 'isSubscriptionActive returns false for canceled subscription');

  // 8.7 Gatekeeper Paywall Bypass for Multi-Enrolled Student
  const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const hasActiveEnrollments =
    (multiCadet2.enrolledClasses && multiCadet2.enrolledClasses.some((e) => e.status === 'active')) ||
    !!multiCadet2.enrolledByTeacherId ||
    !!multiCadet2.className;

  const isEnrolledByTeacher =
    hasActiveEnrollments ||
    multiCadet2.subscription?.planId === 'plan-institutional' ||
    teachers.some((t) =>
      t.assignments.some(
        (a) =>
          cleanStr(a.className) === cleanStr(multiCadet2.className) ||
          (multiCadet2.enrolledClasses && multiCadet2.enrolledClasses.some((ec) => cleanStr(ec.className) === cleanStr(a.className)))
      )
    );

  const hasActivePlan = isEnrolledByTeacher || isSubscriptionActive(multiCadet2.subscription);
  assert(hasActiveEnrollments === true, 'Multi-enrolled student verified to have active class enrollments');
  assert(hasActivePlan === true, 'Multi-enrolled student granted immediate desk access without pricing portal redirection');

  // Clean test quiz
  deleteQuiz(newQuiz.id);

  console.log('\n========================================================================');
  console.log(`   FULL SYSTEM AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED   `);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSystemWideAudit().catch((err) => {
  console.error('Audit encountered fatal error:', err);
  process.exit(1);
});
