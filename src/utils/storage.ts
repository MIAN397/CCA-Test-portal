import { Teacher, Student, Quiz, Submission, AdminUser, DeveloperUser, UserRole, IntegrityAudit, UserSubscription, StudentClassEnrollment } from '../types';
import {
  saveGoogleUserToFirestore,
  saveSubmissionToFirestore,
  syncProfileToFirestore,
  deleteProfileFromFirestore,
  fetchAllProfilesWithTombstonesFromFirestore,
  syncSubscriptionToFirestore,
  fetchAllSubscriptionsFromFirestore,
  syncQuizToFirestore,
  deleteQuizFromFirestore,
  fetchAllQuizzesFromFirestore,
  fetchAllSubmissionsFromFirestore,
} from '../services/firebaseSync';
import {
  fetchAllQuizzes,
  createQuizOnServer,
  updateQuizOnServer,
  deleteQuizOnServer,
  cloneQuizOnServer,
  fetchAllSubmissions,
  submitQuizToServer,
  fetchAllTeachers,
  fetchAllStudents,
} from '../services/api';
import {
  MASTER_ADMINS,
  MASTER_DEVELOPERS,
  MASTER_TEACHERS,
  MASTER_STUDENTS,
  MASTER_QUIZZES,
  MASTER_SUBMISSIONS,
  MASTER_SUBSCRIPTIONS,
} from './masterData';
import { normalizeEmail } from './googleAuth';

const STORAGE_KEYS = {
  ADMINS: 'cca_admins_v2',
  DEVELOPERS: 'cca_developers_v2',
  TEACHERS: 'cca_teachers_v2',
  STUDENTS: 'cca_students_v2',
  QUIZZES: 'cca_quizzes_v2',
  SUBMISSIONS: 'cca_submissions_v2',
  SUBSCRIPTIONS: 'cca_subscriptions_v2',
  ACTIVE_TEACHER_ID: 'cca_active_teacher_id_v2',
  ACTIVE_STUDENT_ID: 'cca_active_student_id_v2',
  DELETED_QUIZ_IDS: 'cca_deleted_quiz_ids_v2',
  DELETED_TEACHER_IDS: 'cca_deleted_teacher_ids_v2',
  DELETED_STUDENT_IDS: 'cca_deleted_student_ids_v2',
  DELETED_ADMIN_IDS: 'cca_deleted_admin_ids_v2',
  DELETED_DEV_IDS: 'cca_deleted_dev_ids_v2',
  AUTH_SESSION: 'cca_auth_session_v2',
};

const SCHEMA_VERSION_KEY = 'cca_schema_version';
const CURRENT_SCHEMA_VERSION = 'v3';

export const migrateStorageSchema = (): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const currentVer = localStorage.getItem(SCHEMA_VERSION_KEY);
    if (currentVer !== CURRENT_SCHEMA_VERSION) {
      // 1. Wipe stale deletion filter lists so master seed data and fresh cloud data populate
      localStorage.removeItem(STORAGE_KEYS.DELETED_STUDENT_IDS);
      localStorage.removeItem(STORAGE_KEYS.DELETED_TEACHER_IDS);
      localStorage.removeItem(STORAGE_KEYS.DELETED_ADMIN_IDS);
      localStorage.removeItem(STORAGE_KEYS.DELETED_DEV_IDS);
      localStorage.removeItem(STORAGE_KEYS.DELETED_QUIZ_IDS);

      // 2. Clear old cached lists so they re-initialize cleanly with master and cloud data
      localStorage.removeItem(STORAGE_KEYS.TEACHERS);
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.ADMINS);
      localStorage.removeItem(STORAGE_KEYS.DEVELOPERS);
      localStorage.removeItem(STORAGE_KEYS.QUIZZES);
      localStorage.removeItem('cca_last_cloud_sync_time');

      localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
    }
  } catch (e) {
    console.warn('Storage schema migration note:', e);
  }
};

// Automatically execute schema migration
migrateStorageSchema();

// --- 1. MASTER INITIAL DATASETS ---
const INITIAL_ADMINS: AdminUser[] = MASTER_ADMINS;
const INITIAL_DEVELOPERS: DeveloperUser[] = MASTER_DEVELOPERS;
const INITIAL_TEACHERS: Teacher[] = MASTER_TEACHERS;
const INITIAL_STUDENTS: Student[] = MASTER_STUDENTS;
const INITIAL_QUIZZES: Quiz[] = MASTER_QUIZZES;
const INITIAL_SUBMISSIONS: Submission[] = MASTER_SUBMISSIONS;
const INITIAL_SUBSCRIPTIONS: UserSubscription[] = MASTER_SUBSCRIPTIONS;

// --- REALTIME CROSS-TAB NOTIFICATION ---
const notifyLiveSync = () => {
  try {
    const channel = new BroadcastChannel('cca_live_sync_v2');
    channel.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
    channel.close();
  } catch (e) {
    // BroadcastChannel unsupported fallback
  }
};

// --- DELETED ENTITY TRACKING HELPERS ---
export const getDeletedQuizIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_QUIZ_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};
export const saveDeletedQuizIds = (ids: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.DELETED_QUIZ_IDS, JSON.stringify(ids));
};

export const getDeletedTeacherIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_TEACHER_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};
export const saveDeletedTeacherIds = (ids: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.DELETED_TEACHER_IDS, JSON.stringify(ids));
};

export const getDeletedStudentIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_STUDENT_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};
export const saveDeletedStudentIds = (ids: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.DELETED_STUDENT_IDS, JSON.stringify(ids));
};

export const getDeletedAdminIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_ADMIN_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};
export const saveDeletedAdminIds = (ids: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.DELETED_ADMIN_IDS, JSON.stringify(ids));
};

export const getDeletedDevIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_DEV_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};
export const saveDeletedDevIds = (ids: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.DELETED_DEV_IDS, JSON.stringify(ids));
};

// --- ADMINS CRUD ---
export const getAdmins = (): AdminUser[] => {
  try {
    const deletedIds = getDeletedAdminIds();
    const raw = localStorage.getItem(STORAGE_KEYS.ADMINS);
    if (!raw) {
      const filtered = INITIAL_ADMINS.filter((a) => !deletedIds.includes(a.id) && !deletedIds.includes(a.loginId.toLowerCase()));
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(filtered));
      return filtered;
    }
    const rawParsed: AdminUser[] = JSON.parse(raw);
    let modified = false;
    const parsed = rawParsed.filter((a) => {
      const isDeleted =
        deletedIds.includes(a.id) ||
        deletedIds.includes(a.loginId.toLowerCase()) ||
        (a.email && deletedIds.includes(a.email.toLowerCase()));
      if (isDeleted) modified = true;
      return !isDeleted;
    });
    INITIAL_ADMINS.forEach((initA) => {
      if (!deletedIds.includes(initA.id) && !deletedIds.includes(initA.loginId.toLowerCase())) {
        if (!parsed.some((a) => a.id === initA.id || a.loginId === initA.loginId)) {
          parsed.push(initA);
          modified = true;
        }
      }
    });
    if (modified) {
      saveAdmins(parsed);
    }
    return parsed;
  } catch (e) {
    return INITIAL_ADMINS;
  }
};

export const saveAdmins = (admins: AdminUser[]): void => {
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  notifyLiveSync();
};

export const createAdmin = (adminData: Omit<AdminUser, 'id' | 'createdAt' | 'role'>): AdminUser => {
  const admins = getAdmins();
  const adminLogin = adminData.loginId.trim().toLowerCase();
  const cleanEmail = adminData.email ? adminData.email.trim().toLowerCase() : '';

  // If this login was marked deleted, remove from deleted list for fresh account
  const deletedAdminIds = getDeletedAdminIds().filter(
    (id) => id.toLowerCase() !== adminLogin && (!cleanEmail || id.toLowerCase() !== cleanEmail)
  );
  saveDeletedAdminIds(deletedAdminIds);

  const newAdmin: AdminUser = {
    ...adminData,
    id: 'admin-' + Date.now(),
    role: 'admin',
    createdAt: new Date().toISOString(),
  };
  const updated = [newAdmin, ...admins.filter((a) => a.loginId.toLowerCase() !== adminLogin)];
  saveAdmins(updated);
  syncProfileToFirestore('admin', newAdmin).catch(() => {});
  return newAdmin;
};

/**
 * Universally resolves the safest password between an existing record and an incoming update/cloud sync.
 * Guarantees that an active custom password is NEVER overwritten by the seed default 'password123' or an empty string.
 */
export const resolveSafePassword = (
  existingPass?: string,
  incomingPass?: string,
  login?: string,
  email?: string
): string => {
  const cleanExisting = existingPass?.trim() || '';
  const cleanIncoming = incomingPass?.trim() || '';
  const isAfzal =
    login?.trim().toLowerCase() === 'afzal@ccap.com' ||
    email?.trim().toLowerCase() === 'afzal@ccap.com';
  if (isAfzal) {
    if (cleanIncoming && cleanIncoming !== 'password123') return cleanIncoming;
    if (cleanExisting && cleanExisting !== 'password123') return cleanExisting;
    return 'Afzal123/';
  }
  if (cleanExisting && cleanExisting !== 'password123' && (!cleanIncoming || cleanIncoming === 'password123')) {
    return cleanExisting;
  }
  if (cleanIncoming && cleanIncoming !== 'password123' && (!cleanExisting || cleanExisting === 'password123')) {
    return cleanIncoming;
  }
  return cleanIncoming || cleanExisting || '';
};

export const updateAdmin = (updatedAdmin: AdminUser): void => {
  const currentAdmins = getAdmins();
  const idx = currentAdmins.findIndex(
    (a) => a.id === updatedAdmin.id || a.loginId.toLowerCase() === updatedAdmin.loginId.toLowerCase()
  );
  const existing = idx >= 0 ? currentAdmins[idx] : undefined;
  const resolvedPassword = resolveSafePassword(
    existing?.password,
    updatedAdmin.password,
    updatedAdmin.loginId,
    updatedAdmin.email
  );

  const adminWithTimestamp: AdminUser = {
    ...updatedAdmin,
    password: resolvedPassword,
    updatedAt: updatedAdmin.updatedAt || new Date().toISOString(),
  };
  const admins =
    idx >= 0
      ? currentAdmins.map((a, i) => (i === idx ? adminWithTimestamp : a))
      : [adminWithTimestamp, ...currentAdmins];
  saveAdmins(admins);
  syncProfileToFirestore('admin', adminWithTimestamp).catch(() => {});
};

export const deleteAdmin = (id: string): void => {
  const admins = getAdmins();
  const adminToDelete = admins.find((a) => a.id === id || a.loginId.toLowerCase() === id.toLowerCase());
  const adminId = adminToDelete ? adminToDelete.id : id;
  const adminLogin = adminToDelete ? adminToDelete.loginId.toLowerCase() : id.toLowerCase();
  const adminEmail = adminToDelete?.email?.trim().toLowerCase();

  const remainingAdmins = admins.filter((a) => a.id !== adminId && a.loginId.toLowerCase() !== adminLogin);
  saveAdmins(remainingAdmins);

  const deletedAdminIds = getDeletedAdminIds();
  if (!deletedAdminIds.includes(adminId)) deletedAdminIds.push(adminId);
  if (!deletedAdminIds.includes(adminLogin)) deletedAdminIds.push(adminLogin);
  if (adminEmail && !deletedAdminIds.includes(adminEmail)) deletedAdminIds.push(adminEmail);
  saveDeletedAdminIds(deletedAdminIds);
  deleteProfileFromFirestore(adminLogin, adminToDelete?.email, adminId, adminToDelete?.googleId).catch(() => {});

  const currentSession = getAuthSession();
  if (
    currentSession.isAuthenticated &&
    currentSession.role === 'admin' &&
    (currentSession.userId === adminId ||
      currentSession.userId?.toLowerCase() === adminLogin ||
      (adminEmail && currentSession.googleEmail?.toLowerCase() === adminEmail))
  ) {
    clearAuthSession();
  }
};

