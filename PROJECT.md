# Project: CCAP Assessment Portal — Comprehensive Testing, Validation & Hardening

## Architecture
- **Tech Stack**: React 19, TypeScript 5.7.3, Vite 6.1.0, Lucide Icons, LocalStorage (`cca_*_v2`), BroadcastChannel (`cca_live_sync_v2`).
- **Core Entities**:
  - `AdminUser` & `DeveloperUser`: System management, teacher quotas, global oversight.
  - `Teacher`: Instructor profiles, lifetime class quotas (`maxClasses`, `lifetimeClassesCreated`), multi-subject class assignments (`TeacherAssignment[]`).
  - `Student`: Cadet records, login slug, phone, assigned class, enrolled teacher link (`enrolledByTeacherId`).
  - `Quiz`: Master question papers, dual timers (`durationMinutes`, `publishWindow`), publish state (`draft` vs `published`), allocation (`classes`, `students`, `all`), Quiz Bank flag (`isInQuizBank`).
  - `Submission`: Cadet exam records, answers, marks, percentage, pass/fail status, time spent, teacher/student links.
- **State & Data Flow**:
  - Persistence layer: `src/utils/storage.ts` manages all CRUD operations and triggers cross-tab sync via `BroadcastChannel('cca_live_sync_v2')`.
  - App state: `src/App.tsx` initializes sessions, attaches storage/broadcast listeners, and manages top-level navigation.
  - Role portals: `TeacherDashboard.tsx`, `StudentPortal.tsx`, `AdminDashboard.tsx`, `DeveloperModal.tsx`.
  - Exam modals: `CreateAssessmentModal.tsx`, `TakeAssessmentModal.tsx`, `ResultModal.tsx`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Faculty Profile & Multi-Subject Setup | Teacher assignments to classes with multiple subjects, 3-level directory tree (Class ➔ Subject ➔ Cadet). | M1 | Survey / R1 |
| F2 | Lifetime Class Quota Enforcement | Enforce `lifetimeClassesCreated` <= `maxClasses`, prevent decrement on class deletion, admin/dev quota adjustments. | M1 | Survey / R1 |
| F3 | Multi-Tenant Data Isolation | Strict isolation of students, quizzes, classes, and submissions per teacher; eliminate student test leaks across teachers. | M1 | Survey / R1 |
| F4 | Quiz Authoring & Draft Management | Step wizard, Draft vs Published, exit confirmation draft save, unassigned drafts accessibility in Quiz Bank. | M2 | Survey / R2 |
| F5 | Dual-Timer Engine & Publishing States | Calculation of `draft`, `scheduled`, `active`, `expired` states; in-exam duration countdown. | M2 | Survey / R2 |
| F6 | Quiz Bank & "To Bank" Unassign | Master bank repository, class grouping, clone/re-allot, "To Bank" unassign removing test from active desks immediately. | M2 | Survey / R2 |
| F7 | Cadet Test Discovery & Retake Guard | Strict student test discovery by class & student ID without cross-teacher leaks; single-attempt guard / scorecard redirect. | M3 | Survey / R3 |
| F8 | Exam Flow & Timer Auto-Submit | Countdown timer, low-time alert, anti-cheating event guards, non-empty auto-submit on 0:00 timeout (stale closure fix). | M3 | Survey / R3 |
| F9 | Auto-Grading, Precision & Scorecards | 100% mathematical accuracy on marks/percentages/mastery, division-by-zero guards, teacherName resolution, CCAP seal scorecard transcript. | M3 | Survey / R3 |
| F10 | 4-Role Authentication & Slug Matching | Login matching for Teacher, Student, Admin, Dev via exact, alphanumeric clean slug, email prefix, and phone number. | M4 | Survey / R4 |
| F11 | Session Persistence & Impersonation | `cca_auth_session_v2` persistence across page reloads, clean logout, profile switching. | M4 | Survey / R4 |
| F12 | Realtime Multi-Tab Sync (BroadcastChannel) | BroadcastChannel (`cca_live_sync_v2`) event dispatch on all data mutations (submissions, quizzes, students, teachers) + cross-tab listener. | M4 | Survey / R4 |
| F13 | Full Bug Patching & Hardening | Direct fix of all 7 identified bugs/glitches, TypeScript cleanliness, CSS/styling fixes, regression prevention. | M5 | Survey / R5 |
| F14 | Comprehensive E2E Testing & Tier 5 Adversarial Hardening | 100% pass on Tiers 1-4 test suite + white-box adversarial edge-case stress testing (Tier 5). | M6 | Survey / R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Setup test infrastructure (Vitest + Testing Library + Playwright/mock harness), author Tiers 1-4 test suites, publish `TEST_READY.md`. | none | IN_PROGRESS |
| M1 | Faculty Hierarchy, Quota & Data Isolation | Harden lifetime quota logic, fix profile edit quota reset, enforce strict multi-tenant isolation in queries/filtering. | none | PLANNED |
| M2 | Quiz Lifecycle & Examination Publishing Engine | Fix unassigned draft bank visibility, dual-timer state engine, "To Bank" unassign, cloning with fresh schedule. | M1 | PLANNED |
| M3 | Cadet Examination Flow, Anti-Cheating & Auto-Grading | Fix timer auto-submit stale closure, add anti-cheating browser guards, fix `teacherName` on submission, harden scoring math. | M2 | PLANNED |
| M4 | Authentication, Identifier Matching & Realtime Multi-Tab Sync | Expand `notifyLiveSync` across all storage mutations, harden multi-role identifier matching and session persistence. | M3 | PLANNED |
| M5 | Bug Patching & Code Hardening Integration | Integrate all patches, run full build/typecheck, verify no regressions across entire UI and data flow. | M4 | PLANNED |
| M6 | Final Verification & Adversarial Coverage Hardening | Run 100% of E2E test suites (Tiers 1-4), execute Tier 5 Challenger-driven adversarial hardening loop. | E2E, M5 | PLANNED |

