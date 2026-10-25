import { useState, useEffect, useMemo } from 'react';
import { UserRole, Teacher, Student, Quiz, Submission, AdminUser, DeveloperUser, IntegrityAudit } from './types';
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getDevelopers,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper,
  getTeachers,
  recruitTeacher,
  updateTeacher,
  deleteTeacher,
  getActiveTeacherId,
  setActiveTeacherId,
  getStudents,
  enrollStudent,
  updateStudent,
  deleteStudent,
  getActiveStudentId,
  setActiveStudentId,
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  cloneQuizFromBank,
  getSubmissions,
  submitQuiz,
  exportFullDatabaseJSON,
  importFullDatabaseJSON,
  resetDatabaseToDefaults,
  getAuthSession,
  saveAuthSession,
  clearAuthSession,
  linkGoogleAccount,
  pullAndApplyCloudSync,
  saveUserSubscription,
  getSubscriptions,
  getUserSubscription,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { PlanPortal } from './components/PlanPortal';
import { isSubscriptionActive } from './utils/subscription';
import { normalizeEmail } from './utils/googleAuth';
import { DeveloperDashboard } from './components/DeveloperDashboard';
import { syncMasterDatabaseToFirestore } from './services/firebaseSync';
import { AdminDashboard } from './components/AdminDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentPortal } from './components/StudentPortal';
import { ManageProfileModal } from './components/ManageProfileModal';
import { RecruitTeacherModal } from './components/RecruitTeacherModal';
import { EnrollStudentModal } from './components/EnrollStudentModal';
import { CreateAssessmentModal } from './components/CreateAssessmentModal';
import { TakeAssessmentModal } from './components/TakeAssessmentModal';
import { ResultModal } from './components/ResultModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export function App() {
  const initialSession = getAuthSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialSession.isAuthenticated);
  const [currentRole, setCurrentRole] = useState<UserRole>(initialSession.role || 'developer');
  const [googleEmail, setGoogleEmail] = useState<string | undefined>(initialSession.googleEmail);
  const [googlePicture, setGooglePicture] = useState<string | undefined>(initialSession.googlePicture);

  // Entities
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [developers, setDevelopers] = useState<DeveloperUser[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [activeTeacherId, setActiveTeacherIdState] = useState<string>(
    initialSession.role === 'teacher' && initialSession.userId ? initialSession.userId : getActiveTeacherId()
  );
  const [activeStudentId, setActiveStudentIdState] = useState<string>(
    initialSession.role === 'student' && initialSession.userId ? initialSession.userId : getActiveStudentId()
  );

  // Mobile Bottom Nav Tabs for each role
  const [devTab, setDevTab] = useState<string>('profiles');
  const [adminTab, setAdminTab] = useState<string>('hierarchy');
  const [teacherTab, setTeacherTab] = useState<string>('students');
  const [studentTab, setStudentTab] = useState<string>('active_tests');

  // Left Sidebar State (Mobile off-canvas & Desktop Collapsible Rail)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Universal Profile Management Modal (Developer)
  const [isManageProfileModalOpen, setIsManageProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{ role: UserRole; data: any } | null>(null);

  // Admin Modals state
  const [isRecruitTeacherModalOpen, setIsRecruitTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Teacher Modals state
  const [isEnrollStudentModalOpen, setIsEnrollStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [enrollModalInitialClass, setEnrollModalInitialClass] = useState<string | undefined>(undefined);

  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [createQuizInitialMeta, setCreateQuizInitialMeta] = useState<{
    initialClass?: string;
    initialSubject?: string;
  } | null>(null);

  // Cadet Test Taking
  const [activeTakingQuiz, setActiveTakingQuiz] = useState<Quiz | null>(null);
  const [activeResultModal, setActiveResultModal] = useState<{
    submission: Submission;
    quiz: Quiz | null;
  } | null>(null);

  // Membership & Plan Portal Modal
  const [isPlanPortalModalOpen, setIsPlanPortalModalOpen] = useState(false);

  // Load initial data
  const refreshAllData = () => {
    const loadedAdmins = getAdmins();
    const loadedDevs = getDevelopers();
    const loadedTeachers = getTeachers();
    const loadedStudents = getStudents();
    const loadedQuizzes = getQuizzes();
    const loadedSubmissions = getSubmissions();

    setAdmins(loadedAdmins);
    setDevelopers(loadedDevs);
    setTeachers(loadedTeachers);
    setStudents(loadedStudents);
    setQuizzes(loadedQuizzes);
    setSubmissions(loadedSubmissions);

    const session = getAuthSession();
    if (!session.isAuthenticated) {
      setIsAuthenticated(false);
      return;
    }

    const evictSession = (reason: string = 'Your institutional account has been deactivated or removed by administration.') => {
      clearAuthSession();
      setGoogleEmail(undefined);
      setGooglePicture(undefined);
      setIsAuthenticated(false);
      setActiveTakingQuiz(null);
      setActiveResultModal(null);
      setIsManageProfileModalOpen(false);
      setIsRecruitTeacherModalOpen(false);
      setIsEnrollStudentModalOpen(false);
      setIsCreateQuizModalOpen(false);
      setIsPlanPortalModalOpen(false);
      try {
        alert(reason);
      } catch {}
    };

    if (session.role === 'teacher') {
      const targetId = session.userId || getActiveTeacherId();
      const matchedTeacher = loadedTeachers.find(
        (t) =>
          (targetId && (t.id === targetId || t.loginId.toLowerCase() === targetId.toLowerCase())) ||
          (t.email && targetId && normalizeEmail(t.email) === normalizeEmail(targetId)) ||
          (t.email && session.googleEmail && normalizeEmail(t.email) === normalizeEmail(session.googleEmail))
      );
      if (!matchedTeacher) {
        evictSession();
        return;
      }
      setActiveTeacherIdState(matchedTeacher.id);
      setActiveTeacherId(matchedTeacher.id);
    } else if (session.role === 'student') {
      const targetId = session.userId || getActiveStudentId();
      const matchedStudent = loadedStudents.find(
        (s) =>
          (targetId && (s.id === targetId || s.loginId?.toLowerCase() === targetId.toLowerCase())) ||
          (s.email && targetId && normalizeEmail(s.email) === normalizeEmail(targetId)) ||
          (s.email && session.googleEmail && normalizeEmail(s.email) === normalizeEmail(session.googleEmail))
      );
      if (!matchedStudent) {
        evictSession();
        return;
      }
      setActiveStudentIdState(matchedStudent.id);
      setActiveStudentId(matchedStudent.id);
    } else if (session.role === 'admin') {
      const matchedAdmin = loadedAdmins.find(
        (a) =>
          (!session.userId && !session.googleEmail) ||
          (session.userId && (a.id === session.userId || a.loginId.toLowerCase() === session.userId.toLowerCase())) ||
          (a.email && session.googleEmail && normalizeEmail(a.email) === normalizeEmail(session.googleEmail))
      );
      if (!matchedAdmin) {
        evictSession();
        return;
      }
    } else if (session.role === 'developer') {
      const matchedDev = loadedDevs.find(
        (d) =>
          (!session.userId && !session.googleEmail) ||
          (session.userId && (d.id === session.userId || d.loginId.toLowerCase() === session.userId.toLowerCase())) ||
          (d.email && session.googleEmail && normalizeEmail(d.email) === normalizeEmail(session.googleEmail))
      );
      if (!matchedDev) {
        evictSession();
        return;
      }
    }

    // Keep fallback activeTeacherId / activeStudentId valid for Admin/Developer views
    const currentActiveT = getActiveTeacherId();
    if (loadedTeachers.some((t) => t.id === currentActiveT)) {
      setActiveTeacherIdState(currentActiveT);
    } else if (loadedTeachers.length > 0) {
      setActiveTeacherIdState(loadedTeachers[0].id);
      setActiveTeacherId(loadedTeachers[0].id);
    }

    const currentActiveS = getActiveStudentId();
    if (loadedStudents.some((s) => s.id === currentActiveS)) {
      setActiveStudentIdState(currentActiveS);
    } else if (loadedStudents.length > 0) {
      setActiveStudentIdState(loadedStudents[0].id);
      setActiveStudentId(loadedStudents[0].id);
    }
  };

  useEffect(() => {
    refreshAllData();

    // Cross-device Cloud Firestore synchronization (smart single-document check)
    const runCloudSync = (force: boolean = false) => {
      pullAndApplyCloudSync(force)
        .then((hasUpdates) => {
          if (hasUpdates) refreshAllData();
        })
        .catch(() => {});
    };

    // Initial immediate cloud sync with Render MongoDB Atlas
    const initialSyncTimer = setTimeout(() => {
      runCloudSync(true);
    }, 50);

    // Periodic cloud poll (every 10 seconds)
    const pollInterval = setInterval(() => {
      runCloudSync(false);
    }, 10000);

    // Immediate sync triggers on tab focus, visibility change, or network reconnect
    const handleWindowFocus = () => {
      runCloudSync(false);
    };
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        runCloudSync(false);
      }
    };
    const handleOnline = () => {
      runCloudSync(false);
    };

    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cross-tab / Cross-window live synchronization
    const handleStorageChange = () => {
      refreshAllData();
    };
    window.addEventListener('storage', handleStorageChange);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('cca_live_sync_v2');
      channel.onmessage = () => {
        refreshAllData();
      };
    } catch (e) {
      // BroadcastChannel unsupported fallback
    }

    return () => {
      clearTimeout(initialSyncTimer);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // --- LOGIN / LOGOUT HANDLERS ---
  const handleLoginSuccess = (
    role: UserRole,
    userObj?: any,
    extraAuth?: { authProvider?: 'password' | 'google'; googleEmail?: string; googlePicture?: string }
  ) => {
    setCurrentRole(role);
    if (role === 'teacher' && userObj) {
      setActiveTeacherIdState(userObj.id);
      setActiveTeacherId(userObj.id);
      setTeacherTab('students');
    } else if (role === 'student' && userObj) {
      setActiveStudentIdState(userObj.id);
      setActiveStudentId(userObj.id);
      setStudentTab('active_tests');
    } else if (role === 'developer') {
      setDevTab('profiles');
    } else {
      setAdminTab('hierarchy');
    }

    setGoogleEmail(extraAuth?.googleEmail);
    setGooglePicture(extraAuth?.googlePicture);

    saveAuthSession({
      isAuthenticated: true,
      role,
      userId: userObj?.id,
      authProvider: extraAuth?.authProvider || 'password',
      googleEmail: extraAuth?.googleEmail,
      googlePicture: extraAuth?.googlePicture,
    });
    setIsAuthenticated(true);
    refreshAllData();
  };

  const handleLogout = () => {
    clearAuthSession();
    setGoogleEmail(undefined);
    setGooglePicture(undefined);
    setIsAuthenticated(false);
  };

  // --- DEVELOPER ACTIONS: UNIVERSAL PROFILE MANAGEMENT ---
  const handleOpenCreateProfileModal = () => {
    setEditingProfile(null);
    setIsManageProfileModalOpen(true);
  };

  const handleEditAnyProfile = (role: UserRole, data: any) => {
    setEditingProfile({ role, data });
    setIsManageProfileModalOpen(true);
  };

  const handleDeleteAnyProfile = (role: UserRole, id: string) => {
    if (role === 'admin') {
      deleteAdmin(id);
    } else if (role === 'developer') {
      deleteDeveloper(id);
    } else if (role === 'teacher') {
      deleteTeacher(id);
    } else if (role === 'student') {
      deleteStudent(id);
    }
    refreshAllData();
  };

  const handleImpersonateUser = (role: UserRole, userObj: any) => {
    handleLoginSuccess(role, userObj);
  };

  const handleSaveAdminUser = (data: Omit<AdminUser, 'id' | 'createdAt' | 'role'>, editId?: string) => {
    if (editId) {
      const existing = admins.find((a) => a.id === editId);
      if (existing) {
        updateAdmin({ ...existing, ...data });
      }
    } else {
      createAdmin(data);
    }
    refreshAllData();
  };

  const handleSaveDeveloperUser = (data: Omit<DeveloperUser, 'id' | 'createdAt' | 'role'>, editId?: string) => {
    if (editId) {
      const existing = developers.find((d) => d.id === editId);
      if (existing) {
        updateDeveloper({ ...existing, ...data });
      }
    } else {
      createDeveloper(data);
    }
    refreshAllData();
  };

  const handleSaveTeacherUser = (data: Omit<Teacher, 'id' | 'recruitedAt'>, editId?: string) => {
    if (editId) {
      const existing = teachers.find((t) => t.id === editId);
      if (existing) {
        let updatedSub = existing.subscription;
        if (data.validityDays && data.validityDays > 0) {
          const now = new Date();
          const expiry = new Date(now.getTime() + data.validityDays * 24 * 60 * 60 * 1000);
          updatedSub = {
            id: existing.subscription?.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            userId: existing.id,
            userName: data.name,
            userEmail: data.email,
            loginId: data.loginId,
            planId: `plan-faculty-${data.validityDays}d`,
            planName: `Faculty Pass (${data.validityDays} Days)`,
            tier:
              data.validityDays <= 7
                ? 'trial'
                : data.validityDays <= 30
                ? 'monthly'
                : data.validityDays <= 90
                ? 'quarterly'
                : 'annual',
            price: 'Institutional Grant',
            durationDays: data.validityDays,
            maxClasses: data.maxClasses || 5,
            status: 'active',
            startDate: now.toISOString(),
            expiryDate: expiry.toISOString(),
            paymentMethod: 'cash',
            transactionRef: 'DEVELOPER-PROVISION',
            activatedAt: now.toISOString(),
            verifiedAt: now.toISOString(),
            verifiedBy: 'DEVELOPER',
            notes: `Active validity configured for ${data.validityDays} days by Developer`,
          };
          saveUserSubscription(updatedSub);
        }
        updateTeacher({ ...existing, ...data, subscription: updatedSub });
      }
    } else {
      recruitTeacher(data, data.validityDays);
    }
    refreshAllData();
  };

  const handleSaveStudentUser = (data: Omit<Student, 'id' | 'enrolledAt'>, editId?: string) => {
    if (editId) {
      const existing = students.find((s) => s.id === editId);
      if (existing) {
        updateStudent({ ...existing, ...data });
      }
    } else {
      enrollStudent(data);
    }
    refreshAllData();
  };

  // --- DATABASE CONTROLS ---
  const handleExportDB = () => {
    const jsonStr = exportFullDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadets_academy_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDB = (jsonStr: string) => {
    const success = importFullDatabaseJSON(jsonStr);
    if (success) {
      refreshAllData();
    }
    return success;
  };

  const handleResetDB = () => {
    resetDatabaseToDefaults();
    refreshAllData();
  };

  const handleSyncToCloud = async (): Promise<boolean> => {
    try {
      const fullDb = JSON.parse(exportFullDatabaseJSON());
      const ok = await syncMasterDatabaseToFirestore(fullDb);
      return ok;
    } catch {
      return false;
    }
  };

  // --- TEACHER ACTIONS (Admin) ---
  const handleSaveTeacher = (teacherData: Omit<Teacher, 'id' | 'recruitedAt'>) => {
    if (editingTeacher) {
      let updatedSub = editingTeacher.subscription;
      if (teacherData.validityDays && teacherData.validityDays > 0) {
        const now = new Date();
        const expiry = new Date(now.getTime() + teacherData.validityDays * 24 * 60 * 60 * 1000);
        updatedSub = {
          id: editingTeacher.subscription?.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId: editingTeacher.id,
          userName: teacherData.name,
          userEmail: teacherData.email,
          loginId: teacherData.loginId,
          planId: `plan-faculty-${teacherData.validityDays}d`,
          planName: `Faculty Pass (${teacherData.validityDays} Days)`,
          tier:
            teacherData.validityDays <= 7
              ? 'trial'
              : teacherData.validityDays <= 30
              ? 'monthly'
              : teacherData.validityDays <= 90
              ? 'quarterly'
              : 'annual',
          price: 'Institutional Grant',
          durationDays: teacherData.validityDays,
          maxClasses: teacherData.maxClasses || 5,
          status: 'active',
          startDate: now.toISOString(),
          expiryDate: expiry.toISOString(),
          paymentMethod: 'cash',
          transactionRef: 'ADMIN-PROVISION',
          activatedAt: now.toISOString(),
          verifiedAt: now.toISOString(),
          verifiedBy: 'ADMIN',
          notes: `Active validity configured for ${teacherData.validityDays} days by Admin`,
        };
        saveUserSubscription(updatedSub);
      }
      updateTeacher({
        ...editingTeacher,
        ...teacherData,
        subscription: updatedSub,
      });
    } else {
      recruitTeacher(teacherData, teacherData.validityDays);
    }
    refreshAllData();
    setEditingTeacher(null);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsRecruitTeacherModalOpen(true);
  };

  const handleDeleteTeacher = (id: string) => {
    deleteTeacher(id);
    refreshAllData();
  };

  // --- STUDENT ACTIONS (Teacher) ---
  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'enrolledAt'>) => {
    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...studentData,
      });
    } else {
      enrollStudent(studentData);
    }
    refreshAllData();
    setEditingStudent(null);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEnrollStudentModalOpen(true);
  };

  const handleDeleteStudent = (id: string) => {
    deleteStudent(id);
    refreshAllData();
  };

  // --- QUIZ ACTIONS (Teacher) ---
  const handleSaveQuiz = (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (quizData.id) {
      const existing = quizzes.find((q) => q.id === quizData.id);
      if (existing) {
        updateQuiz({
          ...existing,
          ...quizData,
        } as Quiz);
      } else {
        updateQuiz(quizData as Quiz);
      }
    } else if (editingQuiz) {
      updateQuiz({
        ...editingQuiz,
        ...quizData,
      });
    } else {
      createQuiz(quizData);
    }
    refreshAllData();
    setEditingQuiz(null);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setIsCreateQuizModalOpen(true);
  };

  const handleDeleteQuiz = (id: string) => {
    deleteQuiz(id);
    refreshAllData();
  };

  const handleCloneQuiz = (quiz: Quiz) => {
    cloneQuizFromBank(quiz.id);
    refreshAllData();
  };

  // --- STUDENT TEST TAKING ---
  const handleStartTest = (quiz: Quiz) => {
    if (!currentStudent) return;
    const existingSub = submissions.find(
      (s) => s.studentId === currentStudent.id && s.quizId === quiz.id
    );
    if (existingSub) {
      alert(`Student ${currentStudent.name} has already submitted this examination. Retakes are strictly restricted.`);
      setActiveResultModal({
        submission: existingSub,
        quiz: quiz,
      });
      return;
    }
    setActiveTakingQuiz(quiz);
  };

  const handleSubmitQuiz = (
    quiz: Quiz,
    student: Student,
    answers: Record<string, number>,
    timeSpent: number,
    integrityAudit?: IntegrityAudit
  ) => {
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

    // Disqualification penalty: if disqualified for 3+ strikes, score is 0 and status is failed
    const score = integrityAudit?.isDisqualified ? 0 : rawScore;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = !integrityAudit?.isDisqualified && score >= quiz.passMarks;

    const sub = submitQuiz({
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

    refreshAllData();
    return sub;
  };

  const handleTestCompleted = (submission: Submission) => {
    setActiveTakingQuiz(null);
    const quiz = quizzes.find((q) => q.id === submission.quizId) || null;
    setActiveResultModal({
      submission,
      quiz,
    });
  };

  const handleViewResult = (submission: Submission) => {
    const quiz = quizzes.find((q) => q.id === submission.quizId) || null;
    setActiveResultModal({
      submission,
      quiz,
    });
  };

  const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const currentTeacher = teachers.find((t) => t.id === activeTeacherId) || teachers[0] || null;

  const teacherAvailableClasses = useMemo(() => {
    return currentTeacher
      ? Array.from(new Set(currentTeacher.assignments.map((a) => a.className)))
      : [];
  }, [currentTeacher?.id, currentTeacher?.assignments]);

  const teacherStudents = useMemo(() => {
    return currentTeacher
      ? students.filter((s) => s.enrolledByTeacherId === currentTeacher.id)
      : students;
  }, [currentTeacher?.id, students]);

  const currentStudent =
    students.find(
      (s) =>
        s.id === activeStudentId ||
        (activeStudentId && s.loginId?.toLowerCase() === activeStudentId.toLowerCase())
    ) ||
    (googleEmail
      ? students.find(
          (s) =>
            (s.email && (s.email.toLowerCase() === googleEmail.toLowerCase() || normalizeEmail(s.email) === normalizeEmail(googleEmail))) ||
            (s.googleId && initialSession.userId && s.googleId === initialSession.userId)
        )
      : null) ||
    students[0] ||
    null;

  // Active Tab per role for Bottom Nav
  const activeRoleTab =
    currentRole === 'developer'
      ? devTab
      : currentRole === 'admin'
      ? adminTab
      : currentRole === 'teacher'
      ? teacherTab
      : studentTab;

  const handleMobileTabChange = (tab: string) => {
    if (currentRole === 'developer') setDevTab(tab);
    else if (currentRole === 'admin') setAdminTab(tab);
    else if (currentRole === 'teacher') setTeacherTab(tab);
    else setStudentTab(tab);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // If user is not logged in, render the multi-role Login view
  if (!isAuthenticated) {
    return (
      <Login
        admins={admins}
        developers={developers}
        teachers={teachers}
        students={students}
        onLoginSuccess={handleLoginSuccess}
        onEnrollStudent={enrollStudent}
        onLinkAccount={linkGoogleAccount}
      />
    );
  }

  // --- GOOGLE STUDENT SUBSCRIPTION GATEKEEPER ---
  // If a cadet signs in with a Google account and does NOT have an active ongoing plan,
  // require them to activate/select a membership plan before accessing the examination desk.
  // NOTE: Students enrolled by a faculty teacher are officially authorized and bypass this paywall!
  const hasActiveEnrollments =
    (currentStudent?.enrolledClasses &&
      currentStudent.enrolledClasses.some((e) => e.status === 'active' && !!e.enrolledByTeacherId)) ||
    !!currentStudent?.enrolledByTeacherId;

  const isEnrolledByTeacher =
    hasActiveEnrollments ||
    currentStudent?.subscription?.planId === 'plan-institutional' ||
    (teachers &&
      !!currentStudent?.enrolledByTeacherId &&
      teachers.some((t) =>
        t.assignments.some(
          (a) =>
            cleanStr(a.className) === cleanStr(currentStudent?.className) ||
            (currentStudent?.enrolledClasses &&
              currentStudent.enrolledClasses.some((ec) => cleanStr(ec.className) === cleanStr(a.className)))
        )
      ));

  const isGoogleAuthUser =
    !!googleEmail ||
    initialSession.authProvider === 'google' ||
    (currentStudent && !!currentStudent.googleId);

  const hasActivePlan = isEnrolledByTeacher || isSubscriptionActive(currentStudent?.subscription);

  if (currentRole === 'student' && isGoogleAuthUser && !hasActivePlan) {
    return (
      <PlanPortal
        user={{
          id: currentStudent?.id || initialSession.userId || 'std-google',
          name: currentStudent?.name || 'Cadet Candidate',
          email: googleEmail || currentStudent?.email,
          loginId: currentStudent?.loginId || 'cadet',
          googlePicture: googlePicture || currentStudent?.googlePicture,
        }}
        currentSubscription={currentStudent?.subscription}
        onActivatePlan={(sub) => {
          saveUserSubscription(sub);
          const studentNow = getStudents().find(
            (s) =>
              s.id === (currentStudent?.id || initialSession.userId) ||
              (googleEmail && s.email?.toLowerCase() === googleEmail.toLowerCase())
          );
          if (studentNow && (!studentNow.className || !studentNow.enrolledClasses?.length)) {
            const updated: Student = {
              ...studentNow,
              className: studentNow.className || 'Class 8 (Cadet Prep)',
              enrolledClasses: studentNow.enrolledClasses?.length
                ? studentNow.enrolledClasses
                : [
                    {
                      enrollmentId: `enr-${studentNow.id}-${Date.now()}`,
                      className: 'Class 8 (Cadet Prep)',
                      enrolledByTeacherId: 'TEACHER',
                      status: 'active',
                      enrolledAt: new Date().toISOString(),
                    },
                  ],
              subscription: sub,
            };
            updateStudent(updated);
          }
          refreshAllData();
        }}
        onLogout={handleLogout}
      />
    );
  }

  // --- TEACHER SUBSCRIPTION EXPIRATION GATEKEEPER ---
  // If an instructor account's validity period has terminated/expired,
  // DO NOT delete their profile or class data. Show the packages page with hideFreeTier=true
  // so they can acquire a paid pass using the official payment instructions.
  const activeTeacherSub = currentTeacher
    ? currentTeacher.subscription || getUserSubscription(currentTeacher.id) || getUserSubscription(currentTeacher.loginId)
    : null;
  const isTeacherExpired = currentRole === 'teacher' && !!activeTeacherSub && !isSubscriptionActive(activeTeacherSub);

  if (currentRole === 'teacher' && isTeacherExpired && currentTeacher) {
    return (
      <PlanPortal
        user={{
          id: currentTeacher.id,
          name: currentTeacher.name,
          email: currentTeacher.email,
          loginId: currentTeacher.loginId,
          googlePicture: currentTeacher.googlePicture,
        }}
        currentSubscription={activeTeacherSub}
        hideFreeTier={true}
        onActivatePlan={(sub) => {
          saveUserSubscription(sub);
          const teacherNow = getTeachers().find(
            (t) => t.id === currentTeacher.id || t.loginId.toLowerCase() === currentTeacher.loginId.toLowerCase()
          );
          if (teacherNow) {
            updateTeacher({
              ...teacherNow,
              subscription: sub,
              validityDays: sub.durationDays,
              maxClasses: sub.maxClasses ?? teacherNow.maxClasses,
            });
          }
          refreshAllData();
        }}
        onLogout={handleLogout}
      />
    );
  }

  const pendingSubsCount = getSubscriptions().filter((s) => s.status === 'pending_verification').length;
  const activeQuizzesCount = quizzes.filter((q) => q.publishStatus === 'published').length;

  return (
    <div className="app-shell-layout">
      {/* Sleek Vertical Left Navigation Sidebar (Desktop Rail/Drawer & Mobile Off-Canvas) */}
      <Sidebar
        currentRole={currentRole}
        activeTab={activeRoleTab}
        onTabChange={handleMobileTabChange}
        currentTeacher={currentTeacher}
        currentStudent={currentStudent}
        googleEmail={googleEmail}
        googlePicture={googlePicture}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        pendingSubsCount={pendingSubsCount}
        activeQuizzesCount={activeQuizzesCount}
        studentsCount={students.length}
        teachersCount={teachers.length}
        onOpenPlanPortal={() => setIsPlanPortalModalOpen(true)}
        onOpenCreateQuiz={() => {
          setEditingQuiz(null);
          setCreateQuizInitialMeta(null);
          setIsCreateQuizModalOpen(true);
        }}
        onOpenEnrollStudent={() => {
          setEditingStudent(null);
          setEnrollModalInitialClass(undefined);
          setIsEnrollStudentModalOpen(true);
        }}
        onOpenRecruitTeacher={() => {
          setEditingTeacher(null);
          setIsRecruitTeacherModalOpen(true);
        }}
        onOpenCreateProfile={handleOpenCreateProfileModal}
        onOpenCumulativeReport={() => setStudentTab('history')}
      />

      <div className="app-main-viewport">
        <Navbar
          currentRole={currentRole}
          currentTeacher={currentTeacher}
          currentStudent={currentStudent}
          googleEmail={googleEmail}
          googlePicture={googlePicture}
          onLogout={handleLogout}
          onOpenPlanPortal={() => setIsPlanPortalModalOpen(true)}
        />

        <main className="main-content">
          {currentRole === 'developer' && (
          <DeveloperDashboard
            admins={admins}
            developers={developers}
            teachers={teachers}
            students={students}
            quizzes={quizzes}
            submissions={submissions}
            onOpenCreateProfileModal={handleOpenCreateProfileModal}
            onEditProfile={handleEditAnyProfile}
            onDeleteProfile={handleDeleteAnyProfile}
            onImpersonateUser={handleImpersonateUser}
            onExportDB={handleExportDB}
            onImportDB={handleImportDB}
            onResetDB={handleResetDB}
            onRefreshData={refreshAllData}
            onSyncToCloud={handleSyncToCloud}
            activeMobileTab={devTab}
            onMobileTabChange={setDevTab}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            teachers={teachers}
            students={students}
            quizzes={quizzes}
            submissions={submissions}
            activeMobileTab={adminTab}
            onMobileTabChange={setAdminTab}
            onOpenRecruitModal={() => {
              setEditingTeacher(null);
              setIsRecruitTeacherModalOpen(true);
            }}
            onEditTeacher={handleEditTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onViewResult={handleViewResult}
            onRefreshData={refreshAllData}
          />
        )}

        {currentRole === 'teacher' && (
          <TeacherDashboard
            teacher={currentTeacher}
            students={students}
            quizzes={quizzes}
            submissions={submissions}
            activeMobileTab={teacherTab}
            onMobileTabChange={setTeacherTab}
            onOpenPlanPortal={() => setIsPlanPortalModalOpen(true)}
            onOpenEnrollModal={(initialClass) => {
              setEditingStudent(null);
              setEnrollModalInitialClass(initialClass);
              setIsEnrollStudentModalOpen(true);
            }}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onOpenCreateQuizModal={(initialClass, initialSubject) => {
              setEditingQuiz(null);
              setCreateQuizInitialMeta(
                initialClass || initialSubject ? { initialClass, initialSubject } : null
              );
              setIsCreateQuizModalOpen(true);
            }}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onCloneQuiz={handleCloneQuiz}
            onViewResult={handleViewResult}
            onUpdateTeacher={(updated) => {
              updateTeacher(updated);
              refreshAllData();
            }}
            onSaveQuiz={(updated) => {
              updateQuiz(updated);
              refreshAllData();
            }}
          />
        )}

        {currentRole === 'student' && (
          <StudentPortal
            student={currentStudent}
            quizzes={quizzes}
            submissions={submissions}
            teachers={teachers}
            activeMobileTab={studentTab}
            onMobileTabChange={setStudentTab}
            onStartTest={handleStartTest}
            onViewResult={handleViewResult}
          />
        )}
      </main>
    </div>

    {/* Fixed Native Bottom Navigation Bar for Mobile Phones */}
      <MobileBottomNav
        currentRole={currentRole}
        activeTab={activeRoleTab}
        onTabChange={handleMobileTabChange}
      />

      {/* DEVELOPER UNIVERSAL PROFILE MODAL */}
      <ManageProfileModal
        isOpen={isManageProfileModalOpen}
        onClose={() => {
          setIsManageProfileModalOpen(false);
          setEditingProfile(null);
        }}
        onSaveAdmin={handleSaveAdminUser}
        onSaveDeveloper={handleSaveDeveloperUser}
        onSaveTeacher={handleSaveTeacherUser}
        onSaveStudent={handleSaveStudentUser}
        editingProfile={editingProfile}
      />

      {/* ADMIN RECRUIT TEACHER MODAL */}
      <RecruitTeacherModal
        isOpen={isRecruitTeacherModalOpen}
        onClose={() => {
          setIsRecruitTeacherModalOpen(false);
          setEditingTeacher(null);
        }}
        onSave={handleSaveTeacher}
        editingTeacher={editingTeacher}
      />

      {/* TEACHER ENROLL STUDENT MODAL */}
      <EnrollStudentModal
        isOpen={isEnrollStudentModalOpen}
        onClose={() => {
          setIsEnrollStudentModalOpen(false);
          setEditingStudent(null);
          setEnrollModalInitialClass(undefined);
        }}
        onEnroll={handleSaveStudent}
        teacherId={currentTeacher?.id}
        editingStudent={editingStudent}
        initialClass={enrollModalInitialClass}
        availableClasses={teacherAvailableClasses}
      />

      {/* TEACHER CREATE QUIZ MODAL */}
      <CreateAssessmentModal
        isOpen={isCreateQuizModalOpen}
        onClose={() => {
          setIsCreateQuizModalOpen(false);
          setEditingQuiz(null);
          setCreateQuizInitialMeta(null);
        }}
        onSave={handleSaveQuiz}
        teacher={currentTeacher}
        students={teacherStudents}
        editingQuiz={editingQuiz}
        initialClass={createQuizInitialMeta?.initialClass}
        initialSubject={createQuizInitialMeta?.initialSubject}
      />

      {/* STUDENT TEST TAKING MODAL */}
      {activeTakingQuiz && currentStudent && (
        <TakeAssessmentModal
          quiz={activeTakingQuiz}
          student={currentStudent}
          isOpen={true}
          onClose={() => setActiveTakingQuiz(null)}
          onSubmit={handleSubmitQuiz}
          onTestCompleted={handleTestCompleted}
        />
      )}

      {/* OFFICIAL SCORECARD / CERTIFICATE MODAL */}
      <ResultModal
        isOpen={!!activeResultModal}
        submission={activeResultModal?.submission || null}
        quiz={activeResultModal?.quiz || null}
        canPrint={currentRole !== 'student'}
        onClose={() => setActiveResultModal(null)}
      />

      {/* CADET PLAN & MEMBERSHIP MODAL */}
      {isPlanPortalModalOpen && (
        <div
          className="modal-backdrop"
          style={{
            zIndex: 1000,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setIsPlanPortalModalOpen(false)}
        >
          <div
            style={{
              maxWidth: '1200px',
              width: '100%',
              margin: 'auto',
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <PlanPortal
              isModal={true}
              user={{
                id:
                  currentRole === 'teacher' && currentTeacher
                    ? currentTeacher.id
                    : currentStudent?.id || initialSession.userId || 'usr-active',
                name:
                  currentRole === 'teacher' && currentTeacher
                    ? currentTeacher.name
                    : currentStudent?.name || 'Cadet',
                email:
                  currentRole === 'teacher' && currentTeacher
                    ? currentTeacher.email
                    : googleEmail || currentStudent?.email,
                loginId:
                  currentRole === 'teacher' && currentTeacher
                    ? currentTeacher.loginId
                    : currentStudent?.loginId || 'cadet',
                googlePicture:
                  currentRole === 'teacher' && currentTeacher
                    ? currentTeacher.googlePicture
                    : googlePicture || currentStudent?.googlePicture,
              }}
              currentSubscription={
                currentRole === 'teacher' && currentTeacher
                  ? currentTeacher.subscription ||
                    getUserSubscription(currentTeacher.id) ||
                    getUserSubscription(currentTeacher.loginId)
                  : currentStudent?.subscription
              }
              hideFreeTier={currentRole === 'teacher'}
              onActivatePlan={(sub) => {
                saveUserSubscription(sub);
                if (currentRole === 'teacher' && currentTeacher) {
                  const teacherNow = getTeachers().find(
                    (t) =>
                      t.id === currentTeacher.id ||
                      t.loginId.toLowerCase() === currentTeacher.loginId.toLowerCase()
                  );
                  if (teacherNow) {
                    updateTeacher({
                      ...teacherNow,
                      subscription: sub,
                      validityDays: sub.durationDays,
                      maxClasses: sub.maxClasses ?? teacherNow.maxClasses,
                    });
                  }
                }
                refreshAllData();
                setIsPlanPortalModalOpen(false);
              }}
              onClose={() => setIsPlanPortalModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