// --- DEVELOPERS CRUD ---
export const getDevelopers = (): DeveloperUser[] => {
  try {
    const deletedIds = getDeletedDevIds();
    const raw = localStorage.getItem(STORAGE_KEYS.DEVELOPERS);
    if (!raw) {
      const filtered = INITIAL_DEVELOPERS.filter((d) => !deletedIds.includes(d.id) && !deletedIds.includes(d.loginId.toLowerCase()));
      localStorage.setItem(STORAGE_KEYS.DEVELOPERS, JSON.stringify(filtered));
      return filtered;
    }
    const rawParsed: DeveloperUser[] = JSON.parse(raw);
    let modified = false;
    const parsed = rawParsed.filter((d) => {
      const isDeleted =
        deletedIds.includes(d.id) ||
        deletedIds.includes(d.loginId.toLowerCase()) ||
        (d.email && deletedIds.includes(d.email.toLowerCase()));
      if (isDeleted) modified = true;
      return !isDeleted;
    });
    INITIAL_DEVELOPERS.forEach((initD) => {
      if (!deletedIds.includes(initD.id) && !deletedIds.includes(initD.loginId.toLowerCase())) {
        if (!parsed.some((d) => d.id === initD.id || d.loginId === initD.loginId)) {
          parsed.push(initD);
          modified = true;
        }
      }
    });
    if (modified) {
      saveDevelopers(parsed);
    }
    return parsed;
  } catch (e) {
    return INITIAL_DEVELOPERS;
  }
};

export const saveDevelopers = (devs: DeveloperUser[]): void => {
  localStorage.setItem(STORAGE_KEYS.DEVELOPERS, JSON.stringify(devs));
  notifyLiveSync();
};

export const createDeveloper = (devData: Omit<DeveloperUser, 'id' | 'createdAt' | 'role'>): DeveloperUser => {
  const devs = getDevelopers();
  const devLogin = devData.loginId.trim().toLowerCase();
  const cleanEmail = devData.email ? devData.email.trim().toLowerCase() : '';

  const deletedDevIds = getDeletedDevIds().filter(
    (id) => id.toLowerCase() !== devLogin && (!cleanEmail || id.toLowerCase() !== cleanEmail)
  );
  saveDeletedDevIds(deletedDevIds);

  const newDev: DeveloperUser = {
    ...devData,
    id: 'dev-' + Date.now(),
    role: 'developer',
    createdAt: new Date().toISOString(),
  };
  const updated = [newDev, ...devs.filter((d) => d.loginId.toLowerCase() !== devLogin)];
  saveDevelopers(updated);
  syncProfileToFirestore('developer', newDev).catch(() => {});
  return newDev;
};

export const updateDeveloper = (updatedDev: DeveloperUser): void => {
  const currentDevs = getDevelopers();
  const idx = currentDevs.findIndex(
    (d) => d.id === updatedDev.id || d.loginId.toLowerCase() === updatedDev.loginId.toLowerCase()
  );
  const existing = idx >= 0 ? currentDevs[idx] : undefined;
  const resolvedPassword = resolveSafePassword(
    existing?.password,
    updatedDev.password,
    updatedDev.loginId,
    updatedDev.email
  );

  const devWithTimestamp: DeveloperUser = {
    ...updatedDev,
    password: resolvedPassword,
    updatedAt: updatedDev.updatedAt || new Date().toISOString(),
  };
  const devs =
    idx >= 0
      ? currentDevs.map((d, i) => (i === idx ? devWithTimestamp : d))
      : [devWithTimestamp, ...currentDevs];
  saveDevelopers(devs);
  syncProfileToFirestore('developer', devWithTimestamp).catch(() => {});
};

export const deleteDeveloper = (id: string): void => {
  const devs = getDevelopers();
  const devToDelete = devs.find((d) => d.id === id || d.loginId.toLowerCase() === id.toLowerCase());
  const devId = devToDelete ? devToDelete.id : id;
  const devLogin = devToDelete ? devToDelete.loginId.toLowerCase() : id.toLowerCase();
  const devEmail = devToDelete?.email?.trim().toLowerCase();

  const remainingDevs = devs.filter((d) => d.id !== devId && d.loginId.toLowerCase() !== devLogin);
  saveDevelopers(remainingDevs);

  const deletedDevIds = getDeletedDevIds();
  if (!deletedDevIds.includes(devId)) deletedDevIds.push(devId);
  if (!deletedDevIds.includes(devLogin)) deletedDevIds.push(devLogin);
  if (devEmail && !deletedDevIds.includes(devEmail)) deletedDevIds.push(devEmail);
  saveDeletedDevIds(deletedDevIds);
  deleteProfileFromFirestore(devLogin, devToDelete?.email, devId, devToDelete?.googleId).catch(() => {});

  const currentSession = getAuthSession();
  if (
    currentSession.isAuthenticated &&
    currentSession.role === 'developer' &&
    (currentSession.userId === devId ||
      currentSession.userId?.toLowerCase() === devLogin ||
      (devEmail && currentSession.googleEmail?.toLowerCase() === devEmail))
  ) {
    clearAuthSession();
  }
};

// --- LOGIN ID UNIQUENESS VALIDATION HELPERS ---
export const isTeacherLoginIdTaken = (loginId: string, excludeId?: string): boolean => {
  const clean = loginId.trim().toLowerCase();
  if (!clean) return false;
  const teachers = getTeachers();
  return teachers.some((t) => t.loginId.trim().toLowerCase() === clean && t.id !== excludeId);
};

export const isStudentLoginIdTaken = (loginId: string, excludeId?: string): boolean => {
  const clean = loginId.trim().toLowerCase();
  if (!clean) return false;
  const students = getStudents();
  return students.some((s) => s.loginId.trim().toLowerCase() === clean && s.id !== excludeId);
};

export const isAdminLoginIdTaken = (loginId: string, excludeId?: string): boolean => {
  const clean = loginId.trim().toLowerCase();
  if (!clean) return false;
  const admins = getAdmins();
  return admins.some((a) => a.loginId.trim().toLowerCase() === clean && a.id !== excludeId);
};

export const isDeveloperLoginIdTaken = (loginId: string, excludeId?: string): boolean => {
  const clean = loginId.trim().toLowerCase();
  if (!clean) return false;
  const devs = getDevelopers();
  return devs.some((d) => d.loginId.trim().toLowerCase() === clean && d.id !== excludeId);
};

export const checkLoginIdConflictAcrossAll = (
  loginId: string,
  excludeId?: string
): { isTaken: boolean; roleName?: string; existingName?: string } => {
  const clean = loginId.trim().toLowerCase();
  if (!clean) return { isTaken: false };

  const teachers = getTeachers();
  const matchedT = teachers.find(
    (t) => (t.loginId?.trim().toLowerCase() === clean || (clean.includes('@') && t.email?.trim().toLowerCase() === clean)) && t.id !== excludeId
  );
  if (matchedT) return { isTaken: true, roleName: 'Teacher', existingName: matchedT.name };

  const students = getStudents();
  const matchedS = students.find(
    (s) => (s.loginId?.trim().toLowerCase() === clean || (clean.includes('@') && s.email?.trim().toLowerCase() === clean)) && s.id !== excludeId
  );
  if (matchedS) return { isTaken: true, roleName: 'Student', existingName: matchedS.name };

  const admins = getAdmins();
  const matchedA = admins.find(
    (a) => (a.loginId?.trim().toLowerCase() === clean || (clean.includes('@') && a.email?.trim().toLowerCase() === clean)) && a.id !== excludeId
  );
  if (matchedA) return { isTaken: true, roleName: 'Administrator', existingName: matchedA.name };

  const devs = getDevelopers();
  const matchedD = devs.find(
    (d) => (d.loginId?.trim().toLowerCase() === clean || (clean.includes('@') && d.email?.trim().toLowerCase() === clean)) && d.id !== excludeId
  );
  if (matchedD) return { isTaken: true, roleName: 'Developer', existingName: matchedD.name };

  return { isTaken: false };
};

// --- TEACHERS CRUD ---
export const getTeachers = (): Teacher[] => {
  try {
    const deletedIds = getDeletedTeacherIds();
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!raw) {
      const filtered = INITIAL_TEACHERS.filter((t) => !deletedIds.includes(t.id) && !deletedIds.includes(t.loginId.toLowerCase()));
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(filtered));
      return filtered;
    }
    const rawParsed: Teacher[] = JSON.parse(raw);
    let modified = false;
    const parsed = rawParsed.filter((t) => {
      const isDeleted =
        deletedIds.includes(t.id) ||
        deletedIds.includes(t.loginId.toLowerCase()) ||
        (t.email && deletedIds.includes(t.email.toLowerCase()));
      if (isDeleted) modified = true;
      return !isDeleted;
    });
    INITIAL_TEACHERS.forEach((initT) => {
      if (!deletedIds.includes(initT.id) && !deletedIds.includes(initT.loginId.toLowerCase())) {
        if (
          !parsed.some(
            (t) =>
              t.id === initT.id ||
              (t.email && initT.email && t.email.toLowerCase() === initT.email.toLowerCase()) ||
              t.loginId.toLowerCase() === initT.loginId.toLowerCase()
          )
        ) {
          parsed.push(initT);
          modified = true;
        }
      }
    });

    const deduped: Teacher[] = [];
    for (const t of parsed) {
      if (!t || !t.loginId) continue;
      const cleanLogin = t.loginId.trim().toLowerCase();
      const existingIdx = deduped.findIndex(
        (ex) => ex.id === t.id || ex.loginId.trim().toLowerCase() === cleanLogin
      );
      if (existingIdx >= 0) {
        const ex = deduped[existingIdx];
        const safePass = resolveSafePassword(ex.password, t.password, cleanLogin, t.email || ex.email);
        deduped[existingIdx] = {
          ...ex,
          ...t,
          id: ex.id || t.id,
          password: safePass,
          assignments:
            t.assignments && t.assignments.length >= (ex.assignments?.length || 0)
              ? t.assignments
              : ex.assignments || [],
          subscription: t.subscription || ex.subscription,
        };
        modified = true;
      } else {
        deduped.push(t);
      }
    }

    if (modified) {
      saveTeachers(deduped);
    }
    return deduped;
  } catch (e) {
    console.error('Error loading teachers', e);
    return INITIAL_TEACHERS;
  }
};

export const saveTeachers = (teachers: Teacher[]): void => {
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  notifyLiveSync();
};

