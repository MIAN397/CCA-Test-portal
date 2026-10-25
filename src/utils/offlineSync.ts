import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Quiz, Submission } from '../types';

const STORAGE_KEYS = {
  LEGACY_OFFLINE_QUEUE: 'cca_offline_submissions_queue',
  OFFLINE_QUEUE_PREFIX: 'cca_offline_subs_queue_',
  CACHED_QUIZZES: 'cca_cached_quizzes_v1',
  SUBMISSIONS_PREFIX: 'cca_cached_subs_'
};

const getUserQueueKey = (studentUid: string) => `${STORAGE_KEYS.OFFLINE_QUEUE_PREFIX}${studentUid}`;

/**
 * Cache available quizzes locally in localStorage for offline access
 */
export const cacheQuizzesLocally = (quizzes: Quiz[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CACHED_QUIZZES, JSON.stringify(quizzes));
  } catch (err) {
    console.error("Failed to cache quizzes locally:", err);
  }
};

/**
 * Retrieve locally cached quizzes when offline
 */
export const getCachedQuizzes = (): Quiz[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CACHED_QUIZZES);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to retrieve cached quizzes:", err);
    return [];
  }
};

/**
 * Cache student submissions locally
 */
export const cacheSubmissionsLocally = (studentUid: string, submissions: Record<string, Submission>): void => {
  try {
    localStorage.setItem(`${STORAGE_KEYS.SUBMISSIONS_PREFIX}${studentUid}`, JSON.stringify(submissions));
  } catch (err) {
    console.error("Failed to cache submissions locally:", err);
  }
};

/**
 * Retrieve cached submissions for a student
 */
