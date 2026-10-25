# CCAP Assessment Portal — Explorer 2 Survey Handoff Report
**Scope**: Quiz Lifecycle, Examination Publishing Engine, Cadet Examination Flow, Anti-Cheating & Auto-Grading Systems (R2 & R3)

---

## 1. Observation

### 1.1 Quiz Data Model & Dynamic Publish State Calculation
- **Location**: `src/types.ts:76-94`, `src/types.ts:135-174`
- **Schema & State Properties**:
  - `Quiz` holds `id`, `title`, `subject`, `targetClass`, `description`, `durationMinutes`, `passMarks`, `totalMarks`, `questions: Question[]`, `teacherId`, `teacherName`, `isInQuizBank: boolean`, `publishStatus: 'draft' | 'published'`, `publishWindow: QuizPublishWindow`, `allocation: QuizAllocation`.
  - Dynamic helper `getQuizPublishState(quiz: Quiz)` computes:
    - `publishStatus === 'draft'` ➔ `{ status: 'draft', label: 'Draft' }`
    - `publishWindow?.isAlwaysActive === true` ➔ `{ status: 'active', label: 'Always Active' }`
    - `now < startAt` ➔ `{ status: 'scheduled', label: 'Scheduled (Starts in Xh)' }`
    - `now > endAt` ➔ `{ status: 'expired', label: 'Publish Window Expired' }`
    - `startAt <= now <= endAt` ➔ `{ status: 'active', label: 'Active (Xh Ym left)', timeLeftFormatted: '...' }`

### 1.2 Authoring, Drafts & Publishing Engine
- **Location**: `src/components/CreateAssessmentModal.tsx:46-63`, `src/components/CreateAssessmentModal.tsx:267-288`, `src/components/CreateAssessmentModal.tsx:319-366`
- **Wizard Flow**:
  - **Step 1**: Assessment Title, Subject, Instructions, Dual Timers (Test duration: 10m/15m/20m/30m/45m/60m or 1-180m custom; Publish Window: 24h, 3d, 7d, always, custom datetime-local), Passing Marks (min 1, max totalMarks), Cohort Allocation (`classes`, `students`, `all`), and "Store in Persistent Quiz Bank" toggle (`isInQuizBank`, defaults to `true`).
  - **Step 2**: Question Studio — question text, 4 choices, single radio key selector, points per question (1-50, default 5), and marking notes / explanation.
  - **Step 3**: Summary review pill and question-by-question layout review.
- **Draft Mechanics**:
  - Direct "Save as Draft" button invokes `onSave` with `publishStatus: 'draft'`.
  - Exit Interception: When closing modal (`handleRequestClose`) with dirty state (title/description/questions entered), an exit modal prompts:
    - *Save as Draft (Finish Later)*
    - *Discard Changes*
    - *Keep Editing*

### 1.3 Quiz Bank & "To Bank" Unassign Mechanics
- **Location**: `src/components/TeacherDashboard.tsx:118-123`, `src/components/TeacherDashboard.tsx:772-956`, `src/components/TeacherDashboard.tsx:1072-1090`, `src/utils/storage.ts:942-962`
- **Quiz Bank Tab**:
  - Shows quizzes where `q.isInQuizBank === true`, grouped by `Class ➔ Subject ➔ Quizzes`.
  - Actions: "Assign to Class" / "Resume Draft", "Clone" (creates duplicate in Bank with `(Re-Alloted Copy)` title and fresh 72h window via `cloneQuizFromBank`), "Edit", "Delete".
- **Active Quizzes Tab**:
  - Strictly filtered: `q.publishStatus !== 'draft'` and `publishState.status === 'active' || publishState.status === 'scheduled'`.
- **"To Bank" Action (`TeacherDashboard.tsx:1072-1090`)**:
  - Button calls `onSaveQuiz({ ...quiz, publishStatus: 'draft', isInQuizBank: true })`.
  - Result: Immediately transitions quiz status to `'draft'`, removing it from the Active Quizzes tab and the Student Portal, while preserving it safely in the Quiz Bank.