export const recruitTeacher = (
  teacherData: Omit<Teacher, 'id' | 'recruitedAt'>,
  validityDaysParam?: number
): Teacher => {
  const teachers = getTeachers();
  const teacherLogin = teacherData.loginId.trim().toLowerCase();
  const cleanEmail = teacherData.email ? teacherData.email.trim().toLowerCase() : '';

  // If this loginId was marked deleted, remove from deleted list so a fresh account is created
  const deletedTeacherIds = getDeletedTeacherIds().filter(
    (id) => id.toLowerCase() !== teacherLogin && (!cleanEmail || id.toLowerCase() !== cleanEmail)
  );
  saveDeletedTeacherIds(deletedTeacherIds);

  const newId = 'tch-' + Date.now();

  // FRESH ACCOUNT GUARANTEE: Purge any orphaned students, quizzes, or submissions that might have matched this loginId
  const students = getStudents().filter(
    (s) =>
      s.enrolledByTeacherId !== newId &&
      s.enrolledByTeacherId?.toLowerCase() !== teacherLogin &&
      (!cleanEmail || !s.email || s.email.trim().toLowerCase() !== cleanEmail)
  );
  saveStudents(students);

  const quizzes = getQuizzes().filter(
    (q) => q.teacherId !== newId && q.teacherId?.toLowerCase() !== teacherLogin
  );
  saveQuizzes(quizzes);

  const submissions = getSubmissions().filter(
    (sub) => sub.teacherId !== newId && sub.teacherId?.toLowerCase() !== teacherLogin
  );
  saveSubmissions(submissions);

  const validityDays = Number(validityDaysParam ?? teacherData.validityDays ?? 0);
  let sub = teacherData.subscription;

  if (validityDays > 0) {
    const now = new Date();
    const expiry = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
    const tier =
      validityDays <= 7
        ? 'trial'
        : validityDays <= 30
        ? 'monthly'
        : validityDays <= 90
        ? 'quarterly'
        : 'annual';

    sub = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: newId,
      userName: teacherData.name,
      userEmail: teacherData.email,
      loginId: teacherData.loginId,
      planId: `plan-faculty-${validityDays}d`,
      planName: `Faculty Pass (${validityDays} Days)`,
      tier,
      price: 'Institutional Grant',
      durationDays: validityDays,
      maxClasses: teacherData.maxClasses || 5,
      status: 'active',
      startDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
      paymentMethod: 'cash',
      transactionRef: 'INSTITUTIONAL-RECRUITMENT',
      activatedAt: now.toISOString(),
      verifiedAt: now.toISOString(),
      verifiedBy: 'ADMIN',
      notes: `Active validity configured for ${validityDays} days upon faculty recruitment`,
    };
    saveUserSubscription(sub);
  }

  const newTeacher: Teacher = {
    ...teacherData,
    id: newId,
    lifetimeClassesCreated:
      teacherData.lifetimeClassesCreated ??
      (teacherData.assignments ? new Set(teacherData.assignments.map((a) => a.className)).size : 0),
    recruitedAt: new Date().toISOString(),
    validityDays: validityDays > 0 ? validityDays : undefined,
    subscription: sub,
  };

  const updated = [newTeacher, ...teachers.filter((t) => t.loginId.toLowerCase() !== teacherLogin)];
  saveTeachers(updated);
  syncProfileToFirestore('teacher', newTeacher).catch(() => {});
  return newTeacher;
};

export const updateTeacher = (updatedTeacher: Teacher): void => {
  const currentTeachers = getTeachers();
  const idx = currentTeachers.findIndex(
    (t) => t.id === updatedTeacher.id || t.loginId.toLowerCase() === updatedTeacher.loginId.toLowerCase()
  );
  const existing = idx >= 0 ? currentTeachers[idx] : undefined;
  const resolvedPassword = resolveSafePassword(
    existing?.password,
    updatedTeacher.password,
    updatedTeacher.loginId,
    updatedTeacher.email
  );

  const teacherWithTimestamp: Teacher = {
    ...updatedTeacher,
    password: resolvedPassword,
    updatedAt: updatedTeacher.updatedAt || new Date().toISOString(),
  };
  const teachers =
    idx >= 0
      ? currentTeachers.map((t, i) => (i === idx ? teacherWithTimestamp : t))
      : [teacherWithTimestamp, ...currentTeachers];
  saveTeachers(teachers);
  syncProfileToFirestore('teacher', teacherWithTimestamp).catch(() => {});
};

export const deleteTeacher = (id: string): void => {
  const teachers = getTeachers();
  const teacherToDelete = teachers.find((t) => t.id === id || t.loginId.toLowerCase() === id.toLowerCase());
  const teacherId = teacherToDelete ? teacherToDelete.id : id;
  const teacherLogin = teacherToDelete ? teacherToDelete.loginId.toLowerCase() : id.toLowerCase();
  const teacherEmail = teacherToDelete?.email?.trim().toLowerCase();

  // 1. Remove teacher
  const remainingTeachers = teachers.filter((t) => t.id !== teacherId && t.loginId.toLowerCase() !== teacherLogin);
  saveTeachers(remainingTeachers);

  // Add to deletedTeacherIds
  const deletedTeacherIds = getDeletedTeacherIds();
  if (!deletedTeacherIds.includes(teacherId)) deletedTeacherIds.push(teacherId);
  if (!deletedTeacherIds.includes(teacherLogin)) deletedTeacherIds.push(teacherLogin);
  if (teacherEmail && !deletedTeacherIds.includes(teacherEmail)) deletedTeacherIds.push(teacherEmail);
  saveDeletedTeacherIds(deletedTeacherIds);
  deleteProfileFromFirestore(teacherLogin, teacherToDelete?.email, teacherId, teacherToDelete?.googleId).catch(() => {});

  // 2. Cascade Delete: Find all students enrolled by this teacher
  const allStudents = getStudents();
  const studentsToDelete = allStudents.filter(
    (s) =>
      s.enrolledByTeacherId === teacherId ||
      s.enrolledByTeacherId === teacherLogin ||
      (s.enrolledByTeacherId && s.enrolledByTeacherId.toLowerCase() === teacherLogin)
  );
  const studentIdsToDelete = new Set(studentsToDelete.map((s) => s.id));
  const studentLoginsToDelete = new Set(studentsToDelete.map((s) => s.loginId.toLowerCase()));

  // Remove students
  const remainingStudents = allStudents.filter(
    (s) => !studentIdsToDelete.has(s.id) && !studentLoginsToDelete.has(s.loginId.toLowerCase())
  );
  saveStudents(remainingStudents);

  // Add students to deletedStudentIds and purge from Firestore
  const deletedStudentIds = getDeletedStudentIds();
  studentsToDelete.forEach((s) => {
    if (!deletedStudentIds.includes(s.id)) deletedStudentIds.push(s.id);
    const sLogin = s.loginId.toLowerCase();
    if (!deletedStudentIds.includes(sLogin)) deletedStudentIds.push(sLogin);
    const sEmail = s.email?.trim().toLowerCase();
    if (sEmail && !deletedStudentIds.includes(sEmail)) deletedStudentIds.push(sEmail);
    deleteProfileFromFirestore(sLogin, s.email, s.id, s.googleId).catch(() => {});
  });
  saveDeletedStudentIds(deletedStudentIds);

  // 3. Cascade Delete: Find all quizzes created by this teacher
  const allQuizzes = getQuizzes();
  const quizzesToDelete = allQuizzes.filter(
    (q) =>
      q.teacherId === teacherId ||
      q.teacherId === teacherLogin ||
      (q.teacherId && q.teacherId.toLowerCase() === teacherLogin)
  );
  const quizIdsToDelete = new Set(quizzesToDelete.map((q) => q.id));

  // Remove quizzes
  const remainingQuizzes = allQuizzes.filter((q) => !quizIdsToDelete.has(q.id));
  saveQuizzes(remainingQuizzes);

  // Add quizzes to deletedQuizIds
  const deletedQuizIds = getDeletedQuizIds();
  quizIdsToDelete.forEach((qid) => {
    if (!deletedQuizIds.includes(qid)) deletedQuizIds.push(qid);
  });
  saveDeletedQuizIds(deletedQuizIds);

  // 4. Cascade Delete: All submissions linked to this teacher, deleted students, or deleted quizzes
  const allSubmissions = getSubmissions();
  const remainingSubmissions = allSubmissions.filter((sub) => {
    if (sub.teacherId === teacherId || sub.teacherId === teacherLogin || sub.teacherId?.toLowerCase() === teacherLogin) return false;
    if (studentIdsToDelete.has(sub.studentId) || studentLoginsToDelete.has(sub.studentId.toLowerCase())) return false;
    if (quizIdsToDelete.has(sub.quizId)) return false;
    return true;
  });
  saveSubmissions(remainingSubmissions);

  // Reset active teacher if needed
  const activeTeacher = getActiveTeacherId();
  if (activeTeacher === teacherId || activeTeacher.toLowerCase() === teacherLogin) {
    if (remainingTeachers.length > 0) {
      setActiveTeacherId(remainingTeachers[0].id);
    }
  }

  // Clear auth session if current user was deleted
  const currentSession = getAuthSession();
  if (
    currentSession.isAuthenticated &&
    (currentSession.userId === teacherId ||
      currentSession.userId?.toLowerCase() === teacherLogin ||
      (teacherEmail && currentSession.googleEmail?.toLowerCase() === teacherEmail))
  ) {
    clearAuthSession();
  }
};

export const getActiveTeacherId = (): string => {
  const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TEACHER_ID);
  if (saved) return saved;
  const teachers = getTeachers();
  return teachers[0]?.id || 'tch-afzal';
};

export const setActiveTeacherId = (id: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TEACHER_ID, id);
};

// --- STUDENTS CRUD ---
export const getStudents = (): Student[] => {
  try {
    const deletedIds = getDeletedStudentIds();
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      const filtered = INITIAL_STUDENTS.filter((s) => !deletedIds.includes(s.id) && !deletedIds.includes(s.loginId.toLowerCase()));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
      return filtered;
    }
    const rawParsed: Student[] = JSON.parse(raw);
    let modified = false;
    const parsed = rawParsed.filter((s) => {
      const isDeleted =
        deletedIds.includes(s.id) ||
        (s.loginId && deletedIds.includes(s.loginId.toLowerCase())) ||
        (s.email && deletedIds.includes(s.email.toLowerCase()));
      if (isDeleted) modified = true;
      return !isDeleted;
    });
    INITIAL_STUDENTS.forEach((initS) => {
      if (!deletedIds.includes(initS.id) && !deletedIds.includes(initS.loginId.toLowerCase())) {
        if (!parsed.some((s) => s.id === initS.id || s.loginId === initS.loginId)) {
          parsed.push(initS);
          modified = true;
        }
      }
    });

    const mapped: Student[] = parsed.map((s) => {
      if (!s.enrolledClasses || s.enrolledClasses.length === 0) {
        if (s.className) {
          return {
            ...s,
            enrolledClasses: [
              {
                enrollmentId: `enr-init-${s.id}`,
                className: s.className,
                enrolledByTeacherId: s.enrolledByTeacherId || 'TEACHER',
                status: 'active' as const,
                enrolledAt: s.enrolledAt,
              },
            ],
          };
        }
      }
      return s;
    });

    if (modified) {
      saveStudents(mapped);
    }
    return mapped;
  } catch (e) {
    console.error('Error loading students', e);
    return INITIAL_STUDENTS;
  }
};

export const saveStudents = (students: Student[]): void => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  notifyLiveSync();
};

