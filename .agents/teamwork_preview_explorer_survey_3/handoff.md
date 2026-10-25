# Handoff Report — Explorer 3: Build System, Test Infrastructure & Bug Survey

## 1. Observation

### 1.1 Project Tooling, Build System & Environment
- **Project Structure**: Vite + React 19 SPA with TypeScript 5.7.3 (`package.json`, `vite.config.ts`, `tsconfig.json`).
- **Dependencies**:
  - `react`: `^19.0.0`
  - `react-dom`: `^19.0.0`
  - `lucide-react`: `^1.16.0`
  - `vite`: `^6.1.0`
  - `typescript`: `^5.7.3`
- **Initial Build State**:
  - Command: `npm run build` initially failed with code 127: `sh: tsc: command not found` due to temporary symlink naming artifacts in `node_modules/.bin/` (`.tsc-tsDAvwpb`).
  - Running `npm rebuild` restored valid symlinks (`tsc`, `vite`), after which `npm run build` succeeded in 1.10s without TypeScript compiler errors (`dist/index.html` 0.88 kB, `dist/assets/index-DVWaoxQn.js` 382.49 kB).
- **Existing Test Setup**:
  - `find_by_name` across the entire workspace identified **0 test files** (`*.test.*` and `*.spec.*` returned 0 results).
  - `package.json` contains no `"test"` script and no test runner (`vitest`, `jest`, `@testing-library/react`, `playwright`, etc.) is declared in `dependencies` or `devDependencies`.

---

### 1.2 Discovered Bugs & Logic Flaws

#### Bug 1 [CRITICAL]: Timer Auto-Submit Stale Closure Submits Empty Answers
- **File & Lines**: `src/components/TakeAssessmentModal.tsx:28-43, 60-66`
- **Verbatim Code**:
  ```tsx
  // lines 28-43
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, quiz]);

  // lines 60-66
  const handleAutoSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const sub = onSubmit(quiz, student, answers, timeSpent);
    onTestCompleted(sub);
  };
  ```
- **Observed Behavior**: `useEffect` depends only on `[isOpen, quiz]`. When the interval timer ticks down to 0 and invokes `handleAutoSubmit()`, the callback captures the initial render closure where `answers` is `{}`. All answers selected by the cadet during the timed exam are lost on timeout, resulting in a 0 score and automatic failure.

---

#### Bug 2 [CRITICAL]: Incomplete Real-Time BroadcastChannel Cross-Tab Synchronization
- **File & Lines**: `src/utils/storage.ts:742-756, 979-1009, 676-679, 582-585, 623-626`
- **Verbatim Code**:
  ```tsx
  // lines 742-756
  const notifyLiveSync = () => {
    try {
      const channel = new BroadcastChannel('cca_live_sync_v2');
      channel.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
      channel.close();
    } catch (e) {
      // BroadcastChannel unsupported fallback
    }
  };

  export const saveStudents = (students: Student[]): void => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    notifyLiveSync();
  };
  ```
- **Observed Behavior**: `notifyLiveSync()` is ONLY called inside `saveStudents` and `saveQuizzes`. It is omitted from `saveSubmissions` (`submitQuiz`), `saveTeachers` (`recruitTeacher`, `updateTeacher`, `deleteTeacher`), `saveAdmins`, and `saveDevelopers`. When a cadet submits an exam in Tab A, a teacher viewing Submissions / Analytics in Tab B does not receive the update until manual reload.

---

#### Bug 3 [HIGH]: Hardcoded `"Faculty Instructor"` in `submitQuiz`
- **File & Lines**: `src/utils/storage.ts:983-1009`, `src/App.tsx:405-420`
- **Verbatim Code**:
  ```tsx
  // storage.ts lines 998-1003
  const newSubmission: Submission = {
    id: `sub-${data.studentId}-${data.quizId}-${Date.now()}`,
    ...data,
    teacherName: 'Faculty Instructor', // HARDCODED
    submittedAt: new Date().toISOString(),
  };
  ```
- **Observed Behavior**: All submission records and transcripts display the generic string `"Faculty Instructor"` instead of the actual assigning teacher's name (e.g., `"Sir Asad Mahmood"`, `"Capt. Tariq Rehman"`).

---