## Interface Contracts
### `src/utils/storage.ts`
- `notifyLiveSync()`: Must be called in ALL mutation functions: `saveStudents`, `saveQuizzes`, `saveSubmissions`, `saveTeachers`, `saveAdmins`, `saveDevelopers`, `resetDatabaseToDefaults`, `importFullDatabaseJSON`.
- `submitQuiz(data)`: Must accept and persist accurate `teacherId` and `teacherName` from the quiz object.
- `Teacher`: `lifetimeClassesCreated` must never decrease upon class deletion or teacher profile editing.

### `src/components/TakeAssessmentModal.tsx`
- Auto-submit on 0:00 must use `answersRef` to ensure cadet's current selected answers are preserved and passed to `onSubmit`.

### `src/components/StudentPortal.tsx`
- Quiz discovery must verify that the student belongs to the same teacher/cohort that created the quiz when matching by class name.

## Code Layout
- `src/types.ts`: Core interfaces, models, and helper functions (`getQuizPublishState`).
- `src/utils/storage.ts`: Persistence engine, localStorage operations, BroadcastChannel notifications, seed datasets.
- `src/components/Login.tsx`: Multi-role login screen and identifier matching logic.
- `src/components/TeacherDashboard.tsx`: Faculty dashboard, class management, quota display, active quizzes, quiz bank.
- `src/components/StudentPortal.tsx`: Cadet portal, live test discovery, scorecards, performance metrics.
- `src/components/AdminDashboard.tsx`: Academy Administrator portal, faculty oversight, quota allocation.
- `src/components/DeveloperModal.tsx` & `ManageProfileModal.tsx`: Master developer tools, raw data inspection.
- `src/components/CreateAssessmentModal.tsx`: Test creation wizard, dual timers, draft management.
- `src/components/TakeAssessmentModal.tsx`: Timed examination interface, question navigation, auto-submission.
- `src/components/ResultModal.tsx`: Official CCAP scorecard transcript, seal, question breakdown, explanations.
- `src/App.tsx`: Root controller, routing, session lifecycle, BroadcastChannel and storage listeners.
- `tests/`: Automated test suites across Tiers 1-5.