export const enrollStudent = (studentData: Omit<Student, 'id' | 'enrolledAt'>): Student => {
  const students = getStudents();
  const rawLogin = (studentData.loginId || ('std_' + Date.now())).trim();
  const studentLogin = rawLogin.toLowerCase();
  const cleanEmail = studentData.email ? studentData.email.trim().toLowerCase() : undefined;
  const normEmail = cleanEmail ? normalizeEmail(cleanEmail) : undefined;
  const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Look for any existing student record matching this loginId or email (including Gmail dot variants)
  const existing = students.find((s) => {
    if (s.loginId?.toLowerCase() === studentLogin) return true;
    if (cleanEmail && s.email) {
      const sClean = s.email.trim().toLowerCase();
      if (sClean === cleanEmail || normalizeEmail(sClean) === normEmail) return true;
    }
    return false;
  });

  // If this loginId or email was marked deleted, remove from deleted list for fresh account
  const deletedStudentIds = getDeletedStudentIds().filter(
    (id) => id.toLowerCase() !== studentLogin && (!cleanEmail || id.toLowerCase() !== cleanEmail)
  );
  saveDeletedStudentIds(deletedStudentIds);

  const studentId = existing?.id || ('std-' + Date.now());

  // Auto-grant active institutional academy membership so student is never blocked
  const institutionalSub: UserSubscription = {
    id: `sub-inst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: studentId,
    userName: studentData.name,
    userEmail: cleanEmail,
    loginId: rawLogin,
    planId: 'plan-institutional',
    planName: 'Institutional Enrolled Pass',
    tier: 'annual',
    price: 'Complimentary (Faculty Enrolled)',
    durationDays: 365,
    maxClasses: 5,
    status: 'active',
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'cash',
    transactionRef: `FACULTY-ENROLLED-${studentData.enrolledByTeacherId || 'TEACHER'}`,
    activatedAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'FACULTY_TEACHER',
    notes: 'Automatically authorized upon teacher enrollment.',
  };

  // Consolidate decoupled class enrollments
  let baseEnrollments: StudentClassEnrollment[] = [];
  if (existing?.enrolledClasses && existing.enrolledClasses.length > 0) {
    baseEnrollments = [...existing.enrolledClasses];
  } else if (existing?.className) {
    baseEnrollments = [
      {
        enrollmentId: `enr-legacy-${existing.id}`,
        className: existing.className,
        enrolledByTeacherId: existing.enrolledByTeacherId || 'TEACHER',
        status: 'active',
        enrolledAt: existing.enrolledAt || new Date().toISOString(),
      },
    ];
  }

  // Include any explicit enrolledClasses in studentData
  if (studentData.enrolledClasses && studentData.enrolledClasses.length > 0) {
    for (const ec of studentData.enrolledClasses) {
      if (!baseEnrollments.some((b) => cleanStr(b.className) === cleanStr(ec.className) && b.enrolledByTeacherId === ec.enrolledByTeacherId)) {
        baseEnrollments.push(ec);
      }
    }
  }

  // Add or update the incoming class enrollment
  if (studentData.className) {
    const cleanNewClass = cleanStr(studentData.className);
    const existingIndex = baseEnrollments.findIndex(
      (e) =>
        cleanStr(e.className) === cleanNewClass &&
        (e.enrolledByTeacherId === studentData.enrolledByTeacherId || !studentData.enrolledByTeacherId)
    );

    if (existingIndex >= 0) {
      baseEnrollments[existingIndex] = {
        ...baseEnrollments[existingIndex],
        status: 'active',
        enrolledByTeacherId: studentData.enrolledByTeacherId || baseEnrollments[existingIndex].enrolledByTeacherId,
        enrolledAt: new Date().toISOString(),
      };
    } else {
      baseEnrollments.push({
        enrollmentId: `enr-${studentId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        className: studentData.className,
        enrolledByTeacherId: studentData.enrolledByTeacherId || 'TEACHER',
        status: 'active',
        enrolledAt: new Date().toISOString(),
      });
    }
  }

  const finalSub = studentData.subscription || existing?.subscription || institutionalSub;
  saveUserSubscription(finalSub);

  const newStudent: Student = {
    ...existing,
    ...studentData,
    name: studentData.name?.trim() || existing?.name || '',
    email: cleanEmail || existing?.email,
    phone: studentData.phone?.trim() || existing?.phone || '',
    loginId: rawLogin || existing?.loginId || '',
    password: resolveSafePassword(existing?.password, studentData.password, rawLogin, cleanEmail),
    id: studentId,
    googleId: studentData.googleId || existing?.googleId,
    googlePicture: studentData.googlePicture || existing?.googlePicture,
    className: existing?.className || studentData.className || (baseEnrollments[0]?.className ?? 'Class 8 (Cadet Prep)'),
    enrolledByTeacherId: studentData.enrolledByTeacherId || existing?.enrolledByTeacherId || baseEnrollments[0]?.enrolledByTeacherId,
    enrolledClasses: baseEnrollments,
    subscription: finalSub,
    enrolledAt: existing?.enrolledAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Replace any existing student matching this studentId, loginId OR email
  const updated = [
    newStudent,
    ...students.filter((s) => {
      if (s.id === studentId) return false;
      if (s.loginId?.toLowerCase() === studentLogin) return false;
      if (cleanEmail && s.email) {
        const sClean = s.email.trim().toLowerCase();
        if (sClean === cleanEmail || normalizeEmail(sClean) === normEmail) return false;
      }
      return true;
    }),
  ];
  saveStudents(updated);

  // Background non-blocking sync to Firestore
  syncProfileToFirestore('student', newStudent).catch(() => {});
  if (newStudent.email || newStudent.googleId) {
    try {
      saveGoogleUserToFirestore({
        googleId: newStudent.googleId,
        email: newStudent.email || '',
        name: newStudent.name,
        role: 'student',
        className: newStudent.className,
        phone: newStudent.phone,
        loginId: newStudent.loginId,
        picture: newStudent.googlePicture,
        enrolledByTeacherId: newStudent.enrolledByTeacherId,
        enrolledClasses: newStudent.enrolledClasses,
        subscription: finalSub,
        authProvider: newStudent.googleId ? 'google' : 'local',
      }).catch(() => {});
    } catch {
      // Graceful offline degradation
    }
  }

  return newStudent;
};

export const updateStudent = (updatedStudent: Student): void => {
  const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanEmail = updatedStudent.email ? updatedStudent.email.trim().toLowerCase() : undefined;
  const normEmail = cleanEmail ? normalizeEmail(cleanEmail) : undefined;

  let enrolledClasses = updatedStudent.enrolledClasses || [];
  if (updatedStudent.className && !enrolledClasses.some((ec) => cleanStr(ec.className) === cleanStr(updatedStudent.className))) {
    enrolledClasses = [
      ...enrolledClasses,
      {
        enrollmentId: `enr-${updatedStudent.id}-${Date.now()}`,
        className: updatedStudent.className,
        enrolledByTeacherId: updatedStudent.enrolledByTeacherId || 'TEACHER',
        status: 'active',
        enrolledAt: updatedStudent.enrolledAt || new Date().toISOString(),
      },
    ];
  }

  const currentStudents = getStudents();
  const idx = currentStudents.findIndex(
    (s) =>
      s.id === updatedStudent.id ||
      (s.loginId && s.loginId.toLowerCase() === updatedStudent.loginId?.toLowerCase()) ||
      (cleanEmail && s.email && (s.email.toLowerCase() === cleanEmail || normalizeEmail(s.email) === normEmail))
  );
  const existing = idx >= 0 ? currentStudents[idx] : undefined;
  const resolvedPassword = resolveSafePassword(
    existing?.password,
    updatedStudent.password,
    updatedStudent.loginId,
    cleanEmail || existing?.email
  );

  const studentWithTimestamp: Student = {
    ...updatedStudent,
    password: resolvedPassword,
    email: cleanEmail,
    enrolledClasses,
    updatedAt: updatedStudent.updatedAt || new Date().toISOString(),
  };
  const students =
    idx >= 0
      ? currentStudents.map((s, i) => (i === idx ? studentWithTimestamp : s))
      : [studentWithTimestamp, ...currentStudents];
  saveStudents(students);
  syncProfileToFirestore('student', studentWithTimestamp).catch(() => {});
  if (studentWithTimestamp.email || studentWithTimestamp.googleId) {
    try {
      saveGoogleUserToFirestore({
        googleId: studentWithTimestamp.googleId,
        email: studentWithTimestamp.email || '',
        name: studentWithTimestamp.name,
        role: 'student',
        className: studentWithTimestamp.className,
        phone: studentWithTimestamp.phone,
        loginId: studentWithTimestamp.loginId,
        picture: studentWithTimestamp.googlePicture,
        enrolledByTeacherId: studentWithTimestamp.enrolledByTeacherId,
        enrolledClasses: studentWithTimestamp.enrolledClasses,
        subscription: studentWithTimestamp.subscription,
        authProvider: studentWithTimestamp.googleId ? 'google' : 'local',
      }).catch(() => {});
    } catch {
      // Graceful offline degradation
    }
  }
};

export const getStudentByEmail = (email: string): Student | undefined => {
  const clean = email.trim().toLowerCase();
  if (!clean) return undefined;
  const norm = normalizeEmail(clean);
  const students = getStudents();
  return students.find((s) => {
    const sEmail = s.email?.trim().toLowerCase();
    const sLogin = s.loginId?.trim().toLowerCase();
    return (
      sEmail === clean ||
      sLogin === clean ||
      (sEmail && normalizeEmail(sEmail) === norm) ||
      (sLogin && normalizeEmail(sLogin) === norm)
    );
  });
};

export const findUserByIdentifier = (
  identifier: string
): { role: UserRole; user: AdminUser | DeveloperUser | Teacher | Student } | null => {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;
  const norm = normalizeEmail(clean);

  // 1. Check Faculty Teachers
  const teacher = getTeachers().find(
    (t) =>
      t.loginId.trim().toLowerCase() === clean ||
      t.email?.trim().toLowerCase() === clean ||
      (t.email && normalizeEmail(t.email) === norm) ||
      (t.loginId && normalizeEmail(t.loginId) === norm)
  );
  if (teacher) return { role: 'teacher', user: teacher };

  // 2. Check Cadet Students
  const student = getStudents().find(
    (s) =>
      s.loginId.trim().toLowerCase() === clean ||
      s.email?.trim().toLowerCase() === clean ||
      (s.email && normalizeEmail(s.email) === norm) ||
      (s.loginId && normalizeEmail(s.loginId) === norm)
  );
  if (student) return { role: 'student', user: student };

  // 3. Check Administrators
  const admin = getAdmins().find(
    (a) =>
      a.loginId.trim().toLowerCase() === clean ||
      a.email?.trim().toLowerCase() === clean ||
      (a.email && normalizeEmail(a.email) === norm) ||
      (a.loginId && normalizeEmail(a.loginId) === norm)
  );
  if (admin) return { role: 'admin', user: admin };

  // 4. Check Developers
  const dev = getDevelopers().find(
    (d) =>
      d.loginId.trim().toLowerCase() === clean ||
      d.email?.trim().toLowerCase() === clean ||
      (d.email && normalizeEmail(d.email) === norm) ||
      (d.loginId && normalizeEmail(d.loginId) === norm)
  );
  if (dev) return { role: 'developer', user: dev };

  return null;
};