### 1.4 Student Live Test Discovery & Access Control
- **Location**: `src/components/StudentPortal.tsx:56-94`, `src/components/StudentPortal.tsx:212-294`
- **Discovery Filter**:
  - Strictly excludes drafts: `if (q.publishStatus === 'draft') return false;`
  - Matches student via:
    1. Direct student ID match (`q.allocation.targetStudentIds`).
    2. Direct class match (`q.targetClass` or `q.allocation.targetClasses`).
    3. Teacher cohort link when `q.allocation.mode === 'all'`.
- **Access Guard**:
  - If `publishState.status !== 'active'`, button is disabled: `Opens Soon` (scheduled) or `Closed / Expired` (expired).
  - If previous submission exists for `student.id` + `quiz.id`, button renders `View Scorecard` and prevents retakes.
  - If active and not submitted, renders `Start Timed Exam`.

### 1.5 Examination Flow, Timer Countdown & Auto-Submit
- **Location**: `src/components/TakeAssessmentModal.tsx:28-43`, `src/components/TakeAssessmentModal.tsx:60-78`, `src/components/TakeAssessmentModal.tsx:101-192`, `src/App.tsx:373-387`
- **Lifecycle**:
  - Launch Guard: `handleStartTest` in `App.tsx` verifies no prior submission exists; if found, alerts and opens previous scorecard transcript.
  - Countdown Timer: Initialized to `quiz.durationMinutes * 60` seconds. Interval decrements every second. When `secondsRemaining <= 1`, `handleAutoSubmit()` is invoked automatically.
  - Low-time Warning: When `secondsRemaining < 60`, badge triggers `.warning` pulse state.
  - Navigation & Palette: Bottom palette buttons show numbered questions with `.answered` and `.active` indicators; Next / Previous buttons navigate through questions.
  - Manual Submission Guard: Prompts confirmation if unanswered questions remain.
  - Exit Guard: Prompts confirmation before abandoning examination.

### 1.6 Auto-Grading, Mathematical Precision & Submissions
- **Location**: `src/App.tsx:389-424`, `src/utils/storage.ts:983-1009`, `src/components/ResultModal.tsx:26-31`, `src/components/ResultModal.tsx:145-236`
- **Scoring Formula**:
  - `score = sum(q.points for q where answers[q.id] === q.correctOption)`
  - `percentage = Math.round((score / quiz.totalMarks) * 100)`
  - `passed = score >= quiz.passMarks`
  - `timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)`
- **Classifications in Scorecard**:
  - `>= 90%` ➔ `DISTINCTION (1ST CLASS)`
  - `>= 80%` ➔ `HONORS / EXCELLENT`
  - `>= 60%` ➔ `QUALIFIED / MERIT PASS`
  - `< 60%` ➔ `RETAKE RECOMMENDED`
