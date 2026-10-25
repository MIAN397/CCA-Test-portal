# Original User Request

## Initial Request — 2026-08-28T10:40:47Z

Conduct comprehensive end-to-end testing, validation, edge-case analysis, and code hardening for the Cadets Coaching Academy (CCAP) Assessment Portal — a multi-tenant SaaS platform where teachers create classes, manage isolated cadet cohorts, author timed tests, manage quiz banks, and conduct secure, legitimate examinations. Empowered to directly modify and patch any discovered bugs or edge cases.

Working directory: /Users/miantuahaafzal/Documents/Test system
Integrity mode: development

## Requirements

### R1. Faculty Hierarchy, Quota & Data Isolation Testing
Verify teacher profile management, lifetime class quotas (preventing unauthorized excess creation), multi-subject assignment configurations, and cadet enrollment. Rigorously test multi-tenant isolation to ensure no teacher can view, modify, or leak other teachers' students, classes, or submission history.

### R2. Quiz Lifecycle & Examination Publishing Engine
Test the complete test lifecycle across all states:
- Creating quizzes from scratch and storing as Drafts.
- Storing master question papers in the Quiz Bank.
- Assigning tests to specific classes/students with dual timers (test-taking duration & live availability window).
- Verifying that Drafts remain exclusively in the Quiz Bank and NEVER appear in the Active Quizzes tab or Student Portal.
- Moving active tests back to the Quiz Bank ("To Bank" unassign action) and re-allocating them with fresh schedules.

### R3. Cadet Examination Flow, Anti-Cheating & Auto-Grading
Verify the complete cadet test-taking experience:
- Live test discovery filtered strictly by assigned class/student.
- Timer countdown and auto-submission on timer expiration.
- Instant score computation, pass/fail grading, and detailed question breakdown with explanations.
- Submission persistence in student scorecards and teacher analytics desks.

### R4. Authentication, Identifier Matching & Realtime Multi-Tab Sync
Verify authentication across all 4 roles (Teacher, Student, Admin, Developer). Test resilient identifier resolution (login ID, email, name, phone, clean slugs) and realtime cross-tab synchronization via BroadcastChannel.

### R5. Bug Patching & Hardening
Directly fix and patch any detected regressions, styling flaws, or state mismatches in the codebase to ensure 100% production readiness.

## Acceptance Criteria

### Security & Data Isolation
- [ ] Teachers have zero access to students, classes, quizzes, or submissions outside their assigned cohort.
- [ ] Students can only view and take tests actively allotted to their class or specific student ID.

### Assessment Lifecycle
- [ ] Active Quizzes tab displays ONLY currently live or scheduled tests with active countdown badges.
- [ ] Drafts and unassigned test repositories remain exclusively inside the Quiz Bank.
- [ ] Unassigning an active test safely returns it to the Quiz Bank and immediately removes it from student examination desks.

### Examination & Grading Accuracy
- [ ] Timers count down accurately and automatically trigger test submission upon reaching 0:00.
- [ ] Marks, percentages, and subject mastery calculate with 100% mathematical precision.

### Session & Sync Reliability
- [ ] User sessions persist across page refreshes and browser re-opens until explicit logout.
- [ ] Cross-tab actions (publishing, enrolling, submitting) propagate in real time without requiring manual page reload.
