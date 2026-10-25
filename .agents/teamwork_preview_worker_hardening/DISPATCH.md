## 2026-08-28T10:46:05Z

You are the Code Hardening & Bug Patching Worker for CCAP Assessment Portal.

Your Working Directory: /Users/miantuahaafzal/Documents/Test system/.agents/teamwork_preview_worker_hardening
Project Directory: /Users/miantuahaafzal/Documents/Test system
User Request File: /Users/miantuahaafzal/Documents/Test system/.agents/ORIGINAL_REQUEST.md
Project Scope Document: /Users/miantuahaafzal/Documents/Test system/PROJECT.md
Parent Orchestrator ID: 56e8f97d-1cc3-4a52-b707-80e751ce15c8

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Assigned Task:
1. Read /Users/miantuahaafzal/Documents/Test system/.agents/ORIGINAL_REQUEST.md and /Users/miantuahaafzal/Documents/Test system/PROJECT.md.
2. Read the Survey Handoff reports from:
   - /Users/miantuahaafzal/Documents/Test system/.agents/teamwork_preview_explorer_survey_1/handoff.md
   - /Users/miantuahaafzal/Documents/Test system/.agents/teamwork_preview_explorer_survey_2/handoff.md
   - /Users/miantuahaafzal/Documents/Test system/.agents/teamwork_preview_explorer_survey_3/handoff.md
3. Implement genuine, robust fixes and hardening across the codebase:
   - **Fix 1 (`src/components/TakeAssessmentModal.tsx`)**: Fix the critical stale closure in countdown timer. Use a ref (`answersRef.current = answers`) inside `handleAutoSubmit()` so that when timer reaches 0:00, all answers chosen by the cadet are preserved and accurately submitted.
   - **Fix 2 (`src/utils/storage.ts`)**: Add `notifyLiveSync()` call to ALL data mutations: `saveSubmissions`, `saveTeachers`, `saveAdmins`, `saveDevelopers`, `resetDatabaseToDefaults`, `importFullDatabaseJSON` so that BroadcastChannel propagates all updates across tabs in real-time.
   - **Fix 3 (`src/utils/storage.ts` & `src/App.tsx`)**: Fix `submitQuiz` to accept and persist the actual `teacherName` from the quiz object rather than the hardcoded string `"Faculty Instructor"`.
   - **Fix 4 (`src/components/StudentPortal.tsx`)**: Enforce strict multi-tenant isolation in cadet test discovery: verify that student belongs to the teacher who authored/assigned the quiz when matching by class name. Remove hardcoded `"afzal"` string matching.
   - **Fix 5 (`src/components/TeacherDashboard.tsx`)**: In the Quiz Bank tab, ensure draft quizzes created without an assigned class (unassigned drafts) are rendered in a dedicated "General / Unassigned Drafts" accordion so they are never orphaned or hidden.
   - **Fix 6 (`src/components/RecruitTeacherModal.tsx` & `src/components/ManageProfileModal.tsx`)**: Preserve `lifetimeClassesCreated` when editing teacher profiles so lifetime quota slots are never erroneously refunded on edit.
   - **Fix 7 (`src/App.tsx`, `src/components/StudentPortal.tsx`, `src/components/TeacherDashboard.tsx`)**: Guard against division by zero in percentage and mastery calculations when `totalMarks <= 0`.
   - **Enhancement (`src/components/TakeAssessmentModal.tsx`)**: Add anti-cheating browser event listeners: tab switch / visibility change listener (`document.addEventListener('visibilitychange', ...)`), window blur warning toast, and clipboard / contextmenu protections.
4. Verify by running `npm run build`. Ensure 0 TypeScript errors and clean build.
5. Document all changes and verification commands in your handoff report at `/Users/miantuahaafzal/Documents/Test system/.agents/teamwork_preview_worker_hardening/handoff.md`.
6. Send completion message back to parent orchestrator.
