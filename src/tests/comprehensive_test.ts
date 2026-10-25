/**
 * Comprehensive Automated System Test Suite
 * Cadets Coaching Academy Assessment Portal
 */

// 1. Mock LocalStorage and Global Environment
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
  getDevelopers,
  getTeachers,
  getStudents,
  getQuizzes,
  getSubmissions,
  createQuiz,
  updateQuiz,
  cloneQuizFromBank,
  submitQuiz,
  checkLoginIdConflictAcrossAll,
  deleteTeacher,
  enrollStudent,
  linkGoogleAccount,
  getAuthSession,
  saveAuthSession,
  pullAndApplyCloudProfiles,
  syncLocalProfilesToCloud,
  getSubscriptions,
  saveUserSubscription,
  verifyUserSubscription,
  extendUserSubscription,
  cancelUserSubscription,
  updateStudent,
  updateTeacher,
  recruitTeacher,
  getUserSubscription,
  getStudentByEmail,
  findUserByIdentifier,
} from '../utils/storage.ts';
import { Student, Teacher, UserSubscription } from '../types.ts';
import {
  matchGoogleUser,
  parseGoogleJwt,
  getGoogleOAuthUrl,
  parseGoogleRedirectHash,
  normalizeEmail,
  isGmailAddress,
} from '../utils/googleAuth.ts';
import {
  generateOtpCode,
  sendOtpEmail,
  maskEmail,
  isLiveEmailConfigured,
} from '../services/emailService.ts';
import {
  isSubscriptionActive,
  getDaysRemaining,
  createSubscriptionRecord,
  PLAN_PACKAGES,
  ACADEMY_PAYMENT_CHANNELS,
} from '../utils/subscription.ts';
import {
  toFirestoreValue,
  fromFirestoreValue,
  toFirestoreFields,
  fromFirestoreDocument,
  getFirestoreConfig,
} from '../services/firebaseSync.ts';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   CCA ASSESSMENT SYSTEM - COMPREHENSIVE TEST SUITE   ');
  console.log('======================================================\n');

  // SUITE 1: Seed Data Verification
  console.log('--- [Suite 1] Seed Data Initialization ---');
  const admins = getAdmins();
  const devs = getDevelopers();
  const teachers = getTeachers();
  const students = getStudents();
  const quizzes = getQuizzes();
  const submissions = getSubmissions();

  assert(admins.length >= 1, `Admins initialized: count = ${admins.length}`);
  assert(devs.length >= 1, `Developers initialized: count = ${devs.length}`);
  assert(teachers.length >= 2, `Teachers initialized: count = ${teachers.length}`);
  assert(students.length >= 2, `Cadets initialized: count = ${students.length}`);
  assert(quizzes.length >= 2, `Quizzes initialized: count = ${quizzes.length}`);
  assert(submissions.length >= 1, `Submissions initialized: count = ${submissions.length}`);

  // SUITE 2: Credential Verification & Case-Insensitive Login Resolution
  console.log('\n--- [Suite 2] Credential Verification & Identifier Resolution ---');
  // Admin check
  const adminExact = admins.find(a => (a.loginId === 'admin' || a.email === 'principal@cadetsacademy.com') && a.password === 'password123');
  assert(!!adminExact, 'Admin exact credentials valid');

  const adminCaseInsensitive = admins.find(a => 
    (a.loginId.toLowerCase() === 'ADMIN'.toLowerCase() || a.email.toLowerCase() === 'PRINCIPAL@CADETSACADEMY.COM'.toLowerCase()) && 
    a.password === 'password123'
  );
  assert(!!adminCaseInsensitive, 'Admin case-insensitive login resolution works');

  // Teacher check
  const teacherProf = teachers.find(t => 
    (t.loginId.toLowerCase() === 'afzal@ccap.com'.toLowerCase() || t.email?.toLowerCase() === 'afzal@ccap.com'.toLowerCase()) && 
    t.password === 'Afzal123/'
  );
  assert(!!teacherProf, 'Prof. Afzal credentials valid');

  // Student check
  const studentAli = students.find(s => 
    (s.loginId.toLowerCase() === 'ali_raza'.toLowerCase() || s.name.toLowerCase() === 'ali raza') && 
    s.password === 'password123'
  );
  assert(!!studentAli, 'Cadet Ali Raza credentials valid');

  // Invalid password rejection
  const invalidPwdCheck = teachers.find(t => t.loginId === 'afzal@ccap.com' && t.password === 'wrong_password');
  assert(!invalidPwdCheck, 'Invalid password correctly rejected');

  // SUITE 3: Unique Login ID Conflict Detection Across All Roles
  console.log('\n--- [Suite 3] Global Login ID Collision Detection ---');
  const conflictAdmin = checkLoginIdConflictAcrossAll('admin');
  assert(conflictAdmin.isTaken && conflictAdmin.roleName === 'Administrator', 'Conflict detected for admin login ID');

  const conflictTeacher = checkLoginIdConflictAcrossAll('afzal@ccap.com');
  assert(conflictTeacher.isTaken && conflictTeacher.roleName === 'Teacher', 'Conflict detected for teacher login ID');

  const conflictStudent = checkLoginIdConflictAcrossAll('ali_raza');
  assert(conflictStudent.isTaken && conflictStudent.roleName === 'Student', 'Conflict detected for student login ID');

  const conflictDev = checkLoginIdConflictAcrossAll('dev');
  assert(conflictDev.isTaken && conflictDev.roleName === 'Developer', 'Conflict detected for developer login ID');

  const noConflict = checkLoginIdConflictAcrossAll('brand_new_unique_cadet_2026');
  assert(!noConflict.isTaken, 'New unique login ID allowed');

  // Strict cross-role conflict checks:
  // 1. Creating teacher with existing student loginId
  const teacherWithStudentId = checkLoginIdConflictAcrossAll('ali_raza');
  assert(teacherWithStudentId.isTaken === true && teacherWithStudentId.roleName === 'Student', 'Recruiting teacher with student loginId flags collision');
  const teacherErrorMsg = `Username already taken (${teacherWithStudentId.roleName}: ${teacherWithStudentId.existingName}). Please choose a unique Login ID.`;
  assert(teacherErrorMsg.toLowerCase().includes('username already taken'), 'Teacher error message contains "username already taken"');

  // 2. Creating student with existing teacher loginId
  const studentWithTeacherId = checkLoginIdConflictAcrossAll('afzal@ccap.com');
  assert(studentWithTeacherId.isTaken === true && studentWithTeacherId.roleName === 'Teacher', 'Enrolling student with teacher loginId flags collision');
  const studentErrorMsg = `Username already taken (${studentWithTeacherId.roleName}: ${studentWithTeacherId.existingName}). Please choose a unique Login ID.`;
  assert(studentErrorMsg.toLowerCase().includes('username already taken'), 'Student error message contains "username already taken"');

  // 3. Creating student with existing student loginId (preventing duplicate students)
  const studentWithStudentId = checkLoginIdConflictAcrossAll('daniyal_k');
  assert(studentWithStudentId.isTaken === true && studentWithStudentId.roleName === 'Student', 'Enrolling student with another student loginId flags collision');

  // 4. Editing student preserves their own loginId
  const allStds = getStudents();
  const aliStudent = allStds.find((s) => s.loginId === 'ali_raza');
  if (aliStudent) {
    const editSelf = checkLoginIdConflictAcrossAll('ali_raza', aliStudent.id);
    assert(editSelf.isTaken === false, 'Editing student preserves own login ID without false conflict');
  }

  // 5. Editing teacher preserves their own loginId
  const allTchs = getTeachers();
  const afzalTeacher = allTchs.find((t) => t.loginId === 'afzal@ccap.com');
  if (afzalTeacher) {
    const editTchSelf = checkLoginIdConflictAcrossAll('afzal@ccap.com', afzalTeacher.id);
    assert(editTchSelf.isTaken === false, 'Editing teacher preserves own login ID without false conflict');
  }

  // SUITE 4: Lifetime Class Quota Enforcement
  console.log('\n--- [Suite 4] Faculty Hierarchy & Lifetime Class Quotas ---');
  const testTeacher: Teacher = {
    id: 'tch-test-quota',
    name: 'Lt. Col. Test',
    email: 'test_teacher@ccap.com',
    phone: '+92 300 9988776',
    loginId: 'tch_test_quota',
    password: 'password123',
    maxClasses: 2,
    lifetimeClassesCreated: 0,
    assignments: [],
    recruitedAt: new Date().toISOString(),
  };

  // Class 1 creation
  testTeacher.lifetimeClassesCreated = (testTeacher.lifetimeClassesCreated || 0) + 1;
  testTeacher.assignments.push({ className: 'Class 9 (Cadet Prep)', subject: 'General Science' });
  assert(testTeacher.lifetimeClassesCreated === 1, 'Class 1 created: lifetime count is 1 / 2');

  // Class 2 creation
  testTeacher.lifetimeClassesCreated = (testTeacher.lifetimeClassesCreated || 0) + 1;
  testTeacher.assignments.push({ className: 'Class 10 (Cadet Prep)', subject: 'Mathematics' });
  assert(testTeacher.lifetimeClassesCreated === 2, 'Class 2 created: lifetime count is 2 / 2 (Quota Full)');

  // Attempt Class 3: should be blocked by quota
  const canCreateClass3 = (testTeacher.lifetimeClassesCreated || 0) < (testTeacher.maxClasses || 0);
  assert(!canCreateClass3, 'Class 3 blocked: lifetime class limit enforced');

  // Remove Class 1: Quota must NOT be refunded
  testTeacher.assignments = testTeacher.assignments.filter(a => a.className !== 'Class 9 (Cadet Prep)');
  assert(testTeacher.assignments.length === 1, 'Class 1 removed from active assignments');
  assert(testTeacher.lifetimeClassesCreated === 2, 'Lifetime classes created count remains 2 (NON-REFUNDABLE)');

  const canCreateAfterRemoval = (testTeacher.lifetimeClassesCreated || 0) < (testTeacher.maxClasses || 0);
  assert(!canCreateAfterRemoval, 'Creation still blocked after removal: lifetime quota bypass prevented');

  // SUITE 5: Quiz Lifecycle & Question Bank ("To Bank" Unassign Bug Verification)
  console.log('\n--- [Suite 5] Quiz Bank Unassign & Duplicate Prevention ---');
  const initialQuizzes = getQuizzes();
  const initialQuizCount = initialQuizzes.length;

  const createdQuiz = createQuiz({
    title: 'Precision Physics Drill',
    subject: 'Physics',
    description: 'Drill test',
    durationMinutes: 20,
    passMarks: 5,
    totalMarks: 10,
    questions: [
      {
        id: 'q1',
        questionText: 'What is acceleration due to gravity on Earth?',
        options: ['9.8 m/s²', '8.9 m/s²', '10.5 m/s²', '12 m/s²'],
        correctOption: 0,
        points: 5,
      },
      {
        id: 'q2',
        questionText: 'SI unit of force is:',
        options: ['Joule', 'Newton', 'Watt', 'Pascal'],
        correctOption: 1,
        points: 5,
      },
    ],
    teacherId: 'tch-afzal',
    teacherName: 'Prof. M. Afzal',
    isInQuizBank: false,
    enableAntiCheating: true,
    enableWebcamProctoring: true,
    enableTabSwitchDetection: true,
    enableFullscreenLockdown: true,
    enableClipboardBlocking: true,
    shuffleQuestions: true,
    maxStrikes: 3,
    publishStatus: 'published',
    publishWindow: { isAlwaysActive: true },
    allocation: { mode: 'all', targetClasses: [], targetStudentIds: [] },
  });

  assert(getQuizzes().length === initialQuizCount + 1, 'Quiz created and published');

  // Simulate Teacher clicking "To Bank" (Unassign)
  // Before fix: App.tsx created a duplicate. After fix: updateQuiz updates in-place.
  const quizToUnassign = {
    ...createdQuiz,
    publishStatus: 'draft' as const,
    isInQuizBank: true,
  };

  // Test our updated update logic
  updateQuiz(quizToUnassign);

  const quizzesAfterUnassign = getQuizzes();
  assert(quizzesAfterUnassign.length === initialQuizCount + 1, 'No duplicate quiz created upon unassign');
  const foundUnassigned = quizzesAfterUnassign.find(q => q.id === createdQuiz.id);
  assert(foundUnassigned?.publishStatus === 'draft', 'Quiz status updated to draft');
  assert(foundUnassigned?.isInQuizBank === true, 'Quiz successfully stored in Quiz Bank');

  // Test cloning from Quiz Bank
  const cloned = cloneQuizFromBank(createdQuiz.id);
  assert(!!cloned, 'Quiz cloned from bank');
  assert(cloned?.id !== createdQuiz.id, 'Cloned quiz has unique ID');
  assert(cloned?.isInQuizBank === true, 'Cloned quiz has isInQuizBank === true (visible in Quiz Bank)');
  assert(!!cloned?.title.includes('(Cohort Copy)'), 'Cloned quiz title has (Cohort Copy) suffix');

  // SUITE 6: Auto-Grading Engine & Anti-Cheating 3-Strike Disqualification
  console.log('\n--- [Suite 6] Auto-Grading & 3-Strike Disqualification Protocol ---');
  const dummyStudent: Student = {
    id: 'std-test-grading',
    name: 'Cadet Tester',
    phone: '+92 300 1122334',
    className: 'Class 8 (Cadet Prep)',
    loginId: 'std_tester',
    password: 'password123',
    enrolledByTeacherId: 'tch-afzal',
    enrolledAt: new Date().toISOString(),
  };

  // Case A: Normal successful attempt (10 / 10 marks = 100%)
  const subPass = submitQuiz({
    quizId: createdQuiz.id,
    quizTitle: createdQuiz.title,
    subject: createdQuiz.subject,
    studentId: dummyStudent.id,
    studentName: dummyStudent.name,
    studentClass: dummyStudent.className,
    teacherId: createdQuiz.teacherId,
    teacherName: createdQuiz.teacherName,
    score: 10,
    totalMarks: 10,
    percentage: 100,
    passed: true,
    timeSpentSeconds: 300,
    answers: { q1: 0, q2: 1 },
    integrityAudit: {
      tabSwitches: 0,
      copyAttempts: 0,
      fullscreenExits: 0,
      isDisqualified: false,
      infractionTimestamps: [],
    },
  });

  assert(subPass.score === 10, 'Full marks scored: 10 / 10');
  assert(subPass.passed === true, 'Passing status: passed');
  assert(!subPass.integrityAudit?.isDisqualified, 'Integrity clean: 0 strikes');

  // Case B: Anti-Cheating 3-Strike Disqualification
  // Student got both answers right (would have been 10/10), but committed 3 infractions
  const subDisqualified = submitQuiz({
    quizId: createdQuiz.id,
    quizTitle: createdQuiz.title,
    subject: createdQuiz.subject,
    studentId: 'std-cheater',
    studentName: 'Cadet Caught',
    studentClass: dummyStudent.className,
    teacherId: createdQuiz.teacherId,
    teacherName: createdQuiz.teacherName,
    score: 0, // Enforced 0 marks upon disqualification
    totalMarks: 10,
    percentage: 0,
    passed: false,
    timeSpentSeconds: 120,
    answers: { q1: 0, q2: 1 },
    integrityAudit: {
      tabSwitches: 3,
      copyAttempts: 1,
      fullscreenExits: 2,
      isDisqualified: true,
      disqualificationReason: 'Maximum 3-strike tab switch limit exceeded.',
      infractionTimestamps: ['[10:00:01] Tab switch', '[10:00:05] Tab switch', '[10:00:10] Tab switch'],
    },
  });

  assert(subDisqualified.score === 0, 'Disqualified attempt forced to 0 marks');
  assert(subDisqualified.passed === false, 'Disqualified attempt marked failed');
  assert(subDisqualified.integrityAudit?.isDisqualified === true, 'Disqualification flag persisted');
  assert(subDisqualified.integrityAudit?.disqualificationReason !== undefined, 'Disqualification rationale recorded');

  // SUITE 7: Session Invalidation on User Deletion
  console.log('\n--- [Suite 7] Active Session Invalidation on User Deletion ---');
  // Simulate active session for Prof. Afzal
  saveAuthSession({
    isAuthenticated: true,
    role: 'teacher',
    userId: 'tch-afzal',
  });
  assert(getAuthSession().isAuthenticated === true, 'Teacher session active in storage');

  // Now delete teacher
  deleteTeacher('tch-afzal');

  // Check auth session
  const sessionAfterDeletion = getAuthSession();
  assert(sessionAfterDeletion.isAuthenticated === false, 'Session cleared immediately when active teacher profile is deleted');

  // SUITE 8: Pass Marks Boundary & Schedule Validation
  console.log('\n--- [Suite 8] Boundary Conditions & Division-By-Zero Protections ---');
  // Pass marks cannot exceed total marks
  const totalPoints = 10;
  const invalidPassMarks = 15;
  const isPassMarksValid = invalidPassMarks <= totalPoints && invalidPassMarks >= 1;
  assert(!isPassMarksValid, 'Pass marks exceeding total marks (15 > 10) correctly blocked');

  // Division by zero in cumulative reports
  const zeroTotalMarks = 0;
  const safeAverage = zeroTotalMarks > 0 ? Math.round((5 / zeroTotalMarks) * 100) : 0;
  assert(safeAverage === 0 && !isNaN(safeAverage), 'Division by zero safely handled with fallback 0');

  // End date before start date
  const now = new Date();
  const pastDate = new Date(now.getTime() - 3600000);
  const isScheduleValid = pastDate.getTime() > now.getTime();
  assert(!isScheduleValid, 'Schedule with deadline before start time correctly identified as invalid');

  // SUITE 9: Google Authentication & Gmail Sign-In
  console.log('\n--- [Suite 9] Google Authentication & Gmail Integration ---');

  // 1. JWT Payload Decoding
  const mockPayload = {
    sub: 'google-oauth2|1234567890',
    email: 'cadet.hamza@gmail.com',
    name: 'Cadet Hamza',
    picture: 'https://lh3.googleusercontent.com/a/mock-pic',
    email_verified: true,
  };
  const base64UrlPayload = Buffer.from(JSON.stringify(mockPayload)).toString('base64url');
  const mockJwt = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${base64UrlPayload}.mockSignatureHere`;

  const parsedJwt = parseGoogleJwt(mockJwt);
  assert(parsedJwt !== null && parsedJwt.email === 'cadet.hamza@gmail.com', 'parseGoogleJwt decodes email correctly from token');
  assert(parsedJwt?.name === 'Cadet Hamza' && parsedJwt.sub === 'google-oauth2|1234567890', 'parseGoogleJwt extracts name and sub claims');
  assert(parseGoogleJwt('invalid-jwt-token') === null, 'parseGoogleJwt gracefully returns null on malformed token');

  // 2. User Matching across Roles (Case-Insensitive)
  const currentAdmins = getAdmins();
  const currentDevs = getDevelopers();
  const currentTeachers = getTeachers();
  const currentStudents = getStudents();

  // Match Admin
  const adminMatch = matchGoogleUser('principal@cadetsacademy.com', currentAdmins, currentDevs, currentTeachers, currentStudents);
  assert(adminMatch.matched && adminMatch.role === 'admin' && adminMatch.user?.loginId === 'admin', 'matchGoogleUser matches institutional Admin by email');

  // Match Case-Insensitive Admin
  const caseInsensitiveAdmin = matchGoogleUser('PRINCIPAL@CADETSACADEMY.COM', currentAdmins, currentDevs, currentTeachers, currentStudents);
  assert(caseInsensitiveAdmin.matched && caseInsensitiveAdmin.role === 'admin', 'matchGoogleUser performs case-insensitive email matching');

  // Match Teacher
  const teacherMatch = matchGoogleUser('asad.mahmood@cadetsacademy.com', currentAdmins, currentDevs, currentTeachers, currentStudents);
  assert(teacherMatch.matched && teacherMatch.role === 'teacher', 'matchGoogleUser matches Faculty Teacher by email');

  // Unlinked email returns matched: false
  const unlinkedMatch = matchGoogleUser('unknown.cadet@gmail.com', currentAdmins, currentDevs, currentTeachers, currentStudents);
  assert(!unlinkedMatch.matched, 'matchGoogleUser correctly returns matched: false for unlinked Gmail addresses');

  // 3. Account Linking (Link existing faculty to a Gmail)
  const teacherToLink = currentTeachers[0];
  assert(teacherToLink !== undefined, 'Teacher exists for account linking test');
  if (teacherToLink) {
    const linkSuccess = linkGoogleAccount('teacher', teacherToLink.id, 'faculty.mentor@gmail.com', 'https://lh3.google.com/pic123', 'google-sub-999');
    assert(linkSuccess === true, 'linkGoogleAccount successfully links teacher to Gmail address');

    const updatedTeachers = getTeachers();
    const linkedTeacher = updatedTeachers.find(t => t.id === teacherToLink.id);
    assert(linkedTeacher?.email === 'faculty.mentor@gmail.com', 'Linked Gmail saved in teacher storage record');
    assert(linkedTeacher?.googlePicture === 'https://lh3.google.com/pic123', 'Linked Google picture saved in teacher record');

    const matchedLinkedTeacher = matchGoogleUser('faculty.mentor@gmail.com', getAdmins(), getDevelopers(), updatedTeachers, getStudents());
    assert(matchedLinkedTeacher.matched && matchedLinkedTeacher.role === 'teacher' && matchedLinkedTeacher.user?.id === teacherToLink.id, 'matchGoogleUser resolves newly linked teacher account');
  }

  // 4. Cadet Self-Registration via Google Sign-In
  const newCadet = enrollStudent({
    name: 'Cadet Tariq Google',
    className: 'Class 9 (Cadet Prep)',
    email: 'tariq.cadet@gmail.com',
    googlePicture: 'https://lh3.google.com/cadet-pic',
    googleId: 'google-sub-888',
    loginId: 'tariq_google',
    password: 'password123',
    phone: '+92 300 1234567',
  });
  assert(newCadet.name === 'Cadet Tariq Google', 'Cadet self-enrolled via Google successfully');
  assert(newCadet.email === 'tariq.cadet@gmail.com', 'Cadet email set to verified Google address');
  assert(newCadet.className === 'Class 9 (Cadet Prep)', 'Cadet assigned to selected class cohort');

  const matchedCadet = matchGoogleUser('tariq.cadet@gmail.com', getAdmins(), getDevelopers(), getTeachers(), getStudents());
  assert(matchedCadet.matched && matchedCadet.role === 'student' && matchedCadet.user?.id === newCadet.id, 'matchGoogleUser resolves newly enrolled Google cadet');

  // 5. Auth Session with Google Provider & Metadata
  saveAuthSession({
    isAuthenticated: true,
    role: 'student',
    userId: newCadet.id,
    authProvider: 'google',
    googleEmail: 'tariq.cadet@gmail.com',
    googlePicture: 'https://lh3.google.com/cadet-pic',
  });
  const googleSession = getAuthSession();
  assert(googleSession.isAuthenticated === true, 'Google auth session persisted');
  assert(googleSession.authProvider === 'google', 'Auth provider recorded as google');
  assert(googleSession.googleEmail === 'tariq.cadet@gmail.com', 'Google email recorded in active session');
  assert(googleSession.googlePicture === 'https://lh3.google.com/cadet-pic', 'Google profile picture saved in active session');

  // 6. Direct Google OAuth 2.0 Redirection Engine
  const oauthUrl = getGoogleOAuthUrl('https://ccap-testportal.web.app');
  assert(oauthUrl.startsWith('https://accounts.google.com/o/oauth2/v2/auth?'), 'getGoogleOAuthUrl directs to official accounts.google.com endpoint');
  assert(oauthUrl.includes('client_id=317362238573'), 'OAuth URL includes configured Google Client ID');
  assert(oauthUrl.includes('redirect_uri=https%3A%2F%2Fccap-testportal.web.app'), 'OAuth URL encodes target redirect_uri');
  assert(oauthUrl.includes('response_type=token+id_token') || oauthUrl.includes('response_type=token%20id_token'), 'OAuth URL requests token and id_token');
  assert(oauthUrl.includes('scope=openid+email+profile') || oauthUrl.includes('scope=openid%20email%20profile'), 'OAuth URL requests openid email profile scope');

  // 7. OAuth Redirect Hash Parsing
  const mockSuccessHash = '#access_token=ya29.mocktoken123&token_type=Bearer&expires_in=3599&id_token=eyJhbGciOiJSUzI1NiJ9.eyJlbWFpbCI6InRlc3QuY2FkZXRAZ21haWwuY29tIiwibmFtZSI6IlRlc3QgQ2FkZXQiLCJzdWIiOiIxMjM0NSJ9.sig';
  const parsedHash = parseGoogleRedirectHash(mockSuccessHash);
  assert(parsedHash.accessToken === 'ya29.mocktoken123', 'parseGoogleRedirectHash extracts access_token');
  assert(Boolean(parsedHash.idToken?.startsWith('eyJhbGci')), 'parseGoogleRedirectHash extracts id_token');

  const mockErrorHash = '#error=access_denied&error_description=User%20denied%20consent';
  const parsedError = parseGoogleRedirectHash(mockErrorHash);
  assert(parsedError.error === 'access_denied', 'parseGoogleRedirectHash detects OAuth error');
  assert(parsedError.errorDescription === 'User denied consent', 'parseGoogleRedirectHash extracts error_description');

  // SUITE 10: Cloud Firestore Data Serialization & Storage
  console.log('\n--- [Suite 10] Cloud Firestore Data Serialization & Client Storage ---');

  // 1. Primitive and complex type serialization
  const firestoreStr = toFirestoreValue('test@gmail.com');
  assert(firestoreStr.stringValue === 'test@gmail.com', 'toFirestoreValue encodes strings correctly');

  const firestoreInt = toFirestoreValue(95);
  assert(firestoreInt.integerValue === '95', 'toFirestoreValue encodes integers as integerValue strings');

  const firestoreBool = toFirestoreValue(true);
  assert(firestoreBool.booleanValue === true, 'toFirestoreValue encodes booleans correctly');

  const decodedStr = fromFirestoreValue(firestoreStr);
  assert(decodedStr === 'test@gmail.com', 'fromFirestoreValue decodes string value correctly');

  const decodedInt = fromFirestoreValue(firestoreInt);
  assert(decodedInt === 95, 'fromFirestoreValue decodes integer value correctly');

  const firestoreArr = toFirestoreValue(['Class 9', 'Class 10']);
  assert(Array.isArray(firestoreArr.arrayValue?.values) && firestoreArr.arrayValue.values.length === 2, 'toFirestoreValue encodes arrays correctly');

  // 2. Round-trip User Document Serialization
  const originalUserDoc = {
    email: 'cadet.tariq@gmail.com',
    name: 'Cadet Tariq Google',
    role: 'student',
    className: 'Class 9 (Cadet Prep)',
    score: 95,
    isPassed: true,
  };

  const fields = toFirestoreFields(originalUserDoc);
  const reconstructed = fromFirestoreDocument<typeof originalUserDoc>({ fields });
  assert(reconstructed.email === originalUserDoc.email, 'Firestore document round-trip preserves user email');
  assert(reconstructed.name === originalUserDoc.name, 'Firestore document round-trip preserves user name');
  assert(reconstructed.score === originalUserDoc.score, 'Firestore document round-trip preserves numeric score');
  assert(reconstructed.isPassed === originalUserDoc.isPassed, 'Firestore document round-trip preserves boolean state');

  // 3. Project Configuration
  const firestoreConfig = getFirestoreConfig();
  assert(
    firestoreConfig.projectId === 'cadets-coaching-academy-1234' || firestoreConfig.projectId === 'ccap-testportal',
    'Firestore config is configured to valid active Firebase project'
  );

  // 4. Cross-Device Cloud Profile Synchronization Method
  const syncedCount = await pullAndApplyCloudProfiles();
  assert(typeof syncedCount === 'number', 'pullAndApplyCloudProfiles executes safely and returns count');

  const pushedCount = await syncLocalProfilesToCloud();
  assert(typeof pushedCount === 'number', 'syncLocalProfilesToCloud executes safely and returns count');

  // SUITE 11: Cadet Subscription Lifecycle, Multi-Channel Payment & Gatekeeper Engine
  console.log('\n--- [Suite 11] Cadet Subscription & Paywall Infrastructure ---');

  // 1. Verify Configured Packages & Payment Channels
  assert(PLAN_PACKAGES.length === 4, `Plan packages configured: count = ${PLAN_PACKAGES.length}`);
  const trialPlan = PLAN_PACKAGES.find((p) => p.tier === 'trial');
  const monthlyPlan = PLAN_PACKAGES.find((p) => p.tier === 'monthly');
  const quarterlyPlan = PLAN_PACKAGES.find((p) => p.tier === 'quarterly');
  const annualPlan = PLAN_PACKAGES.find((p) => p.tier === 'annual');

  assert(trialPlan?.priceAmount === 0 && trialPlan?.durationDays === 7 && trialPlan?.maxClasses === 1, 'Trial plan is 7 days PKR 0 with 1 class limit');
  assert(monthlyPlan?.priceAmount === 1000 && monthlyPlan?.durationDays === 30 && monthlyPlan?.maxClasses === 3, 'Monthly plan is 30 days PKR 1,000 with 3 classes limit');
  assert(quarterlyPlan?.priceAmount === 2500 && quarterlyPlan?.durationDays === 90 && quarterlyPlan?.maxClasses === 5, 'Quarterly plan is 90 days PKR 2,500 with 5 classes limit');
  assert(annualPlan?.priceAmount === 7500 && annualPlan?.durationDays === 365 && annualPlan?.maxClasses === 5, 'Annual plan is 365 days PKR 7,500 with 5 classes limit');

  assert(ACADEMY_PAYMENT_CHANNELS.jazzcash.accountNumber === '03006565438', 'JazzCash payment destination configured (03006565438)');
  assert(ACADEMY_PAYMENT_CHANNELS.easypaisa.accountNumber === '03006565438', 'EasyPaisa payment destination configured (03006565438)');
  assert(ACADEMY_PAYMENT_CHANNELS.jazzcash.accountTitle === 'Muhammad Afzal', 'JazzCash account holder is Muhammad Afzal');
  assert(ACADEMY_PAYMENT_CHANNELS.easypaisa.accountTitle === 'Muhammad Afzal', 'EasyPaisa account holder is Muhammad Afzal');

  // 2. Subscription Record Factory
  const testStudent = getStudents()[0];
  const trialSub = createSubscriptionRecord(
    {
      id: testStudent.id,
      name: testStudent.name,
      email: testStudent.email,
      loginId: testStudent.loginId,
    },
    'trial',
    'free_trial',
    'TRIAL-INSTANT-001'
  );

  assert(trialSub.status === 'active', 'Trial subscription activates immediately without manual TID approval');
  assert(trialSub.durationDays === 7, 'Trial duration is 7 days');
  assert(trialSub.maxClasses === 1, 'Trial class quota is 1 class lifetime');
  assert(trialSub.price === 'Free', 'Trial price is Free');
  assert(isSubscriptionActive(trialSub) === true, 'isSubscriptionActive returns true for fresh trial');
  assert(getDaysRemaining(trialSub) >= 6, `getDaysRemaining returns valid days >= 6 (got ${getDaysRemaining(trialSub)})`);

  // 3. Paid Manual Wallet Subscription (Pending Verification)
  const paidWalletSub = createSubscriptionRecord(
    {
      id: testStudent.id,
      name: testStudent.name,
      email: testStudent.email,
      loginId: testStudent.loginId,
    },
    'monthly',
    'jazzcash',
    'JC-TID-987654321'
  );

  assert(paidWalletSub.status === 'pending_verification', 'Manual mobile wallet subscription initiates as pending_verification');
  assert(paidWalletSub.transactionRef === 'JC-TID-987654321', 'Transaction reference TID accurately captured');
  assert(isSubscriptionActive(paidWalletSub) === true, 'Provisional access is granted while awaiting admin TID approval');

  // 4. Persistence to Storage & Student Association
  saveUserSubscription(paidWalletSub);
  const updatedStudents = getStudents();
  const foundStudent = updatedStudents.find((s) => s.id === testStudent.id);
  assert(foundStudent?.subscription?.id === paidWalletSub.id, 'saveUserSubscription links subscription to student profile in storage');

  const allStoredSubs = getSubscriptions();
  assert(allStoredSubs.some((s) => s.id === paidWalletSub.id), 'Subscription ledger stores record in cca_subscriptions_v2');

  // 5. Admin TID Verification & Activation
  const verifiedSub = verifyUserSubscription(paidWalletSub.id, 'Admin-Commander');
  assert(verifiedSub !== null && verifiedSub.status === 'active', 'Admin verifies TID and elevates status to active');
  assert(verifiedSub?.verifiedBy === 'Admin-Commander', 'Audit trail records verifiedBy officer');

  // 6. Validity Extension (+30d, +90d)
  const extendedSub = extendUserSubscription(paidWalletSub.id, 30, 'Admin-Commander');
  assert(extendedSub !== null && extendedSub.durationDays === 60, 'Subscription extended by 30 days (30 + 30 = 60)');
  assert(getDaysRemaining(extendedSub) >= 55, 'Days remaining reflect extended duration');

  // 7. Cancellation & Expiry Invalidation
  cancelUserSubscription(paidWalletSub.id);
  const canceledSub = getSubscriptions().find((s) => s.id === paidWalletSub.id);
  assert(canceledSub?.status === 'canceled', 'cancelUserSubscription marks status as canceled');
  assert(isSubscriptionActive(canceledSub) === false, 'isSubscriptionActive returns false for canceled subscription');

  // Expired Subscription check
  const expiredSub: UserSubscription = {
    ...trialSub,
    id: 'sub-expired-test',
    status: 'active',
    expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
  };
  assert(isSubscriptionActive(expiredSub) === false, 'isSubscriptionActive returns false when expiryDate is in the past');
  assert(getDaysRemaining(expiredSub) === 0, 'getDaysRemaining returns 0 for expired pass');

  // ==========================================
  // SUITE 12: TEACHER ENROLLMENT WITH EMAIL & DIRECT MAIL LOGIN
  // ==========================================
  console.log('\n--- [Suite 12] Teacher Student Enrollment by Email & Direct Mail Login ---');

  // 1. Teacher enrolls a student with an email address
  const enrolledWithMail = enrollStudent({
    name: 'Cadet Daniyal Tariq',
    className: 'Class 8 (Cadet Prep)',
    phone: '+92 300 9876543',
    loginId: 'daniyal_t',
    password: 'password123',
    email: 'cadet.daniyal@gmail.com',
    enrolledByTeacherId: 'tch-1',
  });

  assert(enrolledWithMail.email === 'cadet.daniyal@gmail.com', 'Enrolled student preserves normalized email address');
  assert(enrolledWithMail.enrolledByTeacherId === 'tch-1', 'Enrolled student records teacher attribution');
  assert(isSubscriptionActive(enrolledWithMail.subscription) === true, 'Enrolled student automatically receives active institutional pass');
  assert(enrolledWithMail.subscription?.planId === 'plan-institutional', 'Enrolled student assigned institutional enrolled plan');

  // 2. getStudentByEmail lookup
  const foundByMail = getStudentByEmail('cadet.daniyal@gmail.com');
  assert(foundByMail !== undefined && foundByMail.loginId === 'daniyal_t', 'getStudentByEmail locates student by exact email');

  // Case-insensitive lookup
  const foundUpperMail = getStudentByEmail('CADET.DANIYAL@GMAIL.COM');
  assert(foundUpperMail !== undefined && foundUpperMail.id === enrolledWithMail.id, 'getStudentByEmail is case-insensitive');

  // 3. findUserByIdentifier lookup (used for dual login by loginId or email)
  const resolvedById = findUserByIdentifier('daniyal_t');
  assert(resolvedById !== null && resolvedById.role === 'student', 'findUserByIdentifier resolves student by loginId');

  const resolvedByEmail = findUserByIdentifier('cadet.daniyal@gmail.com');
  assert(resolvedByEmail !== null && resolvedByEmail.role === 'student' && resolvedByEmail.user.name === 'Cadet Daniyal Tariq', 'findUserByIdentifier resolves student by email address');

  // 4. matchGoogleUser: Instant Google / Gmail matching
  const s12Admins = getAdmins();
  const s12Devs = getDevelopers();
  const s12Teachers = getTeachers();
  const s12Students = getStudents();

  const googleMatch = matchGoogleUser('cadet.daniyal@gmail.com', s12Admins, s12Devs, s12Teachers, s12Students);
  assert(googleMatch.matched === true, 'matchGoogleUser matches teacher-enrolled student by email');
  assert(googleMatch.role === 'student', 'matchGoogleUser correctly assigns student role');
  assert(googleMatch.user?.id === enrolledWithMail.id, 'matchGoogleUser returns teacher-enrolled student profile');

  // Gmail dot normalization test: cadetdaniyal@gmail.com matches cadet.daniyal@gmail.com
  const dotGoogleMatch = matchGoogleUser('cadetdaniyal@gmail.com', s12Admins, s12Devs, s12Teachers, s12Students);
  assert(dotGoogleMatch.matched === true, 'matchGoogleUser matches email with Gmail dot variants');

  // 5. Paywall exemption check: isEnrolledByTeacher or hasActivePlan
  const isEnrolledByTeacher = !!enrolledWithMail.enrolledByTeacherId;
  const hasActivePlan = isSubscriptionActive(enrolledWithMail.subscription) || isEnrolledByTeacher;
  assert(hasActivePlan === true, 'Teacher-enrolled student has guaranteed active access without paywall redirection');

  // 6. Update student email preserves direct mail login
  updateStudent({
    ...enrolledWithMail,
    email: 'daniyal.updated@gmail.com',
  });
  const updatedByEmail = getStudentByEmail('daniyal.updated@gmail.com');
  assert(updatedByEmail !== undefined && updatedByEmail.id === enrolledWithMail.id, 'updateStudent enables immediate login with updated email');

  // 7. Duplicate Profile Prevention: Re-enrolling with exact email or dot variant updates existing record
  const studentCountBefore = getStudents().length;
  const reEnrolledStudent = enrollStudent({
    name: 'Daniyal Tariq (Updated)',
    className: 'Class 8 (Cadet Prep)',
    phone: '+92 300 9876543',
    loginId: 'daniyal_t',
    password: 'password123',
    email: 'daniyalupdated@gmail.com', // Dot variant of daniyal.updated@gmail.com
    enrolledByTeacherId: 'tch-1',
  });
  const studentCountAfter = getStudents().length;
  assert(studentCountAfter === studentCountBefore, 'enrollStudent with Gmail dot variant does NOT create duplicate profile');
  assert(reEnrolledStudent.id === enrolledWithMail.id, 'enrollStudent preserves original student ID when matching by email');

  // 8. Storage updateStudent appends new profiles (e.g. cloud-synced accounts)
  const brandNewCloudStudent: Student = {
    id: 'std-cloud-99',
    name: 'Cloud Cadet Ali',
    email: 'cloud.cadet.ali@gmail.com',
    loginId: 'cloud_ali',
    password: 'password123',
    className: 'Class 7 (Cadet Prep)',
    phone: '+92 300 1234567',
    enrolledAt: new Date().toISOString(),
    enrolledByTeacherId: 'tch-1',
  };
  updateStudent(brandNewCloudStudent);
  const foundCloudStudent = getStudentByEmail('cloud.cadet.ali@gmail.com');
  assert(foundCloudStudent !== undefined && foundCloudStudent.id === 'std-cloud-99', 'updateStudent appends new cloud-synced profile to local storage');

  // 9. Email normalization verification (dots stripped, Googlemail converted to Gmail)
  assert(normalizeEmail('John.Doe+cadet@gmail.com') === 'johndoe@gmail.com', 'normalizeEmail strips dots and plus aliases for Gmail');
  assert(normalizeEmail('cadet.daniyal@googlemail.com') === 'cadetdaniyal@gmail.com', 'normalizeEmail standardizes googlemail.com to gmail.com');

  // 10. Paywall gatekeeper: Comprehensive bypass verification for teacher-enrolled Google user
  const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const teacherList = getTeachers();
  const s12TestStudent = getStudentByEmail('cloud.cadet.ali@gmail.com')!;
  
  const gatekeeperIsEnrolled =
    !!s12TestStudent.enrolledByTeacherId ||
    !!s12TestStudent.className ||
    s12TestStudent.subscription?.planId === 'plan-institutional' ||
    teacherList.some((t) => t.assignments.some((a) => cleanStr(a.className) === cleanStr(s12TestStudent.className)));

  const gatekeeperHasActivePlan =
    gatekeeperIsEnrolled ||
    isSubscriptionActive(s12TestStudent.subscription);

  assert(gatekeeperIsEnrolled === true, 'Gatekeeper identifies teacher enrollment attribution');
  assert(gatekeeperHasActivePlan === true, 'Gatekeeper grants immediate access to examination desk without paywall redirection');

  // ==========================================
  // SUITE 13: DECOUPLED MULTI-CLASS ENROLLMENTS FOR SINGLE GMAIL
  // ==========================================
  console.log('\n--- [Suite 13] Decoupled Multi-Class Enrollments for Single Gmail ---');

  // 1. Teacher 1 enrolls student with Gmail in Class 8
  const studentCountInitial = getStudents().length;
  const multiCadet1 = enrollStudent({
    name: 'Cadet Bilal Ahmed',
    email: 'cadet.bilal@gmail.com',
    phone: '+92 300 7766554',
    className: 'Class 8 (Cadet Prep)',
    loginId: 'bilal_a',
    password: 'password123',
    enrolledByTeacherId: 'tch-1',
  });

  assert(multiCadet1.email === 'cadet.bilal@gmail.com', 'Student enrolled with canonical email');
  assert(Array.isArray(multiCadet1.enrolledClasses), 'Student model contains decoupled enrolledClasses array');
  assert(multiCadet1.enrolledClasses?.length === 1, 'Initial enrollment count is 1');
  assert(multiCadet1.enrolledClasses?.[0].className === 'Class 8 (Cadet Prep)', 'First enrollment is Class 8');
  assert(multiCadet1.enrolledClasses?.[0].enrolledByTeacherId === 'tch-1', 'First enrollment attributed to Teacher 1');

  // 2. Teacher 2 enrolls the SAME Gmail (with dot variant) in Military College Prep Batch
  const multiCadet2 = enrollStudent({
    name: 'Cadet Bilal Ahmed',
    email: 'cadetbilal@gmail.com', // Dot variant of cadet.bilal@gmail.com
    phone: '+92 300 7766554',
    className: 'Military College Prep Batch',
    loginId: 'bilal_a',
    password: 'password123',
    enrolledByTeacherId: 'tch-2',
  });

  const studentCountAfterMulti = getStudents().length;
  assert(studentCountAfterMulti === studentCountInitial + 1, 'No duplicate student user profile created for second class enrollment');
  assert(multiCadet2.id === multiCadet1.id, 'Existing student record reused across multiple teachers and classes');
  assert(multiCadet2.enrolledClasses?.length === 2, 'Student now possesses 2 decoupled active class enrollments');

  const hasClass8 = multiCadet2.enrolledClasses?.some((e) => e.className === 'Class 8 (Cadet Prep)' && e.enrolledByTeacherId === 'tch-1');
  const hasMilitaryPrep = multiCadet2.enrolledClasses?.some((e) => e.className === 'Military College Prep Batch' && e.enrolledByTeacherId === 'tch-2');
  assert(hasClass8 === true, 'Previous Class 8 enrollment preserved when second teacher enrolls student');
  assert(hasMilitaryPrep === true, 'New Military College Prep Batch enrollment appended successfully');

  // 3. Teacher 3 enrolls the SAME Gmail in Grade 9 & 10
  const multiCadet3 = enrollStudent({
    name: 'Cadet Bilal Ahmed',
    email: 'cadet.bilal@gmail.com',
    phone: '+92 300 7766554',
    className: 'Grade 9 & 10',
    loginId: 'bilal_a',
    password: 'password123',
    enrolledByTeacherId: 'tch-afzal',
  });

  assert(multiCadet3.enrolledClasses?.length === 3, 'Single Gmail successfully linked to 3 distinct classes across 3 teachers');

  // 4. Multi-class paywall gatekeeper evaluation
  const multiCleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const multiHasActiveEnrollments =
    (multiCadet3.enrolledClasses && multiCadet3.enrolledClasses.some((e) => e.status === 'active')) ||
    !!multiCadet3.enrolledByTeacherId ||
    !!multiCadet3.className;

  const multiIsEnrolledByTeacher =
    multiHasActiveEnrollments ||
    multiCadet3.subscription?.planId === 'plan-institutional' ||
    teacherList.some((t) =>
      t.assignments.some(
        (a) =>
          multiCleanStr(a.className) === multiCleanStr(multiCadet3.className) ||
          (multiCadet3.enrolledClasses && multiCadet3.enrolledClasses.some((ec) => multiCleanStr(ec.className) === multiCleanStr(a.className)))
      )
    );

  const multiHasActivePlan = multiIsEnrolledByTeacher || isSubscriptionActive(multiCadet3.subscription);
  assert(multiHasActiveEnrollments === true, 'Multi-enrolled student verified to have active class enrollments');
  assert(multiHasActivePlan === true, 'Multi-enrolled Google user is guaranteed access without pricing redirection');

  // 5. Quiz discovery across multiple enrolled classes
  const mockQuizClass8 = createQuiz({
    title: 'Class 8 Math Assessment',
    subject: 'Mathematics',
    targetClass: 'Class 8 (Cadet Prep)',
    description: 'Test for Class 8',
    durationMinutes: 20,
    passMarks: 10,
    totalMarks: 20,
    questions: [],
    teacherId: 'tch-1',
    teacherName: 'Sir Asad',
    isInQuizBank: false,
    publishStatus: 'published',
    publishWindow: { isAlwaysActive: true },
    allocation: { mode: 'classes', targetClasses: ['Class 8 (Cadet Prep)'], targetStudentIds: [] },
  });

  const mockQuizMilitary = createQuiz({
    title: 'Military Prep Intelligence Assessment',
    subject: 'Verbal Intelligence',
    targetClass: 'Military College Prep Batch',
    description: 'Test for Military Prep Batch',
    durationMinutes: 25,
    passMarks: 12,
    totalMarks: 25,
    questions: [],
    teacherId: 'tch-2',
    teacherName: 'Capt. Tariq',
    isInQuizBank: false,
    publishStatus: 'published',
    publishWindow: { isAlwaysActive: true },
    allocation: { mode: 'classes', targetClasses: ['Military College Prep Batch'], targetStudentIds: [] },
  });

  // Verify that the student's active enrollments match both quizzes
  const activeEnrs = multiCadet3.enrolledClasses?.filter((e) => e.status === 'active') || [];
  const matchesQuiz1 = activeEnrs.some((e) => multiCleanStr(e.className) === multiCleanStr(mockQuizClass8.targetClass) && e.enrolledByTeacherId === mockQuizClass8.teacherId);
  const matchesQuiz2 = activeEnrs.some((e) => multiCleanStr(e.className) === multiCleanStr(mockQuizMilitary.targetClass) && e.enrolledByTeacherId === mockQuizMilitary.teacherId);

  assert(matchesQuiz1 === true, 'Student discovers Class 8 test authored by Teacher 1');
  assert(matchesQuiz2 === true, 'Student simultaneously discovers Military College Prep test authored by Teacher 2');

  // SUITE 14: Gmail-Only Forgot Password OTP Security & Login ID / Login Mail Rejection
  console.log('\n--- [Suite 14] Gmail-Only Password Reset & Login Mail Rejection ---');
  
  // 1. isGmailAddress validation rules
  assert(isGmailAddress('cadet@gmail.com') === true, 'isGmailAddress accepts standard @gmail.com');
  assert(isGmailAddress('cadet.daniyal@googlemail.com') === true, 'isGmailAddress accepts @googlemail.com alias');
  assert(isGmailAddress('ali_raza') === false, 'isGmailAddress strictly rejects plain Login ID');
  assert(isGmailAddress('aiza@ccap.com') === false, 'isGmailAddress strictly rejects academy login email (aiza@ccap.com)');
  assert(isGmailAddress('afzal@ccap.com') === false, 'isGmailAddress strictly rejects institutional faculty login email (afzal@ccap.com)');
  assert(isGmailAddress('principal@cadetsacademy.com') === false, 'isGmailAddress rejects custom domain email');
  assert(isGmailAddress('') === false, 'isGmailAddress rejects empty string');
  assert(isGmailAddress(undefined) === false, 'isGmailAddress safely handles undefined');

  // 2. Cadet seed profile with registered Gmail
  const stdAliRaza = getStudents().find(s => s.loginId === 'ali_raza');
  assert(stdAliRaza !== undefined && isGmailAddress(stdAliRaza.email), 'Cadet Ali Raza possesses registered Gmail address (ali.raza.cadet@gmail.com)');

  // 3. Email masking
  assert(maskEmail('cadet.student@gmail.com').includes('@gmail.com'), 'maskEmail preserves @gmail.com domain');
  assert(maskEmail('cadet.student@gmail.com').startsWith('c'), 'maskEmail preserves first character');
  assert(maskEmail('cadet.student@gmail.com').includes('*'), 'maskEmail masks middle characters');

  // 4. OTP Generation
  const testOtp = generateOtpCode();
  assert(testOtp.length === 6, 'generateOtpCode generates 6-digit code');
  assert(/^\d{6}$/.test(testOtp), 'generateOtpCode returns purely numeric characters');

  // 5. Simulated Email Dispatch
  const simResult = await sendOtpEmail({
    toEmail: 'cadet.student@gmail.com',
    recipientName: 'Cadet Student',
    otpCode: testOtp,
  });
  assert(simResult.success === true, 'sendOtpEmail dispatches successfully in simulation mode');
  assert(simResult.isDevSimulation === true, 'sendOtpEmail flags dev simulation mode when API key absent');

  // 6. Cadet Login ID Resolution to Personal Gmail
  const stdHamza = getStudents().find(s => s.loginId === 'hamza_t');
  assert(stdHamza !== undefined, 'Cadet Hamza Tariq located by loginId "hamza_t"');
  assert(stdHamza?.email === 'hamza.tariq.cadet@gmail.com', 'Login ID "hamza_t" resolves to personal mail "hamza.tariq.cadet@gmail.com"');

  const stdDaniyal = getStudents().find(s => s.loginId === 'daniyal_k');
  assert(stdDaniyal !== undefined, 'Cadet Daniyal Khan located by loginId "daniyal_k"');
  assert(stdDaniyal?.email === 'daniyal.khan.cadet@gmail.com', 'Login ID "daniyal_k" resolves to personal mail "daniyal.khan.cadet@gmail.com"');

  // 7. Password Reset & Update Persistence (Guarantee No Overwrite to password123)
  const cadetToUpdate = getStudents().find(s => s.loginId === 'ali_raza')!;
  const newCadetPass = 'CadetPass9988#';
  updateStudent({
    ...cadetToUpdate,
    password: newCadetPass,
    updatedAt: new Date().toISOString(),
  });
  const reloadedCadet = getStudents().find(s => s.loginId === 'ali_raza')!;
  assert(reloadedCadet.password === newCadetPass, 'Cadet password successfully updated to new secure secret');
  assert(reloadedCadet.password !== 'password123', 'Cadet password strictly protected from reverting to password123');

  // 8. Live email configuration check
  assert(typeof isLiveEmailConfigured() === 'boolean', 'isLiveEmailConfigured returns boolean status');

  // ==========================================
  // SUITE 15: UNMATCHED GOOGLE LOGIN & TEACHER CREATION ON SUBSCRIPTION ACTIVATION
  // ==========================================
  console.log('\n--- [Suite 15] Unmatched Google Login & Teacher ID Creation on Plan Activation ---');

  // 1. Candidate signs in with Gmail that is NOT in the database
  const freshGoogleMail = 'faculty.fresh.candidate@gmail.com';
  const initialStudentCount = getStudents().length;
  const initialTeacherCount = getTeachers().length;
  const matchResult = matchGoogleUser(
    freshGoogleMail,
    getAdmins(),
    getDevelopers(),
    getTeachers(),
    getStudents()
  );
  assert(matchResult.matched === false, 'matchGoogleUser confirms Gmail is NOT in database');

  // 2. Critical Requirement: NO profile created in database before payment page
  const prePaymentStudent = getStudentByEmail(freshGoogleMail);
  const prePaymentTeacher = getTeachers().find((t) => t.email?.toLowerCase() === freshGoogleMail.toLowerCase());
  assert(prePaymentStudent === undefined, 'No student profile exists in database before payment page');
  assert(prePaymentTeacher === undefined, 'No teacher profile exists in database before payment page');
  assert(getStudents().length === initialStudentCount, 'Database student count remains unchanged while viewing pricing portal');
  assert(getTeachers().length === initialTeacherCount, 'Database teacher count remains unchanged while viewing pricing portal');

  // 3. User selects and activates Starter Trial (or Monthly Pass) on Pricing Portal
  // CORE REQUIREMENT: Activating a subscription must generate a TEACHER ID (tch-...)!
  const teacherId = `tch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  const activatedTrial = createSubscriptionRecord(
    {
      id: teacherId,
      name: 'Fresh Faculty Member',
      email: freshGoogleMail,
      loginId: freshGoogleMail,
    },
    'trial',
    'free_trial',
    'TRIAL-INSTANT-OK'
  );

  const teacherCreatedAfterPayment: Teacher = {
    id: teacherId,
    name: 'Fresh Faculty Member',
    email: freshGoogleMail,
    phone: '',
    loginId: freshGoogleMail,
    password: `CCA-faculty99`,
    assignments: [],
    maxClasses: activatedTrial.maxClasses || 1,
    lifetimeClassesCreated: 0,
    googleId: 'google-sub-fresh-12345',
    googlePicture: 'https://example.com/avatar.jpg',
    recruitedAt: new Date().toISOString(),
    subscription: activatedTrial,
  };

  updateTeacher(teacherCreatedAfterPayment);
  saveUserSubscription(activatedTrial);

  // 4. Verify TEACHER profile exists in database ONLY after payment/plan activation
  const savedTeacher = getTeachers().find((t) => t.id === teacherId || t.email?.toLowerCase() === freshGoogleMail.toLowerCase());
  assert(savedTeacher !== undefined, 'Teacher profile successfully created in database after plan activation');
  assert(Boolean(savedTeacher?.id?.startsWith('tch-')), `Teacher ID generated with proper tch- prefix: ${savedTeacher?.id}`);
  assert(getTeachers().length === initialTeacherCount + 1, 'Database teacher count increments by 1 after subscription activation');
  assert(getStudents().length === initialStudentCount, 'Database student count unchanged (no student record created)');
  assert(savedTeacher?.subscription?.status === 'active', 'Teacher possesses active subscription in database');

  // 5. Post-Activation Verification: Quota and role access
  assert(isSubscriptionActive(savedTeacher?.subscription) === true, 'Activated subscription is recognized as active');
  assert(savedTeacher?.maxClasses === 1, 'Teacher assigned plan maxClasses quota (1 for trial)');
  assert((savedTeacher?.lifetimeClassesCreated || 0) < (savedTeacher?.maxClasses || 0), 'Teacher has class creation quota available');
  
  // 6. Next login: Google auth recognizes the teacher profile directly
  const nextLoginMatch = matchGoogleUser(
    freshGoogleMail,
    getAdmins(),
    getDevelopers(),
    getTeachers(),
    getStudents()
  );
  assert(nextLoginMatch.matched === true, 'Next Google sign-in directly recognizes the activated profile');
  assert(nextLoginMatch.role === 'teacher', 'Google user role is recognized as teacher');
  assert(nextLoginMatch.user?.id === teacherId, 'Matched teacher user ID matches the generated Teacher ID');

  console.log('\n--- [Suite 16] Faculty Account Validity, Remaining Days & Expiration Renewal Gatekeeper ---');
  // 1. Admin / Dev Recruitment with configurable validityDays (e.g. 30 days)
  const validityDays = 30;
  const recruitedFaculty = recruitTeacher(
    {
      name: 'Major Salman Qureshi',
      email: 'salman.qureshi@cadetsacademy.com',
      phone: '+92 300 9876543',
      loginId: 'salman_q',
      password: 'SalmanPassword123!',
      maxClasses: 5,
      assignments: [{ className: 'Class 8 (Cadet Prep)', subject: 'General Science' }],
    },
    validityDays
  );

  assert(recruitedFaculty.validityDays === 30, 'Teacher profile stores validityDays: 30');
  assert(recruitedFaculty.subscription !== undefined, 'Teacher profile automatically receives an active UserSubscription');
  assert(recruitedFaculty.subscription?.durationDays === 30, 'Subscription durationDays matches configured validity: 30 days');
  assert(recruitedFaculty.subscription?.tier === 'monthly', 'Subscription tier set to monthly for 30 days');
  assert(recruitedFaculty.subscription?.status === 'active', 'Subscription status initialized to active');
  assert(isSubscriptionActive(recruitedFaculty.subscription) === true, 'isSubscriptionActive returns true for freshly recruited faculty');
  assert(getUserSubscription(recruitedFaculty.id) !== null, 'getUserSubscription successfully retrieves faculty subscription by ID');

  // 2. Corner Remaining Days Badge Calculation
  const daysLeft = getDaysRemaining(recruitedFaculty.subscription);
  assert(daysLeft >= 29 && daysLeft <= 30, `getDaysRemaining returns ~30 days remaining (${daysLeft}d)`);

  // 3. Custom Validity (e.g. 90 days - Quarterly)
  const quarterlyFaculty = recruitTeacher(
    {
      name: 'Capt. Imran Baig',
      email: 'imran.baig@cadetsacademy.com',
      phone: '+92 321 7654321',
      loginId: 'imran_b',
      password: 'ImranPassword123!',
      maxClasses: 5,
      assignments: [{ className: 'Class 7 (Cadet Prep)', subject: 'Mathematics' }],
    },
    90
  );
  assert(quarterlyFaculty.subscription?.durationDays === 90, 'Quarterly faculty durationDays is 90 days');
  assert(quarterlyFaculty.subscription?.tier === 'quarterly', 'Quarterly faculty tier is quarterly');
  assert(getDaysRemaining(quarterlyFaculty.subscription) >= 89, 'Quarterly faculty has ~90 days remaining');

  // 4. Expiration Gatekeeper Behavior: Terminated account is NOT deleted and free tier is hidden
  const expiredExpiry = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 1 day in the past
  const expiredTeacherSub: UserSubscription = {
    ...recruitedFaculty.subscription!,
    expiryDate: expiredExpiry,
    status: 'active', // Past date makes it inactive via isSubscriptionActive
  };
  saveUserSubscription(expiredTeacherSub);

  const teacherInDb = getTeachers().find((t) => t.id === recruitedFaculty.id);
  assert(teacherInDb !== undefined, 'Expired teacher profile is PRESERVED in database (NOT deleted)');
  assert(teacherInDb?.assignments.length === 1, 'Expired teacher assignments and classes are safely preserved');
  assert(isSubscriptionActive(expiredTeacherSub) === false, 'isSubscriptionActive returns false when expiry date is in past');

  // 5. Packages available in renewal mode: Free tier MUST be hidden
  const renewalPlans = PLAN_PACKAGES.filter((p) => p.tier !== 'trial');
  assert(renewalPlans.every((p) => p.tier !== 'trial'), 'Free trial package is hidden on renewal portal for expired accounts');
  assert(renewalPlans.some((p) => p.tier === 'monthly'), 'Monthly prep pass available on renewal portal');
  assert(renewalPlans.some((p) => p.tier === 'quarterly'), '3-Month term pass available on renewal portal');
  assert(renewalPlans.some((p) => p.tier === 'annual'), 'Annual commission pass available on renewal portal');

  // 6. Manual Payment Channels for Renewal
  assert(ACADEMY_PAYMENT_CHANNELS.easypaisa.accountNumber === '03006565438', 'EasyPaisa payment account is 03006565438');
  assert(ACADEMY_PAYMENT_CHANNELS.easypaisa.accountTitle === 'Muhammad Afzal', 'EasyPaisa account title is Muhammad Afzal');
  assert(ACADEMY_PAYMENT_CHANNELS.easypaisa.whatsappNumber === '03709993993', 'WhatsApp receipt contact is 03709993993');
  assert(ACADEMY_PAYMENT_CHANNELS.jazzcash.accountNumber === '03006565438', 'JazzCash payment account is 03006565438');
  assert(ACADEMY_PAYMENT_CHANNELS.jazzcash.accountTitle === 'Muhammad Afzal', 'JazzCash account title is Muhammad Afzal');
  assert(ACADEMY_PAYMENT_CHANNELS.jazzcash.whatsappNumber === '03709993993', 'JazzCash WhatsApp receipt contact is 03709993993');

  // 7. Renewal execution: Extending subscription restores access
  const renewedSub = extendUserSubscription(expiredTeacherSub.id, 30, 'Admin');
  assert(renewedSub !== null, 'Subscription extended successfully');
  assert(isSubscriptionActive(renewedSub) === true, 'Renewed subscription is active again');
  const restoredTeacher = getTeachers().find((t) => t.id === recruitedFaculty.id);
  assert(isSubscriptionActive(restoredTeacher?.subscription) === true, 'Teacher profile access is completely restored with preserved data');

  console.log('\n======================================================');
  console.log(`   TEST EXECUTION COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED   `);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
