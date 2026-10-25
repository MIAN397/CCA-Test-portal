/**
 * Google Authentication & Identity Services (GIS) Utility
 * Cadets Coaching Academy Assessment Portal
 */

import { UserRole, AdminUser, DeveloperUser, Teacher, Student } from '../types';

export interface GoogleUserProfile {
  email: string;
  name: string;
  picture?: string;
  sub: string;
  email_verified?: boolean;
}

/**
 * Safely decodes Google's OpenID Connect JWT credential
 */
export function parseGoogleJwt(token: string): GoogleUserProfile | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      email: parsed.email || '',
      name: parsed.name || parsed.given_name || 'Google User',
      picture: parsed.picture,
      sub: parsed.sub || '',
      email_verified: parsed.email_verified,
    };
  } catch (err) {
    console.error('Error decoding Google JWT credential:', err);
    return null;
  }
}

export interface GoogleMatchResult {
  matched: boolean;
  role?: UserRole;
  user?: AdminUser | DeveloperUser | Teacher | Student;
}

/**
 * Normalizes email addresses (stripping Gmail dots, handling domain aliases)
 */
export function normalizeEmail(em?: string): string {
  if (!em) return '';
  const clean = em.trim().toLowerCase();
  const parts = clean.split('@');
  if (parts.length === 2 && (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com')) {
    const user = parts[0].split('+')[0].replace(/\./g, '');
    return `${user}@gmail.com`;
  }
  return clean;
}

/**
 * Checks whether an email address is a valid Gmail address (@gmail.com or @googlemail.com)
 */
export function isGmailAddress(em?: string): boolean {
  if (!em) return false;
  const clean = em.trim().toLowerCase();
  const parts = clean.split('@');
  return parts.length === 2 && (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com');
}

/**
 * Matches a Google email address against all registered Academy users
 */
export function matchGoogleUser(
  email: string,
  admins: AdminUser[],
  developers: DeveloperUser[],
  teachers: Teacher[],
  students: Student[]
): GoogleMatchResult {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { matched: false };

  const normTarget = normalizeEmail(cleanEmail);

  // 1. Check Faculty Teachers
  const teacherMatch = teachers.find(
    (t) =>
      t.email?.trim().toLowerCase() === cleanEmail ||
      t.loginId?.trim().toLowerCase() === cleanEmail ||
      (t.email && normalizeEmail(t.email) === normTarget) ||
      (t.loginId && normalizeEmail(t.loginId) === normTarget)
  );
  if (teacherMatch) {
    return { matched: true, role: 'teacher', user: teacherMatch };
  }

  // 2. Check Cadet Students (combine provided props and local storage)
  const studentMap = new Map<string, Student>();
  if (Array.isArray(students)) {
    students.forEach((s) => {
      if (s && s.id) studentMap.set(s.id, s);
    });
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('cca_students_v2');
      if (raw) {
        const stored = JSON.parse(raw);
        if (Array.isArray(stored)) {
          stored.forEach((s: Student) => {
            if (s && s.id && !studentMap.has(s.id)) {
              studentMap.set(s.id, s);
            }
          });
        }
      }
    } catch {
      // fallback
    }
  }

  const studentPool = Array.from(studentMap.values());

  const studentMatch = studentPool.find(
    (s) =>
      s.email?.trim().toLowerCase() === cleanEmail ||
      s.loginId?.trim().toLowerCase() === cleanEmail ||
      (s.email && normalizeEmail(s.email) === normTarget) ||
      (s.loginId && normalizeEmail(s.loginId) === normTarget)
  );
  if (studentMatch) {
    return { matched: true, role: 'student', user: studentMatch };
  }

  // 3. Check Administrators
  const adminMatch = admins.find(
    (a) =>
      a.email?.trim().toLowerCase() === cleanEmail ||
      a.loginId?.trim().toLowerCase() === cleanEmail ||
      (a.email && normalizeEmail(a.email) === normTarget) ||
      (a.loginId && normalizeEmail(a.loginId) === normTarget)
  );
  if (adminMatch) {
    return { matched: true, role: 'admin', user: adminMatch };
  }

  // 4. Check Developers
  const devMatch = developers.find(
    (d) =>
      d.email?.trim().toLowerCase() === cleanEmail ||
      d.loginId?.trim().toLowerCase() === cleanEmail ||
      (d.email && normalizeEmail(d.email) === normTarget) ||
      (d.loginId && normalizeEmail(d.loginId) === normTarget)
  );
  if (devMatch) {
    return { matched: true, role: 'developer', user: devMatch };
  }

  return { matched: false };
}

/**
 * Returns configured Google Client ID from environment variables
 */
export function getGoogleClientId(): string {
  try {
    const env = (import.meta as any).env;
    if (env && typeof env.VITE_GOOGLE_CLIENT_ID === 'string' && env.VITE_GOOGLE_CLIENT_ID.trim()) {
      return env.VITE_GOOGLE_CLIENT_ID.trim();
    }
  } catch (e) {
    // Fallback if environment is not configured
  }
  return '317362238573-kbm6cbfc13hemeevtvi2c94kfd7c5mm8.apps.googleusercontent.com';
}

/**
 * Returns current clean origin for OAuth redirect URI (e.g. https://ccap-testportal.web.app or http://localhost:5173)
 */
export function getCleanRedirectUri(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

/**
 * Constructs the official Google OAuth 2.0 authorization URL for direct browser redirection
 */
export function getGoogleOAuthUrl(redirectUri?: string): string {
  const clientId = getGoogleClientId();
  const targetUri = redirectUri || getCleanRedirectUri();
  const nonce = 'cca-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const state = 'cca-' + Math.random().toString(36).substring(2, 10);

  try {
    sessionStorage.setItem('cca_google_oauth_nonce', nonce);
    sessionStorage.setItem('cca_google_oauth_state', state);
    sessionStorage.setItem('cca_google_redirect_time', Date.now().toString());
  } catch {
    // SessionStorage fallback
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: targetUri,
    response_type: 'token id_token',
    scope: 'openid email profile',
    nonce: nonce,
    state: state,
    prompt: 'select_account',
    include_granted_scopes: 'true',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Redirects the entire page directly to Google Accounts for authentication
 */
export function initiateGoogleRedirect(redirectUri?: string): void {
  const url = getGoogleOAuthUrl(redirectUri);
  if (typeof window !== 'undefined') {
    window.location.assign(url);
  }
}

/**
 * Parses URL hash fragment returned by Google OAuth redirect
 */
export function parseGoogleRedirectHash(hash: string): {
  accessToken?: string;
  idToken?: string;
  error?: string;
  errorDescription?: string;
} {
  if (!hash) return {};
  const clean = hash.startsWith('#') ? hash.substring(1) : hash;
  const params = new URLSearchParams(clean);
  return {
    accessToken: params.get('access_token') || undefined,
    idToken: params.get('id_token') || undefined,
    error: params.get('error') || undefined,
    errorDescription: params.get('error_description') || undefined,
  };
}

/**
 * Fetches user profile using OAuth access token as secondary fallback
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserProfile | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      email: data.email || '',
      name: data.name || data.given_name || 'Google User',
      picture: data.picture,
      sub: data.sub || '',
      email_verified: data.email_verified,
    };
  } catch (err) {
    console.error('Failed to fetch Google userinfo:', err);
    return null;
  }
}

/**
 * Inspects incoming URL hash/search for Google redirect response and extracts user profile
 */
export async function handleGoogleRedirectCallback(): Promise<{
  profile: GoogleUserProfile | null;
  error?: string;
}> {
  if (typeof window === 'undefined') return { profile: null };

  const hash = window.location.hash;
  const search = window.location.search;

  // 1. Check URL query parameters for OAuth errors
  if (search) {
    const searchParams = new URLSearchParams(search);
    const searchError = searchParams.get('error');
    if (searchError) {
      window.history.replaceState(null, '', window.location.pathname);
      return { profile: null, error: searchParams.get('error_description') || searchError };
    }
  }

  // 2. Check if hash contains tokens or errors
  if (
    !hash ||
    (!hash.includes('access_token=') && !hash.includes('id_token=') && !hash.includes('error='))
  ) {
    return { profile: null };
  }

  const { accessToken, idToken, error, errorDescription } = parseGoogleRedirectHash(hash);

  // Clean the hash from the browser URL immediately for cleanliness and security
  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  if (error) {
    return { profile: null, error: errorDescription || error };
  }

  let profile: GoogleUserProfile | null = null;
  if (idToken) {
    profile = parseGoogleJwt(idToken);
  }

  if ((!profile || !profile.email) && accessToken) {
    profile = await fetchGoogleUserInfo(accessToken);
  }

  return { profile };
}

/**
 * Dynamically loads the official Google Identity Services script if not already on page
 */
export function loadGoogleIdentityScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).google?.accounts?.id) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}