export const deleteStudent = (id: string): void => {
  const students = getStudents();
  const studentToDelete = students.find((s) => s.id === id || s.loginId?.toLowerCase() === id.toLowerCase());
  const studentId = studentToDelete ? studentToDelete.id : id;
  const studentLogin = (studentToDelete?.loginId || id).toLowerCase();
  const studentEmail = studentToDelete?.email?.trim().toLowerCase();

  const remainingStudents = students.filter(
    (s) => s.id !== studentId && s.loginId?.toLowerCase() !== studentLogin
  );
  saveStudents(remainingStudents);

  const deletedStudentIds = getDeletedStudentIds();
  if (!deletedStudentIds.includes(studentId)) deletedStudentIds.push(studentId);
  if (!deletedStudentIds.includes(studentLogin)) deletedStudentIds.push(studentLogin);
  if (studentEmail && !deletedStudentIds.includes(studentEmail)) deletedStudentIds.push(studentEmail);
  saveDeletedStudentIds(deletedStudentIds);
  deleteProfileFromFirestore(studentLogin, studentToDelete?.email, studentId, studentToDelete?.googleId).catch(() => {});

  // Cascade Delete: Delete all submissions made by this student
  const submissions = getSubmissions().filter(
    (sub) => sub.studentId !== studentId && sub.studentId.toLowerCase() !== studentLogin
  );
  saveSubmissions(submissions);

  // Clean from quiz target allocations
  const quizzes = getQuizzes().map((q) => {
    if (q.allocation?.targetStudentIds?.length) {
      return {
        ...q,
        allocation: {
          ...q.allocation,
          targetStudentIds: q.allocation.targetStudentIds.filter(
            (sid) => sid !== studentId && sid.toLowerCase() !== studentLogin
          ),
        },
      };
    }
    return q;
  });
  saveQuizzes(quizzes);

  const activeStudent = getActiveStudentId();
  if (activeStudent === studentId || activeStudent.toLowerCase() === studentLogin) {
    if (remainingStudents.length > 0) {
      setActiveStudentId(remainingStudents[0].id);
    }
  }

  // Clear auth session if current user was deleted
  const currentSession = getAuthSession();
  if (
    currentSession.isAuthenticated &&
    (currentSession.userId === studentId ||
      currentSession.userId?.toLowerCase() === studentLogin ||
      (studentEmail && currentSession.googleEmail?.toLowerCase() === studentEmail))
  ) {
    clearAuthSession();
  }
};

export const getActiveStudentId = (): string => {
  const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT_ID);
  if (saved) return saved;
  const students = getStudents();
  return students[0]?.id || 'std-1';
};

export const setActiveStudentId = (id: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT_ID, id);
};

// --- QUIZZES & QUIZ BANK CRUD ---
export const getQuizzes = (): Quiz[] => {
  try {
    const deletedIds = getDeletedQuizIds();
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    let parsed: Quiz[] = raw ? JSON.parse(raw) : [];
    let modified = false;

    if (!raw) {
      INITIAL_QUIZZES.forEach((initQ) => {
        if (!deletedIds.includes(initQ.id)) {
          parsed.push({ ...initQ });
          modified = true;
        }
      });
    } else {
      INITIAL_QUIZZES.forEach((initQ) => {
        if (!deletedIds.includes(initQ.id)) {
          const existing = parsed.find((q) => q.id === initQ.id);
          if (!existing) {
            parsed.push({ ...initQ });
            modified = true;
          }
        }
      });
    }

    if (modified || !raw) {
      saveQuizzes(parsed);
    }
    return parsed;
  } catch (e) {
    console.error('Error loading quizzes', e);
    return INITIAL_QUIZZES;
  }
};

export const saveQuizzes = (quizzes: Quiz[]): void => {
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  notifyLiveSync();
};

export const createQuiz = (
  quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>
): Quiz => {
  const quizzes = getQuizzes();
  const newQuiz: Quiz = {
    ...quizData,
    id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newQuiz, ...quizzes];
  saveQuizzes(updated);
  createQuizOnServer(newQuiz).catch((err) => console.warn('Render backend createQuiz sync notice:', err));
  syncQuizToFirestore(newQuiz).catch(() => {});
  return newQuiz;
};

export const updateQuiz = (updatedQuiz: Quiz): void => {
  const quizzes = getQuizzes().map((q) =>
    q.id === updatedQuiz.id ? { ...updatedQuiz, updatedAt: new Date().toISOString() } : q
  );
  saveQuizzes(quizzes);
  updateQuizOnServer(updatedQuiz.id, updatedQuiz).catch((err) => console.warn('Render backend updateQuiz sync notice:', err));
  syncQuizToFirestore(updatedQuiz).catch(() => {});
};

export const deleteQuiz = (id: string): void => {
  const deletedIds = getDeletedQuizIds();
  if (!deletedIds.includes(id)) {
    saveDeletedQuizIds([...deletedIds, id]);
  }
  const quizzes = getQuizzes().filter((q) => q.id !== id);
  saveQuizzes(quizzes);
  deleteQuizOnServer(id).catch((err) => console.warn('Render backend deleteQuiz sync notice:', err));
  deleteQuizFromFirestore(id).catch(() => {});

  // Cascade Delete: Delete all submissions for this quiz
  const submissions = getSubmissions().filter((sub) => sub.quizId !== id);
  saveSubmissions(submissions);
};

export const cloneQuizFromBank = (bankQuizId: string): Quiz | null => {
  const quizzes = getQuizzes();
  const source = quizzes.find((q) => q.id === bankQuizId);
  if (!source) return null;

  const now = new Date();
  const next3Days = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  const clonedQuiz: Quiz = {
    ...source,
    id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: `${source.title} (Cohort Copy)`,
    isInQuizBank: true,
    publishStatus: 'draft',
    publishWindow: {
      startAt: now.toISOString(),
      endAt: next3Days.toISOString(),
      isAlwaysActive: false,
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const updated = [clonedQuiz, ...quizzes];
  saveQuizzes(updated);
  cloneQuizOnServer(bankQuizId).catch((err) => console.warn('Render backend cloneQuiz sync notice:', err));
  syncQuizToFirestore(clonedQuiz).catch(() => {});
  return clonedQuiz;
};

// --- SUBMISSIONS & ACADEMIC AUDIT CRUD ---
export const getSubmissions = (): Submission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    const parsed: Submission[] = JSON.parse(raw);
    let modified = false;
    INITIAL_SUBMISSIONS.forEach((initSub) => {
      if (!parsed.some((s) => s.id === initSub.id)) {
        parsed.push(initSub);
        modified = true;
      }
    });
    if (modified) {
      saveSubmissions(parsed);
    }
    return parsed;
  } catch (e) {
    return INITIAL_SUBMISSIONS;
  }
};

export const saveSubmissions = (submissions: Submission[]): void => {
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  notifyLiveSync();
};

export const submitQuiz = (data: {
  quizId: string;
  quizTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  teacherId?: string;
  teacherName?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  answers: Record<string, number>;
  integrityAudit?: IntegrityAudit;
}): Submission => {
  const resolvedTeacherId = data.teacherId || getActiveTeacherId() || 'tch-afzal';
  let resolvedTeacherName = data.teacherName;
  if (!resolvedTeacherName) {
    const matchedTeacher = getTeachers().find((t) => t.id === resolvedTeacherId);
    resolvedTeacherName = matchedTeacher?.name || 'Faculty Instructor';
  }

  const newSubmission: Submission = {
    ...data,
    id: `sub-${data.studentId}-${data.quizId}-${Date.now()}`,
    teacherId: resolvedTeacherId,
    teacherName: resolvedTeacherName,
    submittedAt: new Date().toISOString(),
  };

  const submissions = getSubmissions();
  const updated = [newSubmission, ...submissions];
  saveSubmissions(updated);

  // Sync to Render MongoDB Backend
  submitQuizToServer(newSubmission).catch((err) =>
    console.warn('Render backend submitQuiz sync notice:', err)
  );

  // Background non-blocking sync to Firestore
  try {
    const student = getStudents().find((s) => s.id === data.studentId || s.loginId?.toLowerCase() === data.studentId.toLowerCase());
    saveSubmissionToFirestore(newSubmission, {
      email: student?.email,
      googleId: student?.googleId,
    }).catch(() => {});
  } catch {
    // Graceful offline degradation
  }

  return newSubmission;
};

// --- MASTER DATABASE BACKUP & RESTORE ---
export const exportFullDatabaseJSON = (): string => {
  const db = {
    exportedAt: new Date().toISOString(),
    admins: getAdmins(),
    developers: getDevelopers(),
    teachers: getTeachers(),
    students: getStudents(),
    quizzes: getQuizzes(),
    submissions: getSubmissions(),
    subscriptions: getSubscriptions(),
  };
  return JSON.stringify(db, null, 2);
};

export const importFullDatabaseJSON = (jsonStr: string): boolean => {
  try {
    const db = JSON.parse(jsonStr);
    if (db.admins) saveAdmins(db.admins);
    if (db.developers) saveDevelopers(db.developers);
    if (db.teachers) saveTeachers(db.teachers);
    if (db.students) saveStudents(db.students);
    if (db.quizzes) saveQuizzes(db.quizzes);
    if (db.submissions) saveSubmissions(db.submissions);
    if (db.subscriptions) saveSubscriptions(db.subscriptions);
    notifyLiveSync();
    return true;
  } catch (e) {
    console.error('Import database error', e);
    return false;
  }
};

export const resetDatabaseToDefaults = (): void => {
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(INITIAL_ADMINS));
  localStorage.setItem(STORAGE_KEYS.DEVELOPERS, JSON.stringify(INITIAL_DEVELOPERS));
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
  localStorage.removeItem(STORAGE_KEYS.DELETED_QUIZ_IDS);
  localStorage.removeItem(STORAGE_KEYS.DELETED_TEACHER_IDS);
  localStorage.removeItem(STORAGE_KEYS.DELETED_STUDENT_IDS);
  localStorage.removeItem(STORAGE_KEYS.DELETED_ADMIN_IDS);
  localStorage.removeItem(STORAGE_KEYS.DELETED_DEV_IDS);
  notifyLiveSync();
};

// --- AUTH SESSION PERSISTENCE ---
export interface AuthSession {
  isAuthenticated: boolean;
  role: UserRole;
  userId?: string;
  authProvider?: 'password' | 'google';
  googleEmail?: string;
  googlePicture?: string;
  subscription?: UserSubscription;
}

export const getAuthSession = (): AuthSession => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return { isAuthenticated: false, role: 'developer' };
    return JSON.parse(raw);
  } catch (e) {
    return { isAuthenticated: false, role: 'developer' };
  }
};

export const saveAuthSession = (session: AuthSession): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
};

export const clearAuthSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
};

export const linkGoogleAccount = (
  role: UserRole,
  userId: string,
  googleEmail: string,
  googlePicture?: string,
  googleId?: string
): boolean => {
  let linkedUser: any = null;

  if (role === 'admin') {
    const admins = getAdmins();
    const admin = admins.find((a) => a.id === userId);
    if (!admin) return false;
    linkedUser = { ...admin, email: googleEmail, googlePicture, googleId };
    updateAdmin(linkedUser);
  } else if (role === 'developer') {
    const devs = getDevelopers();
    const dev = devs.find((d) => d.id === userId);
    if (!dev) return false;
    linkedUser = { ...dev, email: googleEmail, googlePicture, googleId };
    updateDeveloper(linkedUser);
  } else if (role === 'teacher') {
    const teachers = getTeachers();
    const teacher = teachers.find((t) => t.id === userId);
    if (!teacher) return false;
    linkedUser = { ...teacher, email: googleEmail, googlePicture, googleId };
    updateTeacher(linkedUser);
  } else if (role === 'student') {
    const students = getStudents();
    const student = students.find((s) => s.id === userId);
    if (!student) return false;
    linkedUser = { ...student, email: googleEmail, googlePicture, googleId };
    updateStudent(linkedUser);
  } else {
    return false;
  }

  // Background non-blocking sync to Firestore
  if (linkedUser) {
    try {
      saveGoogleUserToFirestore({
        googleId,
        email: googleEmail,
        name: linkedUser.name,
        role,
        picture: googlePicture,
        loginId: linkedUser.loginId,
        className: (linkedUser as any).className,
        phone: (linkedUser as any).phone,
        enrolledByTeacherId: (linkedUser as any).enrolledByTeacherId,
        subscription: (linkedUser as any).subscription,
        authProvider: 'google',
      }).catch(() => {});
    } catch {
      // Graceful offline degradation
    }
  }

  return true;
};