export const getCachedSubmissions = (studentUid: string): Record<string, Submission> => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SUBMISSIONS_PREFIX}${studentUid}`);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Failed to retrieve cached submissions:", err);
    return {};
  }
};

/**
 * Helper to safely parse an array from localStorage
 */
const safeParseArray = (raw: string | null): Submission[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Save a pending submission into the local offline queue.
 * Scopes by studentUid to prevent queue cross-contamination across shared accounts.
 */
export const queueOfflineSubmission = (submission: Submission): void => {
  try {
    const studentUid = submission.studentUid;
    const userKey = getUserQueueKey(studentUid);
    const userQueue = safeParseArray(localStorage.getItem(userKey));

    // Avoid duplicate queue entries for the same quiz attempt
    const filtered = userQueue.filter(s => s.id !== submission.id && s.quizId !== submission.quizId);
    filtered.push(submission);
    localStorage.setItem(userKey, JSON.stringify(filtered));

    // Also update legacy queue for backwards-compatibility
    const legacyQueue = safeParseArray(localStorage.getItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE));
    const legacyFiltered = legacyQueue.filter(s => s.id !== submission.id && s.quizId !== submission.quizId);
    legacyFiltered.push(submission);
    localStorage.setItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE, JSON.stringify(legacyFiltered));
  } catch (err) {
    console.error("Failed to queue offline submission:", err);
  }
};

/**
 * Get current pending offline submission queue.
 * When studentUid is provided, returns ONLY submissions belonging to that student.
 */
export const getOfflineSubmissionQueue = (studentUid?: string): Submission[] => {
  try {
    if (studentUid) {
      const userKey = getUserQueueKey(studentUid);
      const userQueue = safeParseArray(localStorage.getItem(userKey));

      // Also migrate any legacy items belonging to this studentUid
      const legacyQueue = safeParseArray(localStorage.getItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE));
      const legacyForUser = legacyQueue.filter(s => s.studentUid === studentUid);

      const mergedMap = new Map<string, Submission>();
      [...legacyForUser, ...userQueue].forEach(sub => {
        mergedMap.set(sub.id || sub.quizId, sub);
      });
      const merged = Array.from(mergedMap.values());
      if (merged.length !== userQueue.length) {
        localStorage.setItem(userKey, JSON.stringify(merged));
      }
      return merged;
    }

    // If no studentUid provided, return all queued items across keys
    const allSubmissions: Submission[] = [];
    const seenIds = new Set<string>();

    // 1. From legacy queue
    const legacyQueue = safeParseArray(localStorage.getItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE));
    for (const sub of legacyQueue) {
      if (!seenIds.has(sub.id)) {
        seenIds.add(sub.id);
        allSubmissions.push(sub);
      }
    }

    // 2. From all user-scoped queues in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.OFFLINE_QUEUE_PREFIX)) {
        const subs = safeParseArray(localStorage.getItem(key));
        for (const sub of subs) {
          if (!seenIds.has(sub.id)) {
            seenIds.add(sub.id);
            allSubmissions.push(sub);
          }
        }
      }
    }

    return allSubmissions;
  } catch (err) {
    console.error("Failed to read offline submission queue:", err);
    return [];
  }
};

/**
 * Clear the offline queue after successful sync
 */
export const clearOfflineSubmissionQueue = (studentUid?: string): void => {
  try {
    if (studentUid) {
      localStorage.removeItem(getUserQueueKey(studentUid));
      const legacyQueue = safeParseArray(localStorage.getItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE));
      const filtered = legacyQueue.filter(s => s.studentUid !== studentUid);
      if (filtered.length > 0) {
        localStorage.setItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE, JSON.stringify(filtered));
      } else {
        localStorage.removeItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.OFFLINE_QUEUE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  } catch (err) {
    console.error("Failed to clear offline submission queue:", err);
  }
};

/**
 * Upload all pending offline submissions to Cloud Firestore.
 * When currentUid is provided, ONLY syncs submissions belonging to that student,
 * preventing security rule permission-denied errors on shared devices.
 */
export const syncOfflineQueueToFirestore = async (
  db: any, 
  currentUid?: string
): Promise<{ syncedCount: number; errors: string[] }> => {
  const queue = getOfflineSubmissionQueue(currentUid);
  if (queue.length === 0) return { syncedCount: 0, errors: [] };

  let syncedCount = 0;
  const remainingQueue: Submission[] = [];
  const errors: string[] = [];

  for (const submission of queue) {
    // Safety check: if currentUid is specified, skip any submission not belonging to this user
    if (currentUid && submission.studentUid && submission.studentUid !== currentUid) {
      remainingQueue.push(submission);
      continue;
    }

    try {
      const submissionDocRef = doc(db, 'submissions', submission.id);
      await setDoc(submissionDocRef, {
        ...submission,
        submittedAt: serverTimestamp(),
        isSyncedFromOffline: true
      });
      syncedCount++;
    } catch (err: any) {
      console.error(`Failed to sync submission ${submission.id}:`, err);
      errors.push(err.message || 'Network error');
      remainingQueue.push(submission);
    }
  }

  // Update queue with only the items that failed or belong to another user
  if (currentUid) {
    const userKey = getUserQueueKey(currentUid);
    const userRemaining = remainingQueue.filter(s => s.studentUid === currentUid);
    if (userRemaining.length > 0) {
      localStorage.setItem(userKey, JSON.stringify(userRemaining));
    } else {
      localStorage.removeItem(userKey);
    }

    // Update legacy queue
    const legacyQueue = safeParseArray(localStorage.getItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE));
    const legacyRemaining = legacyQueue.filter(s => {
      if (s.studentUid === currentUid) {
        return userRemaining.some(r => r.id === s.id);
      }
      return true; // Keep other users' items untouched
    });
    if (legacyRemaining.length > 0) {
      localStorage.setItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE, JSON.stringify(legacyRemaining));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE);
    }
  } else {
    if (remainingQueue.length > 0) {
      localStorage.setItem(STORAGE_KEYS.LEGACY_OFFLINE_QUEUE, JSON.stringify(remainingQueue));
    } else {
      clearOfflineSubmissionQueue();
    }
  }

  return { syncedCount, errors };
};

/**
 * Automatically sync offline submissions whenever internet connectivity is restored.
 * Supports passing currentUid to ensure proper scoping.
 */
export const setupOnlineSyncListener = (
  db: any, 
  arg2?: string | ((syncedCount: number) => void),
  arg3?: (syncedCount: number) => void
): (() => void) => {
  const currentUid = typeof arg2 === 'string' ? arg2 : undefined;
  const onSyncSuccess = typeof arg2 === 'function' ? arg2 : arg3;

  const handleOnline = async () => {
    const queue = getOfflineSubmissionQueue(currentUid);
    if (queue.length > 0) {
      const result = await syncOfflineQueueToFirestore(db, currentUid);
      if (result.syncedCount > 0 && onSyncSuccess) {
        onSyncSuccess(result.syncedCount);
      }
    }
  };

  window.addEventListener('online', handleOnline);

  // Run an initial check in case app was reloaded while online
  if (navigator.onLine) {
    handleOnline();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
};
