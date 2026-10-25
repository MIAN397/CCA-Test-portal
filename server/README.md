# MERN Stack Online Test System — Decoupled Database Architecture

This directory provides the production-grade MERN (MongoDB, Express, React, Node.js) schema and controller architecture for the Cadets Coaching Academy Assessment Portal.

## Architectural Decoupling Matrix

| Entity | Collection | Responsibility | Key Relationships |
|---|---|---|---|
| **User** | `users` | Pure identity, Google OAuth attributes, authentication | Referenced by `enrollments.studentId` & `subscriptions.userId` |
| **Class & Subject** | `classes` | Class cohorts and subject specifications | Referenced by `enrollments.classId` |
| **Enrollment** | `enrollments` | **Decoupled N:M Junction**: connects a student to multiple classes and subjects | Compound Unique Index: `{ studentId: 1, classId: 1, subjectId: 1 }` |
| **Subscription** | `subscriptions` | Independent financial/quota ledger (vouchers, trial, monthly, annual) | Foreign key: `userId` |

## Key Guarantees
1. **Single Student Gmail, Multiple Classes & Subjects:**
   - A student (`cadet@gmail.com`) can be enrolled by Teacher 1 in *Class 8 (Cadet Prep)* and by Teacher 2 in *Military College Prep Batch*.
   - Each enrollment creates a new record in `enrollments` pointing to the single canonical `User._id`.
   - No duplicate user profiles are created.
2. **Pricing Portal Bypass (`resolveStudentAccess`):**
   - The authorization gatekeeper queries all active enrollments for the student's ID or normalized Gmail.
   - If `activeEnrollments.length > 0`, `shouldRedirectToPricing` evaluates to `false`.
   - The student lands immediately on their active examination desk with tests for all their enrolled classes.
3. **Gmail Dot Normalization:**
   - `normalizeGmail` strips dots (`.`) and plus-tags (`+tag`) for `@gmail.com` and `@googlemail.com`, ensuring `cadet.daniyal@gmail.com` and `cadetdaniyal@gmail.com` always map to the exact same database document.
