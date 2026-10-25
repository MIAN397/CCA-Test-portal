/**
 * Firebase Cloud Firestore Client & Synchronization Service
 * Cadets Coaching Academy Assessment Portal
 * 
 * Directly connects to project: ccap-testportal via Cloud Firestore REST API V1.
 * Supports zero-dependency, high-reliability cloud persistence for Gmail users.
 */

import { Quiz, Submission, UserRole, UserSubscription } from '../types';
import { normalizeEmail } from '../utils/googleAuth';

export interface FirestoreConfig {
  projectId: string;
  apiKey?: string;
}

export interface FirestoreSyncStatus {
  isConfigured: boolean;
  isOnline: boolean;
  lastSyncedAt?: string;
  pendingSyncCount: number;
  lastError?: string;
}

// Default to the primary healthy project
const DEFAULT_PROJECT_ID = 'ccap-testportal';
const DEFAULT_API_KEY = 'AIzaSyBxv4qGeAqogGIh_O-2twI_-rdoiSvN6bw';

export function getFirestoreConfig(): FirestoreConfig {
  let envProjectId: string | undefined;
  let envApiKey: string | undefined;

  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      envProjectId = (import.meta as any).env.VITE_FIREBASE_PROJECT_ID;
      envApiKey = (import.meta as any).env.VITE_FIREBASE_API_KEY;
    }
  } catch {
    // Fall back to default project
  }

  return {
    projectId: envProjectId || DEFAULT_PROJECT_ID,
    apiKey: envApiKey || DEFAULT_API_KEY,
  };
}

/**
 * Converts a JavaScript value into Firestore REST API Value format
 */
export function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return { integerValue: val.toString() };
    }
    return { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map((item) => toFirestoreValue(item)),
      },
    };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const [key, propVal] of Object.entries(val)) {
      fields[key] = toFirestoreValue(propVal);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/**
 * Converts Firestore REST API Value format back to JavaScript object
 */
export function fromFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map((item: any) => fromFirestoreValue(item));
  }
  if ('mapValue' in val) {
    const result: Record<string, any> = {};
    const fields = val.mapValue.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      result[k] = fromFirestoreValue(v);
    }
    return result;
  }
  return null;
}

/**
 * Converts a JavaScript dictionary into Firestore Document fields
 */
export function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      fields[key] = toFirestoreValue(value);
    }
  }
  return fields;
}

/**
 * Converts a Firestore Document into a flat JavaScript object
 */
export function fromFirestoreDocument<T = any>(doc: any): T {
  if (!doc || !doc.fields) return {} as T;
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(doc.fields)) {
    result[k] = fromFirestoreValue(v);
  }
  return result as T;
}

// Track in-memory sync telemetry
let currentSyncStatus: FirestoreSyncStatus = {
  isConfigured: true,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingSyncCount: 0,
};

type SyncListener = (status: FirestoreSyncStatus) => void;
const syncListeners: Set<SyncListener> = new Set();

export function subscribeToSyncStatus(listener: SyncListener): () => void {
  syncListeners.add(listener);
  listener(currentSyncStatus);
  return () => {
    syncListeners.delete(listener);
  };
}

function updateSyncStatus(patch: Partial<FirestoreSyncStatus>) {
  currentSyncStatus = { ...currentSyncStatus, ...patch };
  syncListeners.forEach((fn) => fn(currentSyncStatus));
}

/**
 * Saves or updates a Google user profile in Cloud Firestore
 */