#### Bug 4 [HIGH]: Multi-Tenant Isolation Leak in Student Assigned Quizzes
- **File & Lines**: `src/components/StudentPortal.tsx:56-94`
- **Verbatim Code**:
  ```tsx
  // lines 71-74
  const isDirectClassMatch =
    (targetClassClean && targetClassClean === studentClassClean) ||
    (q.allocation?.targetClasses &&
      q.allocation.targetClasses.some((tc) => cleanStr(tc) === studentClassClean));

  // lines 80-86
  (cleanStr(student.enrolledByTeacherId).includes('afzal') &&
    cleanStr(q.teacherId).includes('afzal'))
  ...
  if (isDirectClassMatch) return true;
  ```
- **Observed Behavior**: Any quiz allocated by Teacher A to a class (e.g. `'Class 8 (Cadet Prep)'`) is visible to all students belonging to that class name regardless of whether they belong to Teacher A's cohort or another teacher's cohort. Lines 80-86 also rely on hardcoded `"afzal"` string matching.

---

#### Bug 5 [MEDIUM]: Orphaned / Hidden Draft Quizzes in Quiz Bank Hierarchy
- **File & Lines**: `src/components/TeacherDashboard.tsx:793-807`
- **Verbatim Code**:
  ```tsx
  {Object.entries(teacherClassesMap).map(([className, subjects]) => {
    const isExpanded = expandedClasses[className] !== false;
    const classBankQuizzes = quizBankItems.filter(
      (q) =>
        q.allocation.mode === 'all' ||
        (q.allocation.targetClasses &&
          q.allocation.targetClasses.some(
            (tc) =>
              tc.toLowerCase().replace(/[\s&]+/g, '') ===
              className.toLowerCase().replace(/[\s&]+/g, '')
          )) ||
        (q.targetClass &&
          q.targetClass.toLowerCase().replace(/[\s&]+/g, '') ===
            className.toLowerCase().replace(/[\s&]+/g, ''))
    );
  ```
- **Observed Behavior**: The Quiz Bank renders exclusively under class accordions derived from `teacher.assignments`. If a teacher saves a draft quiz before assigning target classes (`targetClasses: []`, `targetClass: undefined`), the draft increment is reflected in the badge count (`quizBankItems.length`) but never rendered in the UI list.

---

#### Bug 6 [MEDIUM]: Lifetime Class Quota Slot Reset on Teacher Profile Edit
- **File & Lines**: `src/components/RecruitTeacherModal.tsx:59`, `src/components/ManageProfileModal.tsx:110-113`
- **Verbatim Code**:
  ```tsx
  lifetimeClassesCreated:
    editingProfile?.data?.lifetimeClassesCreated ??
    (editingProfile?.data?.assignments
      ? new Set(editingProfile?.data?.assignments.map((a: any) => a.className)).size
      : 0),
  ```
- **Observed Behavior**: If a teacher previously created 4 classes, deleted 2 (leaving 2 active), editing the teacher's profile recalculates `lifetimeClassesCreated` to 2 from active assignments, erroneously refunding 2 lifetime quota slots.

---

#### Bug 7 [MEDIUM]: Percentage Division-by-Zero Risk
- **File & Lines**: `src/App.tsx:402`, `src/components/StudentPortal.tsx:100`, `src/components/TeacherDashboard.tsx:299`
- **Verbatim Code**:
  ```tsx
  const percentage = Math.round((score / quiz.totalMarks) * 100);
  ```
- **Observed Behavior**: When `quiz.totalMarks` is 0 or undefined, `NaN` / `Infinity` is stored in the submission and corrupts dashboard statistics.

---

## 2. Logic Chain

1. **Build & Runtime Verification**:
   - `package.json` specifies React 19, TypeScript 5.7.3, and Vite 6.1.0.
   - Initial build failure was caused by missing executable symlinks in `node_modules/.bin/`. Running `npm rebuild` fixed the binary paths.
   - `npm run build` now compiles cleanly without TypeScript errors, confirming the baseline build pipeline is fully functional.

2. **Automated Testing Readiness**:
   - No existing test harness exists (0 unit, 0 integration, 0 E2E tests).
   - Because the codebase is built on Vite, **Vitest** is the optimal zero-config test runner for Tiers 1-3 (Unit, Storage/Multi-tenancy, Component Integration).
   - **Playwright** (`@playwright/test`) is the optimal test framework for Tier 4 (E2E browser tests and multi-tab `BroadcastChannel` real-time sync validation).