- **Result Transcript (`ResultModal.tsx`)**:
  - Displays official CCAP seal and reference `CCAP-${submission.id.toUpperCase().slice(-8)}`.
  - Question-by-question breakdown: Correct options highlighted green (`✓ Key`), cadet's incorrect choices highlighted red (`✗ Cadet's Choice`), and marking scheme notes/explanations rendered if present.

### 1.7 Observed Code Discrepancies & Edge Cases
1. **Hardcoded Faculty Name on Submission (`src/utils/storage.ts:1001`)**:
   `submitQuiz` hardcodes `teacherName: 'Faculty Instructor'` rather than passing or preserving `quiz.teacherName` or resolving from teacher profile.
2. **Missing `notifyLiveSync()` in `saveSubmissions` (`src/utils/storage.ts:979-981`)**:
   While `saveStudents` and `saveQuizzes` broadcast via `BroadcastChannel('cca_live_sync_v2')`, `saveSubmissions` does not call `notifyLiveSync()`.
3. **Class Matching Isolation Scope in `StudentPortal.tsx:71-74, 90`**:
   `isDirectClassMatch` returns `true` before checking teacher ownership. If two different teachers create classes with identical names, students may see the other teacher's class-allotted test.
4. **Anti-Cheating Event Guards Absent**:
   `TakeAssessmentModal` does not currently implement `visibilitychange` (tab switch detection), `blur` event listeners, fullscreen requests, or copy-paste event suppression (`onCopy`, `onPaste`, `onContextMenu`).

---

## 2. Logic Chain

1. **Quiz Lifecycle Integrity (Draft ➔ Bank ➔ Published ➔ Unassigned "To Bank")**:
   - `CreateAssessmentModal` assigns `publishStatus: 'draft'` when saved as draft or when prompted upon exit.
   - `getQuizPublishState` returns `{ status: 'draft' }` whenever `publishStatus === 'draft'`.
   - `TeacherDashboard` line 120 filters: `if (q.publishStatus === 'draft') return false;` for `liveActiveQuizzes`.
   - `StudentPortal` line 57 filters: `if (q.publishStatus === 'draft') return false;` for `assignedQuizzes`.
   - *Inference*: Drafts are guaranteed never to appear in the Active Quizzes tab or Student Examination Desk.
   - When teacher clicks "To Bank" in Active Quizzes, `updateQuiz` sets `publishStatus: 'draft'` and `isInQuizBank: true`.
   - *Inference*: Unassigning an active quiz safely moves it back to Draft/Bank state, immediately removing it from live student desks while retaining master question contents for future re-allotment.

2. **Dual Timers & Dynamic Availability**:
   - `publishWindow` determines whether the test is open (`active`), upcoming (`scheduled`), or past deadline (`expired`).
   - `durationMinutes` controls in-exam countdown time (`TakeAssessmentModal`).
   - `getQuizPublishState` accurately computes remaining minutes/hours and expired state.
   - *Inference*: The dual-timer architecture decouples access window from test-taking duration.

3. **Examination & Auto-Grading Precision**:
   - Scoring sums points of matching questions against total points.
   - Percentage is computed as integer percentage via `Math.round((score / totalMarks) * 100)`.
   - Pass threshold is verified inclusively (`score >= passMarks`).
   - *Inference*: Mathematical evaluation is accurate and deterministic across all question weights.

---

## 3. Caveats

1. **Anti-Cheating Scope**:
   - The current codebase enforces single-attempt locks, 0:00 timer auto-submits, and exit confirmations, but client-side browser events (tab-blur tracking, fullscreen enforcement, clipboard blocking) are not yet implemented in `TakeAssessmentModal.tsx`.
2. **Persistence Boundary**:
   - Storage is client-side in `localStorage` with BroadcastChannel live synchronization across browser tabs/windows.

---

## 4. Conclusion

The Quiz Lifecycle and Examination Engine (R2 & R3) architecture is well-structured with clear state boundaries:
- **Draft vs Published vs Bank separation** is strictly enforced in rendering filters.
- **"To Bank" unassign** cleanly revokes active test access without data loss.
- **Auto-grading and scoring** calculate points, percentages, pass/fail status, and question-level breakdowns with mathematical accuracy.
- **Cadet test discovery** effectively filters by class and direct student allotment.
- **3 concrete hardening recommendations** identified for implementation:
  1. Fix `teacherName` in `submitQuiz` to use `quiz.teacherName`.
  2. Add `notifyLiveSync()` call inside `saveSubmissions`.
  3. Introduce tab-switch monitoring (`visibilitychange`) and copy-paste guards in `TakeAssessmentModal`.

---

## 5. Verification Method

To independently verify all findings:
1. **Compilation Check**:
   ```bash
   npm run build
   ```
2. **Trace Code Locations**:
   - Quiz states & helper: Inspect `src/types.ts:76-174`.
   - Creation wizard & draft prompt: Inspect `src/components/CreateAssessmentModal.tsx:46-147, 267-366`.
   - Quiz Bank & "To Bank" unassign: Inspect `src/components/TeacherDashboard.tsx:118-123, 772-956, 1072-1090`.
   - Student filtering & locking: Inspect `src/components/StudentPortal.tsx:56-94, 212-294`.
   - Examination countdown & auto-submit: Inspect `src/components/TakeAssessmentModal.tsx:28-78`.
   - Scoring computation & persistence: Inspect `src/App.tsx:389-424` and `src/utils/storage.ts:983-1009`.
   - Official Certificate & Question Breakdown: Inspect `src/components/ResultModal.tsx:26-236`.
