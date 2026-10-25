import { Quiz, Submission, Teacher, Student } from '../types';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:5000';

/**
 * Universal fetch wrapper with error handling and authorization token injection
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cca_jwt_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }

  return data as T;
}

// ========================
// HEALTH & MIGRATION API
// ========================
export async function checkBackendHealth(): Promise<{ status: string; database: string }> {
  return request<{ status: string; database: string }>('/api/health');
}

export async function seedMongoDatabase(): Promise<{
  success: boolean;
  message: string;
  stats: Record<string, number>;
}> {
  return request('/api/seed', { method: 'POST' });
}

// ========================
// QUIZ MANAGEMENT API
// ========================
export async function fetchAllQuizzes(params?: {
  teacherId?: string;
  subject?: string;
  className?: string;
  publishStatus?: string;
}): Promise<Quiz[]> {
  const query = new URLSearchParams();
  if (params?.teacherId) query.set('teacherId', params.teacherId);
  if (params?.subject) query.set('subject', params.subject);
  if (params?.className) query.set('className', params.className);
  if (params?.publishStatus) query.set('publishStatus', params.publishStatus);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await request<{ success: boolean; quizzes: Quiz[] }>(`/api/quizzes${qs}`);
  return data.quizzes || [];
}

export async function fetchQuizById(id: string): Promise<Quiz> {
  const data = await request<{ success: boolean; quiz: Quiz }>(`/api/quizzes/${encodeURIComponent(id)}`);
  return data.quiz;
}

export async function createQuizOnServer(quizData: Partial<Quiz>): Promise<Quiz> {
  const data = await request<{ success: boolean; quiz: Quiz }>('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData)
  });
  return data.quiz;
}

export async function updateQuizOnServer(id: string, quizData: Partial<Quiz>): Promise<Quiz> {
  const data = await request<{ success: boolean; quiz: Quiz }>(`/api/quizzes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(quizData)
  });
  return data.quiz;
}

export async function deleteQuizOnServer(id: string): Promise<boolean> {
  const data = await request<{ success: boolean }>(`/api/quizzes/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  return data.success;
}

export async function cloneQuizOnServer(id: string): Promise<Quiz> {
  const data = await request<{ success: boolean; quiz: Quiz }>(`/api/quizzes/${encodeURIComponent(id)}/clone`, {
    method: 'POST'
  });
  return data.quiz;
}

// ========================
// SUBMISSIONS & RESULTS
// ========================
export async function fetchAllSubmissions(params?: {
  teacherId?: string;
  studentId?: string;
  quizId?: string;
}): Promise<Submission[]> {
  const query = new URLSearchParams();
  if (params?.teacherId) query.set('teacherId', params.teacherId);
  if (params?.studentId) query.set('studentId', params.studentId);
  if (params?.quizId) query.set('quizId', params.quizId);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await request<{ success: boolean; submissions: Submission[] }>(`/api/submissions${qs}`);
  return data.submissions || [];
}

export async function submitQuizToServer(submissionData: Partial<Submission>): Promise<Submission> {
  const data = await request<{ success: boolean; submission: Submission }>('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(submissionData)
  });
  return data.submission;
}

// ========================
// USER & ROSTER API
// ========================
export async function fetchAllTeachers(): Promise<Teacher[]> {
  const data = await request<{ success: boolean; teachers: Teacher[] }>('/api/users/teachers');
  return data.teachers || [];
}

export async function fetchAllStudents(teacherId?: string): Promise<Student[]> {
  const qs = teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : '';
  const data = await request<{ success: boolean; students: Student[] }>(`/api/users/students${qs}`);
  return data.students || [];
}

export async function updateUserOnServer(id: string, userData: any): Promise<any> {
  const data = await request<{ success: boolean; user: any }>(`/api/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
  return data.user;
}

// ========================
// AUTHENTICATION API
// ========================
export async function loginToServer(credentials: {
  loginId?: string;
  email?: string;
  password?: string;
  role?: string;
}): Promise<{ user: any; token: string }> {
  const data = await request<{ success: boolean; user: any; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  if (data.token && typeof localStorage !== 'undefined') {
    localStorage.setItem('cca_jwt_token', data.token);
  }
  return data;
}

export async function googleLoginToServer(profile: {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  role?: string;
}): Promise<{ user: any; token: string }> {
  const data = await request<{ success: boolean; user: any; token: string }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify(profile)
  });
  if (data.token && typeof localStorage !== 'undefined') {
    localStorage.setItem('cca_jwt_token', data.token);
  }
  return data;
}