/**
 * Pulls all updated profiles and deletion tombstones from Cloud Firestore and synchronizes them into local storage.
 * Ensures passwords, profile credentials, and profile deletions are universally enforced across all devices.
 */
export const pullAndApplyCloudProfiles = async (): Promise<number> => {
  try {
    const { active: cloudProfiles, deleted: cloudDeletedProfiles } =
      await fetchAllProfilesWithTombstonesFromFirestore();
    if (
      (!cloudProfiles || cloudProfiles.length === 0) &&
      (!cloudDeletedProfiles || cloudDeletedProfiles.length === 0)
    ) {
      return 0;
    }

    let appliedCount = 0;

    const teachers = getTeachers();
    const students = getStudents();
    const admins = getAdmins();
    const devs = getDevelopers();

    let updatedTeachers = [...teachers];
    let updatedStudents = [...students];
    let updatedAdmins = [...admins];
    let updatedDevs = [...devs];

    let deletedTeacherIds = getDeletedTeacherIds();
    let deletedStudentIds = getDeletedStudentIds();
    let deletedAdminIds = getDeletedAdminIds();
    let deletedDevIds = getDeletedDevIds();

    let tModified = false;
    let sModified = false;
    let aModified = false;
    let dModified = false;

    // 1. Sync teachers & students from Render MongoDB Atlas
    try {
      const [remoteTeachers, remoteStudents] = await Promise.all([
        fetchAllTeachers().catch(() => [] as Teacher[]),
        fetchAllStudents().catch(() => [] as Student[]),
      ]);
      if (remoteTeachers && remoteTeachers.length > 0) {
        remoteTeachers.forEach((rt) => {
          const idx = updatedTeachers.findIndex((t) => t.id === rt.id || (rt.loginId && t.loginId?.toLowerCase() === rt.loginId.toLowerCase()));
          if (idx >= 0) {
            updatedTeachers[idx] = { ...updatedTeachers[idx], ...rt };
          } else {
            updatedTeachers.push(rt);
          }
          tModified = true;
          appliedCount++;
        });
      }
      if (remoteStudents && remoteStudents.length > 0) {
        remoteStudents.forEach((rs) => {
          const idx = updatedStudents.findIndex((s) => s.id === rs.id || (rs.loginId && s.loginId?.toLowerCase() === rs.loginId.toLowerCase()));
          if (idx >= 0) {
            updatedStudents[idx] = { ...updatedStudents[idx], ...rs };
          } else {
            updatedStudents.push(rs);
          }
          sModified = true;
          appliedCount++;
        });
      }
    } catch {
      // Offline fallback
    }

    const getProfileTimestamp = (u: any): number => {
      const ts = u.updatedAt || u.recruitedAt || u.enrolledAt || u.createdAt;
      return ts ? new Date(ts).getTime() : 0;
    };

    const matchesTombstone = (u: any): boolean => {
      const uLogin = (u.loginId || '').trim().toLowerCase();
      const uEmail = (u.email || '').trim().toLowerCase();
      const uNormEmail = uEmail && uEmail.includes('@') ? normalizeEmail(uEmail) : '';
      const uTime = getProfileTimestamp(u);

      return cloudDeletedProfiles.some((delDoc) => {
        const dLogin = (delDoc.loginId || '').trim().toLowerCase();
        const dEmail = (delDoc.email || '').trim().toLowerCase();
        const dNormEmail = dEmail && dEmail.includes('@') ? normalizeEmail(dEmail) : '';
        const matched =
          (u.id && delDoc.id && u.id === delDoc.id) ||
          (uLogin && dLogin && uLogin === dLogin) ||
          (uEmail && dEmail && (uEmail === dEmail || (uNormEmail && uNormEmail === dNormEmail)));
        if (!matched) return false;
        const delTime = delDoc.deletedAt
          ? new Date(delDoc.deletedAt).getTime()
          : delDoc.updatedAt
          ? new Date(delDoc.updatedAt).getTime()
          : Date.now();
        return delTime >= uTime;
      });
    };

    // 1. Evict any local profiles that were deleted in Cloud Firestore (via tombstone)
    updatedTeachers = updatedTeachers.filter((t) => {
      const shouldEvict = matchesTombstone(t);
      if (shouldEvict) {
        if (!deletedTeacherIds.includes(t.id)) deletedTeacherIds.push(t.id);
        const tLogin = t.loginId.toLowerCase();
        if (!deletedTeacherIds.includes(tLogin)) deletedTeacherIds.push(tLogin);
        const tEmail = t.email?.trim().toLowerCase();
        if (tEmail && !deletedTeacherIds.includes(tEmail)) deletedTeacherIds.push(tEmail);

        // Evict active session if this teacher is currently logged in on this device
        const currentSession = getAuthSession();
        if (
          currentSession.isAuthenticated &&
          (currentSession.userId === t.id ||
            currentSession.userId?.toLowerCase() === tLogin ||
            (tEmail && currentSession.googleEmail?.toLowerCase() === tEmail))
        ) {
          clearAuthSession();
        }

        tModified = true;
        appliedCount++;
        return false;
      }
      return true;
    });

    updatedStudents = updatedStudents.filter((s) => {
      const shouldEvict = matchesTombstone(s);
      if (shouldEvict) {
        if (!deletedStudentIds.includes(s.id)) deletedStudentIds.push(s.id);
        const sLogin = s.loginId.toLowerCase();
        if (!deletedStudentIds.includes(sLogin)) deletedStudentIds.push(sLogin);
        const sEmail = s.email?.trim().toLowerCase();
        if (sEmail && !deletedStudentIds.includes(sEmail)) deletedStudentIds.push(sEmail);

        // Evict active session if this student is currently logged in on this device
        const currentSession = getAuthSession();
        if (
          currentSession.isAuthenticated &&
          (currentSession.userId === s.id ||
            currentSession.userId?.toLowerCase() === sLogin ||
            (sEmail && currentSession.googleEmail?.toLowerCase() === sEmail))
        ) {
          clearAuthSession();
        }

        sModified = true;
        appliedCount++;
        return false;
      }
      return true;
    });

    updatedAdmins = updatedAdmins.filter((a) => {
      const shouldEvict = matchesTombstone(a);
      if (shouldEvict) {
        if (!deletedAdminIds.includes(a.id)) deletedAdminIds.push(a.id);
        const aLogin = a.loginId.toLowerCase();
        if (!deletedAdminIds.includes(aLogin)) deletedAdminIds.push(aLogin);
        const aEmail = a.email?.trim().toLowerCase();
        if (aEmail && !deletedAdminIds.includes(aEmail)) deletedAdminIds.push(aEmail);

        // Evict active session if this admin is currently logged in on this device
        const currentSession = getAuthSession();
        if (
          currentSession.isAuthenticated &&
          (currentSession.userId === a.id ||
            currentSession.userId?.toLowerCase() === aLogin ||
            (aEmail && currentSession.googleEmail?.toLowerCase() === aEmail))
        ) {
          clearAuthSession();
        }

        aModified = true;
        appliedCount++;
        return false;
      }
      return true;
    });

    updatedDevs = updatedDevs.filter((d) => {
      const shouldEvict = matchesTombstone(d);
      if (shouldEvict) {
        if (!deletedDevIds.includes(d.id)) deletedDevIds.push(d.id);
        const dLogin = d.loginId.toLowerCase();
        if (!deletedDevIds.includes(dLogin)) deletedDevIds.push(dLogin);
        const dEmail = d.email?.trim().toLowerCase();
        if (dEmail && !deletedDevIds.includes(dEmail)) deletedDevIds.push(dEmail);

        // Evict active session if this developer is currently logged in on this device
        const currentSession = getAuthSession();
        if (
          currentSession.isAuthenticated &&
          (currentSession.userId === d.id ||
            currentSession.userId?.toLowerCase() === dLogin ||
            (dEmail && currentSession.googleEmail?.toLowerCase() === dEmail))
        ) {
          clearAuthSession();
        }

        dModified = true;
        appliedCount++;
        return false;
      }
      return true;
    });

    // 2. Apply active cloud profiles
    for (const cloudP of cloudProfiles) {
      if (!cloudP.loginId) continue;
      const cleanLogin = cloudP.loginId.trim().toLowerCase();
      const cleanCloudEmail = cloudP.email ? cloudP.email.trim().toLowerCase() : undefined;
      const normCloudEmail = cleanCloudEmail && cleanCloudEmail.includes('@') ? normalizeEmail(cleanCloudEmail) : undefined;

      if (cloudP.role === 'teacher') {
        if (cloudP.id && deletedTeacherIds.includes(cloudP.id)) {
          deleteProfileFromFirestore(cleanLogin, cloudP.email, cloudP.id, cloudP.googleId).catch(() => {});
          continue;
        }
        if (deletedTeacherIds.includes(cleanLogin) || (cleanCloudEmail && deletedTeacherIds.includes(cleanCloudEmail))) {
          deletedTeacherIds = deletedTeacherIds.filter((id) => id !== cleanLogin && id !== cleanCloudEmail);
          tModified = true;
        }

        // Purge any stale student ghost entry with the same email or loginId to guarantee role consistency across devices
        const beforeLen = updatedStudents.length;
        updatedStudents = updatedStudents.filter(
          (s) =>
            s.loginId.trim().toLowerCase() !== cleanLogin &&
            (!cleanCloudEmail || !s.email || (s.email.trim().toLowerCase() !== cleanCloudEmail && normalizeEmail(s.email) !== normCloudEmail))
        );
        if (updatedStudents.length !== beforeLen) {
          sModified = true;
        }

        const idx = updatedTeachers.findIndex(
          (t) =>
            t.loginId.trim().toLowerCase() === cleanLogin ||
            t.id === cloudP.id ||
            (cleanCloudEmail && t.email && (t.email.trim().toLowerCase() === cleanCloudEmail || normalizeEmail(t.email) === normCloudEmail))
        );
        if (idx >= 0) {
          const safePass = resolveSafePassword(updatedTeachers[idx].password, cloudP.password, cleanLogin, cloudP.email);
          const merged = { ...updatedTeachers[idx], ...cloudP, password: safePass };
          if (JSON.stringify(updatedTeachers[idx]) !== JSON.stringify(merged)) {
            updatedTeachers[idx] = merged;
            tModified = true;
            appliedCount++;
          }
          if (safePass && safePass !== 'password123' && cloudP.password !== safePass) {
            syncProfileToFirestore('teacher', merged).catch(() => {});
          }
        } else {
          const safePass = resolveSafePassword(undefined, cloudP.password, cleanLogin, cloudP.email);
          updatedTeachers.push({ ...cloudP, password: safePass });
          tModified = true;
          appliedCount++;
        }
      } else if (cloudP.role === 'student') {
        if (cloudP.id && deletedStudentIds.includes(cloudP.id)) {
          deleteProfileFromFirestore(cleanLogin, cloudP.email, cloudP.id, cloudP.googleId).catch(() => {});
          continue;
        }
        if (deletedStudentIds.includes(cleanLogin) || (cleanCloudEmail && deletedStudentIds.includes(cleanCloudEmail))) {
          deletedStudentIds = deletedStudentIds.filter((id) => id !== cleanLogin && id !== cleanCloudEmail);
          sModified = true;
        }

        const idx = updatedStudents.findIndex(
          (s) =>
            s.loginId.trim().toLowerCase() === cleanLogin ||
            s.id === cloudP.id ||
            (cleanCloudEmail && s.email && (s.email.trim().toLowerCase() === cleanCloudEmail || normalizeEmail(s.email) === normCloudEmail))
        );
        if (idx >= 0) {
          const safePass = resolveSafePassword(updatedStudents[idx].password, cloudP.password, cleanLogin, cloudP.email);
          const merged = {
            ...updatedStudents[idx],
            ...cloudP,
            password: safePass,
            enrolledByTeacherId: cloudP.enrolledByTeacherId || updatedStudents[idx].enrolledByTeacherId,
            enrolledClasses: cloudP.enrolledClasses || updatedStudents[idx].enrolledClasses,
            subscription: cloudP.subscription || updatedStudents[idx].subscription,
          };
          if (JSON.stringify(updatedStudents[idx]) !== JSON.stringify(merged)) {
            updatedStudents[idx] = merged;
            sModified = true;
            appliedCount++;
          }
          if (safePass && safePass !== 'password123' && cloudP.password !== safePass) {
            syncProfileToFirestore('student', merged).catch(() => {});
          }
        } else {
          const safePass = resolveSafePassword(undefined, cloudP.password, cleanLogin, cloudP.email);
          updatedStudents.push({ ...cloudP, password: safePass });
          sModified = true;
          appliedCount++;
        }
      } else if (cloudP.role === 'admin') {
        if (cloudP.id && deletedAdminIds.includes(cloudP.id)) {
          deleteProfileFromFirestore(cleanLogin, cloudP.email, cloudP.id, cloudP.googleId).catch(() => {});
          continue;
        }
        if (deletedAdminIds.includes(cleanLogin) || (cleanCloudEmail && deletedAdminIds.includes(cleanCloudEmail))) {
          deletedAdminIds = deletedAdminIds.filter((id) => id !== cleanLogin && id !== cleanCloudEmail);
          aModified = true;
        }

        const idx = updatedAdmins.findIndex(
          (a) =>
            a.loginId.trim().toLowerCase() === cleanLogin ||
            a.id === cloudP.id ||
            (cleanCloudEmail && a.email && (a.email.trim().toLowerCase() === cleanCloudEmail || normalizeEmail(a.email) === normCloudEmail))
        );
        if (idx >= 0) {
          const safePass = resolveSafePassword(updatedAdmins[idx].password, cloudP.password, cleanLogin, cloudP.email);
          const merged = { ...updatedAdmins[idx], ...cloudP, password: safePass };
          if (JSON.stringify(updatedAdmins[idx]) !== JSON.stringify(merged)) {
            updatedAdmins[idx] = merged;
            aModified = true;
            appliedCount++;
          }
          if (safePass && safePass !== 'password123' && cloudP.password !== safePass) {
            syncProfileToFirestore('admin', merged).catch(() => {});
          }
        } else {
          const safePass = resolveSafePassword(undefined, cloudP.password, cleanLogin, cloudP.email);
          updatedAdmins.push({ ...cloudP, password: safePass });
          aModified = true;
          appliedCount++;
        }
      } else if (cloudP.role === 'developer') {
        if (cloudP.id && deletedDevIds.includes(cloudP.id)) {
          deleteProfileFromFirestore(cleanLogin, cloudP.email, cloudP.id, cloudP.googleId).catch(() => {});
          continue;
        }
        if (deletedDevIds.includes(cleanLogin) || (cleanCloudEmail && deletedDevIds.includes(cleanCloudEmail))) {
          deletedDevIds = deletedDevIds.filter((id) => id !== cleanLogin && id !== cleanCloudEmail);
          dModified = true;
        }

        const idx = updatedDevs.findIndex(
          (d) =>
            d.loginId.trim().toLowerCase() === cleanLogin ||
            d.id === cloudP.id ||
            (cleanCloudEmail && d.email && (d.email.trim().toLowerCase() === cleanCloudEmail || normalizeEmail(d.email) === normCloudEmail))
        );
        if (idx >= 0) {
          const safePass = resolveSafePassword(updatedDevs[idx].password, cloudP.password, cleanLogin, cloudP.email);
          const merged = { ...updatedDevs[idx], ...cloudP, password: safePass };
          if (JSON.stringify(updatedDevs[idx]) !== JSON.stringify(merged)) {
            updatedDevs[idx] = merged;
            dModified = true;
            appliedCount++;
          }
          if (safePass && safePass !== 'password123' && cloudP.password !== safePass) {
            syncProfileToFirestore('developer', merged).catch(() => {});
          }
        } else {
          const safePass = resolveSafePassword(undefined, cloudP.password, cleanLogin, cloudP.email);
          updatedDevs.push({ ...cloudP, password: safePass });
          dModified = true;
          appliedCount++;
        }
      }
    }

    if (tModified) {
      saveDeletedTeacherIds(deletedTeacherIds);
      saveTeachers(updatedTeachers);
    }
    if (sModified) {
      saveDeletedStudentIds(deletedStudentIds);
      saveStudents(updatedStudents);
    }
    if (aModified) {
      saveDeletedAdminIds(deletedAdminIds);
      saveAdmins(updatedAdmins);
    }
    if (dModified) {
      saveDeletedDevIds(deletedDevIds);
      saveDevelopers(updatedDevs);
    }

    return appliedCount;
  } catch (err) {
    console.warn('pullAndApplyCloudProfiles notice:', err);
    return 0;
  }
};