3. **Critical Path Bug Correlation**:
   - **Auto-submission state loss (Bug 1)** directly breaks Requirement R3 ("Timer countdown and auto-submission on timer expiration... Instant score computation"). When time runs out, closure capture sends `{}` answers.
   - **Realtime sync gap (Bug 2)** directly breaks Requirement R4 ("Realtime cross-tab synchronization via BroadcastChannel"). Submissions and teacher quota changes do not broadcast events.
   - **Cohort data isolation leaks (Bug 4)** directly breaks Requirement R1 ("Ensure no teacher can view, modify, or leak other teachers' students, classes, or submission history").
   - **Quiz Bank UI omission (Bug 5)** directly breaks Requirement R2 ("Drafts remain exclusively in the Quiz Bank...").

---

## 3. Caveats

- **External Network Access**: Testing and patching must proceed within the local environment.
- **Node & Browser Compatibility**: React 19 and BroadcastChannel behavior was verified against standard Web APIs supported in Node 22 and modern Chromium/WebKit browsers.
- **No other caveats**.

---

## 4. Conclusion & Actionable Recommendations

### 4.1 Bug Patching Priorities (R5 Requirement)
1. **Priority 1 (Critical)**:
   - Patch `TakeAssessmentModal.tsx`: Use `useRef` for `answers` (`answersRef.current = answers`) inside `handleAutoSubmit` to guarantee that auto-submission on timer expiration submits all answered questions accurately.
   - Patch `storage.ts`: Add `notifyLiveSync()` to `saveSubmissions`, `saveTeachers`, `saveAdmins`, `saveDevelopers`, `resetDatabaseToDefaults`, and `importFullDatabaseJSON`.
2. **Priority 2 (High)**:
   - Patch `storage.ts` and `App.tsx`: Pass actual `teacherName` to `submitQuiz` or resolve from teacher record.
   - Patch `StudentPortal.tsx`: Enforce strict teacher cohort validation in `assignedQuizzes` and remove hardcoded `"afzal"` name matching strings.
   - Patch `TeacherDashboard.tsx`: Add an "Unassigned / General Drafts" accordion in Quiz Bank so unassigned draft quizzes are always accessible.
3. **Priority 3 (Medium/Low)**:
   - Patch `RecruitTeacherModal.tsx` & `ManageProfileModal.tsx`: Preserve `lifetimeClassesCreated` across profile edits.
   - Patch `App.tsx` and score calculators: Guard against `totalMarks <= 0` with fallback to sum of question points.

---

### 4.2 Test Suite Architecture & Implementation Roadmap (Tiers 1–4)

```
tests/
├── unit/                          # TIER 1: Pure Logic & Math
│   ├── scoring.test.ts            # Marks, percentage, pass/fail grading accuracy
│   ├── timers.test.ts             # Publish status calculation & duration countdowns
│   ├── quota.test.ts              # Lifetime class creation quota tracking
│   └── auth-matching.test.ts      # Identifier resolution (loginId, email, phone, slugs)
│
├── storage/                       # TIER 2: Storage & Multi-Tenant State Isolation
│   ├── teacher-isolation.test.ts  # Cross-teacher data boundary & cohort isolation
│   ├── quiz-lifecycle.test.ts     # Draft -> Bank -> Active -> To Bank state transitions
│   └── broadcast-sync.test.ts     # BroadcastChannel cross-tab notification events
│
├── components/                    # TIER 3: React Workflow & Modal Integration
│   ├── take-assessment.test.tsx   # Answer selection & timer auto-submit with non-empty state
│   ├── teacher-dashboard.test.tsx # Class hierarchy & Quiz Bank draft visibility
│   └── student-portal.test.tsx    # Filtered test discovery & scorecard modal review
│
└── e2e/                           # TIER 4: End-to-End Multi-Tab & Flow Validation
    └── full-exam-lifecycle.spec.ts # Full lifecycle: Teacher creates -> Cadet takes -> Instant grading -> Teacher analytics sync
```

---

## 5. Verification Method

To independently verify all observations and test readiness:

1. **Build Verification**:
   ```bash
   cd "/Users/miantuahaafzal/Documents/Test system"
   npm run build
   ```
   *Expected Output*: Vite builds `dist/` with 0 errors.

2. **Test Runner Installation & Execution**:
   ```bash
   # Install vitest & testing libraries
   npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
   # Run unit & integration test suites
   npx vitest run
   ```

3. **Stale Closure Bug Verification in `TakeAssessmentModal.tsx`**:
   - Inspect lines 28–43 in `src/components/TakeAssessmentModal.tsx`.
   - Observe that `useEffect` does not include `answers` in dependency array and `handleAutoSubmit` directly references the outer state variable without a mutable ref.
