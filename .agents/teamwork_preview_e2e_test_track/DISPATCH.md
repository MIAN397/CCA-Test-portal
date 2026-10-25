## 2026-08-28T10:46:05Z
You are the E2E Test Suite Creator for CCAP Assessment Portal.

Your Working Directory: /Users/miantuahaafzal/Documents/Test system/.agents/teamwork_preview_e2e_test_track
Project Directory: /Users/miantuahaafzal/Documents/Test system
User Request File: /Users/miantuahaafzal/Documents/Test system/.agents/ORIGINAL_REQUEST.md
Project Scope Document: /Users/miantuahaafzal/Documents/Test system/PROJECT.md
Parent Orchestrator ID: 56e8f97d-1cc3-4a52-b707-80e751ce15c8

Scope & Assigned Task:
1. Read /Users/miantuahaafzal/Documents/Test system/.agents/ORIGINAL_REQUEST.md and /Users/miantuahaafzal/Documents/Test system/PROJECT.md.
2. Read the Survey Handoff reports:
   - /Users/miantuahaafzal/Documents/Test system/.agents/teamwork_preview_explorer_survey_1/handoff.md
   - /Users/miantuahaafzal/Documents/Test system/.agents/teamwork_preview_explorer_survey_2/handoff.md
   - /Users/miantuahaafzal/Documents/Test system/.agents/teamwork_preview_explorer_survey_3/handoff.md
3. Set up the automated testing environment:
   - Install test packages (e.g. `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom fake-indexeddb` or ensure Vitest with JSDOM environment runs).
   - Create `vitest.config.ts` if needed.
   - Add `"test": "vitest run"` script to `package.json`.
4. Create comprehensive automated test suites covering Tiers 1-4 per the 4-tier methodology:
   - **Tier 1 (Feature Coverage, >=5 per feature)**:
     - `tests/unit/quota.test.ts`: Lifetime class quota calculation, deletion invariant, admin adjustment.
     - `tests/unit/timers.test.ts`: `getQuizPublishState` (draft, scheduled, active, expired, always active), duration conversions.
     - `tests/unit/scoring.test.ts`: Points sum, percentage rounding, pass/fail threshold, zero marks guard, distinction classifications.
     - `tests/unit/auth-matching.test.ts`: Identifier matching across all 4 roles (exact, clean slugs, email prefixes, phone numbers).
     - `tests/unit/isolation.test.ts`: Multi-tenant filtering predicates for teachers, students, submissions.
   - **Tier 2 (Boundary & Corner Cases, >=5 per feature)**:
     - `tests/unit/boundaries.test.ts`: 0 marks, 0 duration, empty strings, 180 min custom timer, 0:00 auto-submit timer countdown, max quota reached, special characters in names/slugs, edge publish time boundaries.
   - **Tier 3 (Cross-Feature Combinations & State Machine)**:
     - `tests/integration/quiz-lifecycle.test.ts`: Draft authoring ➔ Quiz Bank ➔ Publishing with dual timers ➔ Student discovery ➔ "To Bank" unassign ➔ Immediate removal from student desks ➔ Bank re-allotment clone.
     - `tests/integration/exam-flow.test.ts`: Cadet test launch ➔ Answer selection ➔ Timer auto-submit (verifying non-empty answers submitted) ➔ Instant grading & scorecard generation ➔ Retake prevention.
     - `tests/integration/multi-tab-sync.test.ts`: BroadcastChannel message dispatching on all mutation operations (`saveSubmissions`, `saveQuizzes`, `saveStudents`, `saveTeachers`, etc.).
   - **Tier 4 (Real-World Application Scenarios)**:
     - `tests/e2e/ccap-scenarios.test.ts`:
       1. Scenario 1: Academy Admin recruits faculty, sets quota, faculty creates multi-subject class and enrolls cadet.
       2. Scenario 2: Teacher authors draft in Quiz Bank, publishes to Class 8 with 24h window, Cadet logs in, takes exam, scores 90%+ (Distinction), scorecard verified.
       3. Scenario 3: Teacher unassigns live test to Bank; Cadet immediately loses live access; Teacher clones from Bank with fresh schedule and re-assigns.
       4. Scenario 4: Cadet exam reaches 0:00 timeout; auto-submit preserves cadet answers and computes scorecard accurately.
       5. Scenario 5: Cross-tab realtime synchronization between Teacher Analytics tab and Cadet Examination tab.
5. Create `TEST_INFRA.md` and `TEST_READY.md` summarizing the runner command, coverage matrix, and test tier breakdown.
6. Run the test suite (`npm test` or `npx vitest run`) and report the test execution results in `/Users/miantuahaafzal/Documents/Test system/.agents/teamwork_preview_e2e_test_track/handoff.md`.
7. Send completion message back to parent orchestrator.