/**
 * Ensures all local profiles and password updates are synchronized to Cloud Firestore.
 * Pushes any profile that is missing from Cloud Firestore or has a different password.
 * NEVER overwrites existing Cloud Firestore passwords with local seed 'password123' defaults,
 * and NEVER resurrects profiles that were deleted in Cloud Firestore!
 */
export const syncLocalProfilesToCloud = async (): Promise<number> => {
  try {
    const { active: cloudProfiles, deleted: cloudDeletedProfiles } =
      await fetchAllProfilesWithTombstonesFromFirestore();
    if (!cloudProfiles || cloudProfiles.length === 0) {
      // If cloud fetch failed or returned empty, do not mass-push local seed 'password123' profiles
      return 0;
    }

    const cloudMap = new Map<string, any>();
    for (const cp of cloudProfiles) {
      if (cp.loginId) cloudMap.set(cp.loginId.trim().toLowerCase(), cp);
      if (cp.email) {
        const cleanEmail = cp.email.trim().toLowerCase();
        cloudMap.set(cleanEmail, cp);
        if (cleanEmail.includes('@')) cloudMap.set(normalizeEmail(cleanEmail), cp);
      }
      if (cp.id) cloudMap.set(cp.id, cp);
    }

    const deletedSet = new Set<string>([
      ...getDeletedAdminIds(),
      ...getDeletedDevIds(),
      ...getDeletedTeacherIds(),
      ...getDeletedStudentIds(),
    ]);
    for (const delDoc of cloudDeletedProfiles) {
      if (delDoc.id) deletedSet.add(delDoc.id);
      if (delDoc.loginId) deletedSet.add(delDoc.loginId.trim().toLowerCase());
      if (delDoc.email) {
        const cleanEmail = delDoc.email.trim().toLowerCase();
        deletedSet.add(cleanEmail);
        if (cleanEmail.includes('@')) deletedSet.add(normalizeEmail(cleanEmail));
      }
    }

    let syncedCount = 0;
    const teachers = getTeachers();
    const students = getStudents();
    const admins = getAdmins();
    const devs = getDevelopers();

    const pushIfMissingOrDifferent = async (role: UserRole, user: any, isSeed: boolean) => {
      if (!user.loginId) return;
      const cleanLogin = user.loginId.trim().toLowerCase();
      const cleanEmail = user.email ? user.email.trim().toLowerCase() : '';
      const normEmail = cleanEmail && cleanEmail.includes('@') ? normalizeEmail(cleanEmail) : '';

      // Never re-upload a profile that was deleted locally or tombstoned in Firestore
      if (
        (user.id && deletedSet.has(user.id)) ||
        deletedSet.has(cleanLogin) ||
        (cleanEmail && deletedSet.has(cleanEmail)) ||
        (normEmail && deletedSet.has(normEmail))
      ) {
        return;
      }

      const cloudP =
        cloudMap.get(cleanLogin) ||
        (cleanEmail ? cloudMap.get(cleanEmail) : undefined) ||
        (normEmail ? cloudMap.get(normEmail) : undefined) ||
        (user.id ? cloudMap.get(user.id) : undefined);

      const isAfzal = cleanLogin === 'afzal@ccap.com' || cleanEmail === 'afzal@ccap.com';
      const userPass = isAfzal
        ? (user.password && user.password !== 'password123' ? user.password : 'Afzal123/')
        : (user.password || '');

      if (!cloudP) {
        // Only push if it is a seed account or was newly created locally within the last 60 seconds
        const ts = user.updatedAt || user.recruitedAt || user.enrolledAt || user.createdAt;
        const createdTime = ts ? new Date(ts).getTime() : 0;
        const isRecent = createdTime > 0 && Date.now() - createdTime < 60000;
        if (isSeed || isRecent) {
          await syncProfileToFirestore(role, { ...user, password: userPass });
          syncedCount++;
        }
      } else {
        // Account exists in Firestore:
        // 1. If Afzal's account in cloud was corrupted to 'password123', heal it to 'Afzal123/'
        if (isAfzal && cloudP.password === 'password123') {
          await syncProfileToFirestore(role, { ...user, password: 'Afzal123/' });
          syncedCount++;
        }
        // 2. NEVER push local 'password123' to Cloud Firestore if cloud already has a custom password!
        else if (userPass && userPass !== 'password123' && cloudP.password !== userPass) {
          // Genuine custom password update
          await syncProfileToFirestore(role, { ...user, password: userPass });
          syncedCount++;
        }
      }
    };

    for (const a of admins) {
      const isSeed = INITIAL_ADMINS.some((ia) => ia.id === a.id || ia.loginId.toLowerCase() === a.loginId.toLowerCase());
      await pushIfMissingOrDifferent('admin', a, isSeed);
    }
    for (const d of devs) {
      const isSeed = INITIAL_DEVELOPERS.some((idv) => idv.id === d.id || idv.loginId.toLowerCase() === d.loginId.toLowerCase());
      await pushIfMissingOrDifferent('developer', d, isSeed);
    }
    for (const t of teachers) {
      const isSeed = INITIAL_TEACHERS.some((it) => it.id === t.id || it.loginId.toLowerCase() === t.loginId.toLowerCase());
      await pushIfMissingOrDifferent('teacher', t, isSeed);
    }
    for (const s of students) {
      const isSeed = INITIAL_STUDENTS.some((is) => is.id === s.id || is.loginId.toLowerCase() === s.loginId.toLowerCase());
      await pushIfMissingOrDifferent('student', s, isSeed);
    }

    return syncedCount;
  } catch (err) {
    console.warn('syncLocalProfilesToCloud notice:', err);
    return 0;
  }
};