export async function saveGoogleUserToFirestore(
  userData: {
    uid?: string;
    googleId?: string;
    email: string;
    name: string;
    role: string;
    picture?: string;
    className?: string;
    phone?: string;
    loginId?: string;
    authProvider?: string;
    enrolledByTeacherId?: string;
    enrolledClasses?: any[];
    subscription?: any;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getFirestoreConfig();
    const cleanEmail = userData.email?.trim().toLowerCase();
    const cleanEmailId = cleanEmail ? cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_') : '';
    const docId = (cleanEmailId || userData.googleId || 'user_' + Date.now())
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/users/${docId}${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const payload = {
      fields: toFirestoreFields({
        ...userData,
        email: cleanEmail || userData.email,
        enrolledByTeacherId: userData.enrolledByTeacherId || '',
        enrolledClasses: userData.enrolledClasses || [],
        subscription: userData.subscription || null,
        authProvider: userData.authProvider || 'google',
        lastLoginAt: new Date().toISOString(),
        syncedToCloudAt: new Date().toISOString(),
      }),
    };

    updateSyncStatus({ pendingSyncCount: currentSyncStatus.pendingSyncCount + 1 });

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Also persist under googleId document ID if different from email docId
    if (userData.googleId && userData.googleId !== docId) {
      const gDocId = userData.googleId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const gUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/users/${gDocId}${
        config.apiKey ? `?key=${config.apiKey}` : ''
      }`;
      fetch(gUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Firestore sync warning (HTTP ' + response.status + '):', errText);
      updateSyncStatus({
        pendingSyncCount: Math.max(0, currentSyncStatus.pendingSyncCount - 1),
        lastError: `HTTP ${response.status}: ${response.statusText}`,
      });
      return { success: false, error: errText };
    }

    updateSyncStatus({
      pendingSyncCount: Math.max(0, currentSyncStatus.pendingSyncCount - 1),
      lastSyncedAt: new Date().toISOString(),
      lastError: undefined,
      isOnline: true,
    });

    updateSyncStateInFirestore().catch(() => {});
    return { success: true };
  } catch (err: any) {
    console.warn('Firestore user sync network note:', err.message);
    updateSyncStatus({
      pendingSyncCount: Math.max(0, currentSyncStatus.pendingSyncCount - 1),
      lastError: err.message,
      isOnline: false,
    });
    return { success: false, error: err.message };
  }
}

/**
 * Saves a quiz assessment submission in Cloud Firestore
 */
export async function saveSubmissionToFirestore(
  submission: Submission,
  studentProfile?: { email?: string; googleId?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getFirestoreConfig();
    const docId = (submission.id || 'sub_' + Date.now()).replace(/[^a-zA-Z0-9_-]/g, '_');

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/submissions/${docId}${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const payload = {
      fields: toFirestoreFields({
        ...submission,
        studentEmail: studentProfile?.email || '',
        studentGoogleId: studentProfile?.googleId || '',
        syncedToCloudAt: new Date().toISOString(),
      }),
    };

    updateSyncStatus({ pendingSyncCount: currentSyncStatus.pendingSyncCount + 1 });

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Firestore submission sync notice (HTTP ' + response.status + '):', errText);
      updateSyncStatus({
        pendingSyncCount: Math.max(0, currentSyncStatus.pendingSyncCount - 1),
        lastError: `HTTP ${response.status}`,
      });
      return { success: false, error: errText };
    }

    updateSyncStatus({
      pendingSyncCount: Math.max(0, currentSyncStatus.pendingSyncCount - 1),
      lastSyncedAt: new Date().toISOString(),
      lastError: undefined,
    });

    return { success: true };
  } catch (err: any) {
    console.warn('Firestore submission network note:', err.message);
    updateSyncStatus({
      pendingSyncCount: Math.max(0, currentSyncStatus.pendingSyncCount - 1),
      lastError: err.message,
    });
    return { success: false, error: err.message };
  }
}

/**
 * Fetches user profile data from Firestore
 */
export async function fetchGoogleUserFromFirestore(
  googleIdOrEmail: string
): Promise<any | null> {
  try {
    const config = getFirestoreConfig();
    const docId = googleIdOrEmail.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/users/${docId}${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const doc = await response.json();
    return fromFirestoreDocument(doc);
  } catch {
    return null;
  }
}

/**
 * Specifically finds a student profile by their email address in Cloud Firestore.
 * Tries direct document lookups first, then falls back to normalized scan.
 */
export async function fetchStudentByEmailFromFirestore(email: string): Promise<any | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;
  const normEmail = normalizeEmail(cleanEmail);
  const cleanEmailDocId = cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_');

  try {
    // 1. Direct profile lookup by email doc ID
    const byProfileEmail = await fetchProfileByLoginId(cleanEmailDocId);
    if (byProfileEmail && byProfileEmail.password && byProfileEmail.password !== 'password123') {
      return byProfileEmail;
    }

    // 2. Scan all deduplicated profiles with Gmail dot normalization (resolves split-brain passwords)
    const allProfiles = await fetchAllProfilesFromFirestore();
    const foundInProfiles = allProfiles.find((p) => {
      const pEmail = p.email?.trim().toLowerCase();
      const pLogin = p.loginId?.trim().toLowerCase();
      return (
        pEmail === cleanEmail ||
        pLogin === cleanEmail ||
        (pEmail && normalizeEmail(pEmail) === normEmail) ||
        (pLogin && normalizeEmail(pLogin) === normEmail)
      );
    });

    if (foundInProfiles) {
      return foundInProfiles;
    }

    if (byProfileEmail) {
      return byProfileEmail;
    }

    // 3. Direct user lookup in users collection
    const byUserEmail = await fetchGoogleUserFromFirestore(cleanEmail);
    if (byUserEmail) {
      return byUserEmail;
    }
  } catch {
    // offline
  }

  return null;
}

/**
 * Checks connectivity to the Cloud Firestore database
 */
export async function testFirestoreConnection(): Promise<{
  connected: boolean;
  projectId: string;
  status: string;
}> {
  const config = getFirestoreConfig();
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/users?pageSize=1${
      config.apiKey ? `&key=${config.apiKey}` : ''
    }`;

    const response = await fetch(url);
    if (response.status === 200) {
      return { connected: true, projectId: config.projectId, status: 'Online & Verified' };
    }
    if (response.status === 403 || response.status === 401) {
      return { connected: true, projectId: config.projectId, status: 'Connected (Rules Enforced)' };
    }
    return { connected: false, projectId: config.projectId, status: `HTTP ${response.status}` };
  } catch (err: any) {
    return { connected: false, projectId: config.projectId, status: err.message || 'Offline' };
  }
}

/**
 * Synchronizes an institutional user profile (with latest password and details) to Cloud Firestore
 */
export async function syncProfileToFirestore(
  role: UserRole,
  user: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getFirestoreConfig();
    const cleanLoginId = (user.loginId || user.id || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');

    if (!cleanLoginId) return { success: false, error: 'Missing login ID' };

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/profiles/${cleanLoginId}${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const isAfzal =
      user.loginId?.toLowerCase() === 'afzal@ccap.com' ||
      user.email?.toLowerCase() === 'afzal@ccap.com';
    let safeCloudPassword = isAfzal
      ? (user.password && user.password !== 'password123' ? user.password : 'Afzal123/')
      : (user.password || '');

    // Hard Gatekeeper: Never overwrite an existing custom password in Cloud Firestore with 'password123' or empty string
    if (!safeCloudPassword || safeCloudPassword === 'password123') {
      const existingCloud = await fetchProfileByLoginId(user.loginId || user.email || '');
      if (existingCloud?.password && existingCloud.password !== 'password123') {
        safeCloudPassword = existingCloud.password;
      }
    }

    const payload = {
      fields: toFirestoreFields({
        id: user.id,
        role,
        loginId: user.loginId,
        password: safeCloudPassword,
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        className: user.className || '',
        assignments: user.assignments || [],
        enrolledByTeacherId: user.enrolledByTeacherId || '',
        enrolledClasses: user.enrolledClasses || [],
        enrolledAt: user.enrolledAt || '',
        maxClasses: user.maxClasses || 5,
        lifetimeClassesCreated: user.lifetimeClassesCreated || 0,
        googleId: user.googleId || '',
        googlePicture: user.googlePicture || '',
        subscription: user.subscription || null,
        deleted: false,
        deletedAt: '',
        updatedAt: user.updatedAt || new Date().toISOString(),
      }),
    };

    const requests: Promise<Response>[] = [
      fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    ];

    // If profile has an email, also persist under email document ID atomically for instant email lookup
    if (user.email) {
      const cleanEmailId = user.email.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      if (cleanEmailId && cleanEmailId !== cleanLoginId) {
        const emailUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/profiles/${cleanEmailId}${
          config.apiKey ? `?key=${config.apiKey}` : ''
        }`;
        requests.push(
          fetch(emailUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        );
      }
    }

    const [response] = await Promise.all(requests);

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Firestore profile sync notice:', errText);
      return { success: false, error: errText };
    }

    updateSyncStateInFirestore().catch(() => {});
    return { success: true };
  } catch (err: any) {
    console.warn('Firestore profile sync network notice:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Marks a profile document (and its email alias document) as deleted in Cloud Firestore
 * and purges any associated Google user documents so all logged-in devices immediately evict the profile.
 */
export async function deleteProfileFromFirestore(
  loginId: string,
  email?: string,
  id?: string,
  googleId?: string
): Promise<{ success: boolean }> {
  try {
    const config = getFirestoreConfig();
    const cleanLogin = loginId.trim().toLowerCase();
    const cleanLoginId = cleanLogin.replace(/[^a-z0-9_-]/g, '_');
    if (!cleanLoginId) return { success: false };

    const nowIso = new Date().toISOString();
    const tombstonePayload = {
      fields: toFirestoreFields({
        id: id || '',
        loginId: cleanLogin,
        email: email ? email.trim().toLowerCase() : '',
        deleted: true,
        deletedAt: nowIso,
        updatedAt: nowIso,
      }),
    };

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/profiles/${cleanLoginId}${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const requests: Promise<any>[] = [
      fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tombstonePayload),
      }).catch(() => {}),
      // Also delete from users collection if present
      fetch(
        `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/users/${cleanLoginId}${
          config.apiKey ? `?key=${config.apiKey}` : ''
        }`,
        { method: 'DELETE' }
      ).catch(() => {}),
    ];

    if (email) {
      const cleanEmailId = email.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      if (cleanEmailId) {
        if (cleanEmailId !== cleanLoginId) {
          const emailUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/profiles/${cleanEmailId}${
            config.apiKey ? `?key=${config.apiKey}` : ''
          }`;
          requests.push(
            fetch(emailUrl, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(tombstonePayload),
            }).catch(() => {})
          );
        }
        const userEmailUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/users/${cleanEmailId}${
          config.apiKey ? `?key=${config.apiKey}` : ''
        }`;
        requests.push(fetch(userEmailUrl, { method: 'DELETE' }).catch(() => {}));
      }
    }

    if (googleId) {
      const cleanGoogleId = googleId.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      if (cleanGoogleId) {
        const gUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/users/${cleanGoogleId}${
          config.apiKey ? `?key=${config.apiKey}` : ''
        }`;
        requests.push(fetch(gUrl, { method: 'DELETE' }).catch(() => {}));
      }
    }

    await Promise.all(requests);
    updateSyncStateInFirestore().catch(() => {});
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Helper to merge two Firestore profile documents representing the same user.
 * Always preserves custom (non-'password123') passwords and newer updatedAt metadata.
 */
function mergeCloudProfileDocs(existing: any, incoming: any): any {
  const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
  const incomingTime = incoming.updatedAt ? new Date(incoming.updatedAt).getTime() : 0;
  const newer = incomingTime >= existingTime ? incoming : existing;
  const older = incomingTime >= existingTime ? existing : incoming;

  const existingPass = (existing.password || '').trim();
  const incomingPass = (incoming.password || '').trim();

  let bestPassword = newer.password || older.password || '';
  if (existingPass && existingPass !== 'password123' && (!incomingPass || incomingPass === 'password123')) {
    bestPassword = existingPass;
  } else if (incomingPass && incomingPass !== 'password123' && (!existingPass || existingPass === 'password123')) {
    bestPassword = incomingPass;
  }

  return {
    ...older,
    ...newer,
    password: bestPassword,
    enrolledByTeacherId: newer.enrolledByTeacherId || older.enrolledByTeacherId || '',
    enrolledClasses:
      newer.enrolledClasses && newer.enrolledClasses.length >= (older.enrolledClasses?.length || 0)
        ? newer.enrolledClasses
        : older.enrolledClasses || [],
    subscription: newer.subscription || older.subscription || null,
  };
}

/**
 * Fetches the latest credentials/profile for a given Login ID from Cloud Firestore.
 * Also checks the user's sibling email/loginId document if the primary document has a default password.
 */
export async function fetchProfileByLoginId(
  loginId: string
): Promise<any | null> {
  try {
    const config = getFirestoreConfig();
    const cleanLoginId = loginId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    if (!cleanLoginId) return null;

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/profiles/${cleanLoginId}${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const doc = await response.json();
    const primary = fromFirestoreDocument(doc);
    if (!primary || primary.deleted === true || (!primary.loginId && !primary.email)) return null;

    // If primary doc has 'password123' or empty password, check sibling doc (loginId vs email)
    if (!primary.password || primary.password === 'password123') {
      const altId =
        primary.loginId && primary.loginId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') !== cleanLoginId
          ? primary.loginId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
          : primary.email && primary.email.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') !== cleanLoginId
          ? primary.email.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
          : '';
      if (altId) {
        const altUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/profiles/${altId}${
          config.apiKey ? `?key=${config.apiKey}` : ''
        }`;
        const altRes = await fetch(altUrl);
        if (altRes.ok) {
          const altDoc = await altRes.json();
          const secondary = fromFirestoreDocument(altDoc);
          if (secondary?.deleted === true) return null;
          if (secondary && (secondary.loginId || secondary.email)) {
            return mergeCloudProfileDocs(primary, secondary);
          }
        }
      }
    }

    return primary;
  } catch {
    return null;
  }
}

/**
 * Fetches both active profiles and deleted profile tombstones from Cloud Firestore.
 */
export async function fetchAllProfilesWithTombstonesFromFirestore(): Promise<{
  active: any[];
  deleted: any[];
}> {
  try {
    const config = getFirestoreConfig();
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/profiles?pageSize=300${
      config.apiKey ? `&key=${config.apiKey}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) return { active: [], deleted: [] };

    const data = await response.json();
    if (!data.documents || !Array.isArray(data.documents)) return { active: [], deleted: [] };

    const rawDocs = data.documents.map((doc: any) => fromFirestoreDocument(doc));
    const deduped: any[] = [];
    const deletedDocs: any[] = [];

    for (const doc of rawDocs) {
      if (!doc || (!doc.loginId && !doc.email && !doc.id)) continue;
      if (doc.deleted === true) {
        deletedDocs.push(doc);
        continue;
      }
      const docLogin = (doc.loginId || '').trim().toLowerCase();
      const docEmail = (doc.email || '').trim().toLowerCase();
      const docNormEmail = docEmail && docEmail.includes('@') ? normalizeEmail(docEmail) : '';

      const existingIdx = deduped.findIndex((existing) => {
        if (doc.id && existing.id && doc.id === existing.id) return true;
        const exLogin = (existing.loginId || '').trim().toLowerCase();
        if (docLogin && exLogin && docLogin === exLogin) return true;
        const exEmail = (existing.email || '').trim().toLowerCase();
        const exNormEmail = exEmail && exEmail.includes('@') ? normalizeEmail(exEmail) : '';
        if (
          existing.role === doc.role &&
          docEmail &&
          exEmail &&
          (docEmail === exEmail || (docNormEmail && docNormEmail === exNormEmail))
        ) {
          return true;
        }
        return false;
      });

      if (existingIdx >= 0) {
        deduped[existingIdx] = mergeCloudProfileDocs(deduped[existingIdx], doc);
      } else {
        deduped.push(doc);
      }
    }

    // Filter out any active doc that has a newer tombstone in deletedDocs
    const finalActive = deduped.filter((activeDoc) => {
      const aLogin = (activeDoc.loginId || '').trim().toLowerCase();
      const aEmail = (activeDoc.email || '').trim().toLowerCase();
      const aNormEmail = aEmail && aEmail.includes('@') ? normalizeEmail(aEmail) : '';
      const aTime = activeDoc.updatedAt ? new Date(activeDoc.updatedAt).getTime() : 0;

      const matchingTombstone = deletedDocs.find((delDoc) => {
        const dLogin = (delDoc.loginId || '').trim().toLowerCase();
        const dEmail = (delDoc.email || '').trim().toLowerCase();
        const dNormEmail = dEmail && dEmail.includes('@') ? normalizeEmail(dEmail) : '';
        return (
          (activeDoc.id && delDoc.id && activeDoc.id === delDoc.id) ||
          (aLogin && dLogin && aLogin === dLogin) ||
          (aEmail && dEmail && (aEmail === dEmail || (aNormEmail && aNormEmail === dNormEmail)))
        );
      });

      if (!matchingTombstone) return true;
      const delTime = matchingTombstone.deletedAt
        ? new Date(matchingTombstone.deletedAt).getTime()
        : matchingTombstone.updatedAt
        ? new Date(matchingTombstone.updatedAt).getTime()
        : Date.now();
      return aTime > delTime;
    });

    return { active: finalActive, deleted: deletedDocs };
  } catch {
    return { active: [], deleted: [] };
  }
}

/**
 * Fetches all updated active profiles stored in Cloud Firestore, deduplicating loginId/email alias documents
 * and ensuring custom passwords are never overwritten by stale 'password123' duplicates.
 */
export async function fetchAllProfilesFromFirestore(): Promise<any[]> {
  const { active } = await fetchAllProfilesWithTombstonesFromFirestore();
  return active;
}

/**
 * Synchronizes an Academy subscription record to Cloud Firestore
 */
export async function syncSubscriptionToFirestore(
  sub: UserSubscription
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getFirestoreConfig();
    const cleanId = (sub.id || '').trim().replace(/[^a-z0-9_-]/gi, '_');
    if (!cleanId) return { success: false, error: 'Missing subscription ID' };

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/subscriptions/${cleanId}${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const payload = {
      fields: toFirestoreFields(sub),
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Firestore subscription sync notice:', errText);
      return { success: false, error: errText };
    }

    updateSyncStateInFirestore().catch(() => {});
    return { success: true };
  } catch (err: any) {
    console.warn('Firestore subscription sync network notice:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches all subscriptions stored in Cloud Firestore
 */
export async function fetchAllSubscriptionsFromFirestore(): Promise<UserSubscription[]> {
  try {
    const config = getFirestoreConfig();
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/subscriptions?pageSize=300${
      config.apiKey ? `&key=${config.apiKey}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.documents || !Array.isArray(data.documents)) return [];

    return data.documents.map((doc: any) => fromFirestoreDocument<UserSubscription>(doc));
  } catch {
    return [];
  }
}

/**
 * Deletes a subscription document from Cloud Firestore
 */
export async function deleteSubscriptionFromFirestore(
  subId: string
): Promise<{ success: boolean }> {
  try {
    const config = getFirestoreConfig();
    const cleanId = (subId || '').trim().replace(/[^a-z0-9_-]/gi, '_');
    if (!cleanId) return { success: false };

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/subscriptions/${cleanId}${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    await fetch(url, { method: 'DELETE' });
    updateSyncStateInFirestore().catch(() => {});
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Synchronizes a Quiz entity to Cloud Firestore
 */
export async function syncQuizToFirestore(
  quiz: Quiz
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getFirestoreConfig();
    const cleanId = (quiz.id || '').trim().replace(/[^a-z0-9_-]/gi, '_');
    if (!cleanId) return { success: false, error: 'Missing quiz ID' };

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/quizzes/${cleanId}${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const payload = {
      fields: toFirestoreFields({
        ...quiz,
        updatedAt: quiz.updatedAt || new Date().toISOString(),
      }),
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Firestore quiz sync notice:', errText);
      return { success: false, error: errText };
    }

    updateSyncStateInFirestore().catch(() => {});
    return { success: true };
  } catch (err: any) {
    console.warn('Firestore quiz sync network notice:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a quiz document from Cloud Firestore
 */
export async function deleteQuizFromFirestore(
  quizId: string
): Promise<{ success: boolean }> {
  try {
    const config = getFirestoreConfig();
    const cleanId = (quizId || '').trim().replace(/[^a-z0-9_-]/gi, '_');
    if (!cleanId) return { success: false };

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/quizzes/${cleanId}${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    await fetch(url, { method: 'DELETE' });
    updateSyncStateInFirestore().catch(() => {});
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Fetches all quizzes stored in Cloud Firestore
 */
export async function fetchAllQuizzesFromFirestore(): Promise<Quiz[]> {
  try {
    const config = getFirestoreConfig();
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/quizzes?pageSize=300${
      config.apiKey ? `&key=${config.apiKey}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.documents || !Array.isArray(data.documents)) return [];

    return data.documents.map((doc: any) => fromFirestoreDocument<Quiz>(doc));
  } catch {
    return [];
  }
}

/**
 * Fetches all submissions stored in Cloud Firestore
 */
export async function fetchAllSubmissionsFromFirestore(): Promise<Submission[]> {
  try {
    const config = getFirestoreConfig();
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/submissions?pageSize=300${
      config.apiKey ? `&key=${config.apiKey}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.documents || !Array.isArray(data.documents)) return [];

    return data.documents.map((doc: any) => fromFirestoreDocument<Submission>(doc));
  } catch {
    return [];
  }
}

/**
 * Fetches the global sync state heartbeat from Cloud Firestore
 */
export async function fetchSyncStateFromFirestore(): Promise<{
  lastSyncedAt?: string;
  version?: number;
} | null> {
  try {
    const config = getFirestoreConfig();
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/app_data/sync_state${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const doc = await response.json();
    return fromFirestoreDocument(doc);
  } catch {
    return null;
  }
}

/**
 * Updates the global sync state heartbeat in Cloud Firestore to notify all clients
 */
export async function updateSyncStateInFirestore(extraData?: Record<string, any>): Promise<void> {
  try {
    const config = getFirestoreConfig();
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/app_data/sync_state${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: toFirestoreFields({
          lastSyncedAt: new Date().toISOString(),
          version: Date.now(),
          system: 'Cadets Coaching Academy Assessment Portal',
          ...(extraData || {}),
        }),
      }),
    });
  } catch {
    // Non-blocking telemetry
  }
}

/**
 * Fetches the consolidated Master Database snapshot from Cloud Firestore
 */
export async function fetchMasterDatabaseFromFirestore(): Promise<any | null> {
  try {
    const config = getFirestoreConfig();
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/app_data/master_database${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const doc = await response.json();
    return fromFirestoreDocument(doc);
  } catch {
    return null;
  }
}

/**
 * Synchronizes the complete Master Database snapshot into Cloud Firestore
 */
export async function syncMasterDatabaseToFirestore(dbData: any): Promise<boolean> {
  try {
    const config = getFirestoreConfig();
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/app_data/master_database${
      config.apiKey ? `?key=${config.apiKey}` : ''
    }`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: toFirestoreFields({
          ...dbData,
          updatedAt: new Date().toISOString(),
        }),
      }),
    });

    if (response.ok) {
      await updateSyncStateInFirestore();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}