// --- SUBSCRIPTION & PLAN PERSISTENCE ---
export const getSubscriptions = (): UserSubscription[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(INITIAL_SUBSCRIPTIONS));
      return INITIAL_SUBSCRIPTIONS;
    }
    const parsed: UserSubscription[] = JSON.parse(raw);
    let modified = false;
    INITIAL_SUBSCRIPTIONS.forEach((initS) => {
      if (!parsed.some((s) => s.id === initS.id)) {
        parsed.push(initS);
        modified = true;
      }
    });
    if (modified) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    return INITIAL_SUBSCRIPTIONS;
  }
};

export const saveSubscriptions = (subs: UserSubscription[]): void => {
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
  notifyLiveSync();
};

export const saveUserSubscription = (sub: UserSubscription): void => {
  const allSubs = getSubscriptions();
  const existingIdx = allSubs.findIndex(
    (s) => s.id === sub.id || (s.userId === sub.userId && s.status === 'active')
  );
  let updatedSubs = [...allSubs];
  if (existingIdx >= 0) {
    updatedSubs[existingIdx] = sub;
  } else {
    updatedSubs = [sub, ...allSubs];
  }
  saveSubscriptions(updatedSubs);

  // Update student/user profile with subscription
  const students = getStudents();
  const student = students.find(
    (s) => s.id === sub.userId || s.loginId?.toLowerCase() === sub.loginId?.toLowerCase()
  );
  if (student) {
    const updatedStudent: Student = {
      ...student,
      subscription: sub,
      maxClasses: sub.maxClasses ?? student.maxClasses,
      updatedAt: new Date().toISOString(),
    };
    updateStudent(updatedStudent);
  }

  // Also check teachers and update their class creation limit from the plan
  const teachers = getTeachers();
  const teacher = teachers.find(
    (t) => t.id === sub.userId || t.loginId?.toLowerCase() === sub.loginId?.toLowerCase()
  );
  if (teacher) {
    updateTeacher({
      ...teacher,
      subscription: sub,
      maxClasses: sub.maxClasses ?? teacher.maxClasses,
      updatedAt: new Date().toISOString(),
    });
  }

  // Also check admin / developer
  const admins = getAdmins();
  const admin = admins.find(
    (a) => a.id === sub.userId || a.loginId?.toLowerCase() === sub.loginId?.toLowerCase()
  );
  if (admin) {
    updateAdmin({ ...admin, subscription: sub, updatedAt: new Date().toISOString() });
  }

  // Background non-blocking sync to Cloud Firestore
  syncSubscriptionToFirestore(sub).catch(() => {});
};

export const verifyUserSubscription = (
  subId: string,
  verifiedBy: string = 'Admin'
): UserSubscription | null => {
  const allSubs = getSubscriptions();
  const idx = allSubs.findIndex((s) => s.id === subId);
  if (idx < 0) return null;

  const verifiedSub: UserSubscription = {
    ...allSubs[idx],
    status: 'active',
    verifiedAt: new Date().toISOString(),
    verifiedBy,
  };

  allSubs[idx] = verifiedSub;
  saveSubscriptions(allSubs);

  // Update associated student profile
  const students = getStudents();
  const student = students.find(
    (s) => s.id === verifiedSub.userId || s.loginId?.toLowerCase() === verifiedSub.loginId?.toLowerCase()
  );
  if (student) {
    updateStudent({ ...student, subscription: verifiedSub, updatedAt: new Date().toISOString() });
  }

  // Update associated teacher profile
  const teachers = getTeachers();
  const teacher = teachers.find(
    (t) => t.id === verifiedSub.userId || t.loginId?.toLowerCase() === verifiedSub.loginId?.toLowerCase()
  );
  if (teacher) {
    updateTeacher({ ...teacher, subscription: verifiedSub, updatedAt: new Date().toISOString() });
  }

  syncSubscriptionToFirestore(verifiedSub).catch(() => {});
  return verifiedSub;
};

export const extendUserSubscription = (
  subId: string,
  additionalDays: number,
  extendedBy: string = 'Admin'
): UserSubscription | null => {
  const allSubs = getSubscriptions();
  const idx = allSubs.findIndex((s) => s.id === subId);
  if (idx < 0) return null;

  const targetSub = allSubs[idx];
  const currentExpiry = new Date(targetSub.expiryDate).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiry = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000);

  const extendedSub: UserSubscription = {
    ...targetSub,
    status: 'active',
    durationDays: targetSub.durationDays + additionalDays,
    expiryDate: newExpiry.toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: extendedBy,
    notes: `${targetSub.notes || ''} [Extended ${additionalDays}d by ${extendedBy}]`.trim(),
  };

  allSubs[idx] = extendedSub;
  saveSubscriptions(allSubs);

  const students = getStudents();
  const student = students.find(
    (s) => s.id === extendedSub.userId || s.loginId?.toLowerCase() === extendedSub.loginId?.toLowerCase()
  );
  if (student) {
    updateStudent({ ...student, subscription: extendedSub, updatedAt: new Date().toISOString() });
  }

  const teachers = getTeachers();
  const teacher = teachers.find(
    (t) => t.id === extendedSub.userId || t.loginId?.toLowerCase() === extendedSub.loginId?.toLowerCase()
  );
  if (teacher) {
    updateTeacher({ ...teacher, subscription: extendedSub, validityDays: extendedSub.durationDays, updatedAt: new Date().toISOString() });
  }

  syncSubscriptionToFirestore(extendedSub).catch(() => {});
  return extendedSub;
};

export const cancelUserSubscription = (subId: string): void => {
  const allSubs = getSubscriptions();
  const idx = allSubs.findIndex((s) => s.id === subId);
  if (idx < 0) return;

  const canceledSub: UserSubscription = {
    ...allSubs[idx],
    status: 'canceled',
    notes: `${allSubs[idx].notes || ''} [Canceled on ${new Date().toLocaleDateString()}]`.trim(),
  };

  allSubs[idx] = canceledSub;
  saveSubscriptions(allSubs);

  const students = getStudents();
  const student = students.find(
    (s) => s.id === canceledSub.userId || s.loginId?.toLowerCase() === canceledSub.loginId?.toLowerCase()
  );
  if (student) {
    updateStudent({ ...student, subscription: canceledSub, updatedAt: new Date().toISOString() });
  }

  const teachers = getTeachers();
  const teacher = teachers.find(
    (t) => t.id === canceledSub.userId || t.loginId?.toLowerCase() === canceledSub.loginId?.toLowerCase()
  );
  if (teacher) {
    updateTeacher({ ...teacher, subscription: canceledSub, updatedAt: new Date().toISOString() });
  }

  syncSubscriptionToFirestore(canceledSub).catch(() => {});
};

export const getUserSubscription = (userIdOrLogin?: string): UserSubscription | null => {
  if (!userIdOrLogin) return null;
  const clean = userIdOrLogin.trim().toLowerCase();
  const allSubs = getSubscriptions();
  const matches = allSubs.filter(
    (s) =>
      s.userId?.toLowerCase() === clean ||
      s.loginId?.toLowerCase() === clean ||
      (s.userEmail && s.userEmail.toLowerCase() === clean)
  );
  if (matches.length === 0) return null;
  const active = matches.find((s) => s.status === 'active' || s.status === 'pending_verification');
  if (active) return active;
  return matches[0];
};

export const pullAndApplyCloudSubscriptions = async (): Promise<number> => {
  try {
    const cloudSubs = await fetchAllSubscriptionsFromFirestore();
    if (!cloudSubs || cloudSubs.length === 0) return 0;

    const localSubs = getSubscriptions();
    const subMap = new Map<string, UserSubscription>();
    localSubs.forEach((s) => subMap.set(s.id, s));

    let updatedCount = 0;
    cloudSubs.forEach((cs) => {
      const existing = subMap.get(cs.id);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(cs)) {
        subMap.set(cs.id, cs);
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      const merged = Array.from(subMap.values());
      saveSubscriptions(merged);
    }
    return updatedCount;
  } catch (err) {
    console.warn('pullAndApplyCloudSubscriptions notice:', err);
    return 0;
  }
};

/**
 * Pulls any new or updated quizzes from Render MongoDB backend (with Firestore fallback)
 */
export const pullAndApplyCloudQuizzes = async (): Promise<number> => {
  try {
    let cloudQuizzes: Quiz[] = [];
    try {
      cloudQuizzes = await fetchAllQuizzes();
    } catch {
      cloudQuizzes = await fetchAllQuizzesFromFirestore();
    }
    if (!cloudQuizzes || cloudQuizzes.length === 0) return 0;

    const deletedIds = getDeletedQuizIds();
    const localQuizzes = getQuizzes();
    let updated = [...localQuizzes];
    let modified = false;
    let appliedCount = 0;

    for (const cq of cloudQuizzes) {
      if (!cq.id || deletedIds.includes(cq.id)) continue;
      const existingIdx = updated.findIndex((q) => q.id === cq.id);
      if (existingIdx >= 0) {
        const localTime = updated[existingIdx].updatedAt ? new Date(updated[existingIdx].updatedAt!).getTime() : 0;
        const cloudTime = cq.updatedAt ? new Date(cq.updatedAt).getTime() : 0;
        if (cloudTime >= localTime) {
          updated[existingIdx] = { ...cq };
          modified = true;
          appliedCount++;
        }
      } else {
        updated.push({ ...cq });
        modified = true;
        appliedCount++;
      }
    }

    if (modified || updated.length !== localQuizzes.length) {
      saveQuizzes(updated);
    }
    return appliedCount;
  } catch (err) {
    console.warn('pullAndApplyCloudQuizzes note:', err);
    return 0;
  }
};

/**
 * Pulls all submissions from Render MongoDB backend (with Firestore fallback) and merges them into local storage.
 * Ensures student test results submitted across different devices are universally visible to faculty.
 */
export const pullAndApplyCloudSubmissions = async (): Promise<number> => {
  try {
    let cloudSubs: Submission[] = [];
    try {
      cloudSubs = await fetchAllSubmissions();
    } catch {
      cloudSubs = await fetchAllSubmissionsFromFirestore();
    }
    if (!cloudSubs || cloudSubs.length === 0) return 0;

    const localSubs = getSubmissions();
    const subMap = new Map<string, Submission>();
    localSubs.forEach((s) => {
      if (s.id) subMap.set(s.id, s);
    });

    let updatedCount = 0;
    cloudSubs.forEach((cs) => {
      if (!cs.id) return;
      const existing = subMap.get(cs.id);
      if (!existing) {
        subMap.set(cs.id, cs);
        updatedCount++;
      } else if (JSON.stringify(existing) !== JSON.stringify(cs)) {
        subMap.set(cs.id, { ...existing, ...cs });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      const merged = Array.from(subMap.values());
      merged.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      saveSubmissions(merged);
    }
    return updatedCount;
  } catch (err) {
    console.warn('pullAndApplyCloudSubmissions notice:', err);
    return 0;
  }
};

/**
 * Intelligent Master Sync that ensures multi-device consistency via Render MongoDB Atlas backend.
 */
export const pullAndApplyCloudSync = async (_force: boolean = false): Promise<boolean> => {
  try {
    // Pull collections in parallel from Render MongoDB
    const [pCount, qCount, sCount, subCount] = await Promise.all([
      pullAndApplyCloudProfiles(),
      pullAndApplyCloudQuizzes(),
      pullAndApplyCloudSubscriptions(),
      pullAndApplyCloudSubmissions(),
    ]);

    localStorage.setItem('cca_last_cloud_sync_time', new Date().toISOString());
    return (pCount + qCount + sCount + subCount) > 0;
  } catch (err) {
    console.warn('pullAndApplyCloudSync notice:', err);
    return false;
  }
};



