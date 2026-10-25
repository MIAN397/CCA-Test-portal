import type {
  Quiz,
  Submission,
  UserProfile,
  SubjectPerformanceMetric,
  AcademicOverallStats,
  SubjectProgressMetric,
  CadetProgressOverview
} from '../types';

/**
 * Computes list of student emails matching the given targeting criteria from active enrolled student profiles.
 */
export const computeEligibleStudentEmails = (
  students: UserProfile[],
  assignToType: string,
  assignToValue: string,
  targetBatch: string,
  targetCategory: string,
  targetClasses: string[],
  targetSections: string[]
): string[] => {
  return students.filter(student => {
    const reg = student.registrationDetails;
    if (!reg) return false;

    if (assignToType === 'custom-target' || targetBatch || targetCategory || (targetClasses && targetClasses.length > 0) || (targetSections && targetSections.length > 0)) {
      if (targetBatch && targetBatch !== 'all' && targetBatch !== '' && reg.batch !== targetBatch) {
        return false;
      }
      if (targetCategory && targetCategory !== 'all' && targetCategory !== '' && reg.category !== targetCategory) {
        return false;
      }
      if (targetClasses && targetClasses.length > 0 && !targetClasses.includes('all')) {
        const targetClassesList = targetClasses.map(c => c.trim().toLowerCase());
        const studentSubCategory = (reg.subCategory || '').toLowerCase();
        const studentClassKey = `${reg.category}:${reg.subCategory}`.toLowerCase();
        const hasClassMatch = targetClassesList.includes(studentSubCategory) || targetClassesList.includes(studentClassKey);
        if (!hasClassMatch) return false;
      }
      if (targetSections && targetSections.length > 0 && !targetSections.includes('all')) {
        const targetSectionsList = targetSections.map(s => s.trim().toLowerCase());
        const studentSection = (reg.physicalGroup || '').toLowerCase();
        if (!targetSectionsList.includes(studentSection)) return false;
      }
      return true;
    }

    if (!assignToType || assignToType === 'all') return true;

    if (assignToType === 'batch') {
      return reg.batch === assignToValue;
    }
    if (assignToType === 'student') {
      return student.email.toLowerCase() === assignToValue.toLowerCase();
    }
    if (assignToType === 'category') {
      return reg.category === assignToValue;
    }
    if (assignToType === 'classes') {
      if (!assignToValue) return false;
      const targetClassesList = assignToValue.split(',').map(c => c.trim().toLowerCase());
      const studentSubCategory = (reg.subCategory || '').toLowerCase();
      const studentClassKey = `${reg.category}:${reg.subCategory}`.toLowerCase();
      return targetClassesList.includes(studentSubCategory) || targetClassesList.includes(studentClassKey);
    }
    if (assignToType === 'class-physical-group') {
      if (!assignToValue) return false;
      const [classKey, physicalGroup] = assignToValue.split('|');
      const classMatch = classKey.toLowerCase() === `${reg.category}:${reg.subCategory}`.toLowerCase();
      const groupMatch = physicalGroup.toLowerCase() === (reg.physicalGroup || '').toLowerCase();
      return classMatch && groupMatch;
    }
    return false;
  }).map(s => s.email.toLowerCase().trim());
};

/**
 * Evaluates whether a student is eligible for a quiz based on enrollment snapshot and target rules.
 */
export const isStudentEligibleForQuiz = (quiz: Quiz, studentProfile: UserProfile): boolean => {
  if (quiz.status === 'draft') return false;
  if (quiz.campus && quiz.campus !== studentProfile.campus) return false;
  if (quiz.isFeaturedOnHomepage || quiz.assignToType === 'free-homepage') return true;

  const studentEmail = (studentProfile.email || '').toLowerCase().trim();

  // If enrollment snapshot array exists and is non-empty, student's email MUST be present
  if (Array.isArray(quiz.assignedStudentEmails) && quiz.assignedStudentEmails.length > 0) {
    const assignedLower = quiz.assignedStudentEmails.map(e => e.toLowerCase().trim());
    return assignedLower.includes(studentEmail);
  }

  // Fallback for legacy quizzes created before snapshotting feature
  const reg = studentProfile.registrationDetails;
  if (!reg) return false;

  if (quiz.assignToType === 'custom-target' || quiz.targetBatch || quiz.targetCategory || quiz.targetClasses || quiz.targetSections) {
    if (quiz.targetBatch && quiz.targetBatch !== 'all' && reg.batch !== quiz.targetBatch) {
      return false;
    }
    if (quiz.targetCategory && quiz.targetCategory !== 'all' && reg.category !== quiz.targetCategory) {
      return false;
    }
    if (quiz.targetClasses && quiz.targetClasses !== 'all' && quiz.targetClasses !== '') {
      const targetClassesList = quiz.targetClasses.split(',').map(c => c.trim().toLowerCase());
      const studentSubCategory = (reg.subCategory || '').toLowerCase();
      const studentClassKey = `${reg.category}:${reg.subCategory}`.toLowerCase();
      const hasClassMatch = targetClassesList.includes(studentSubCategory) || targetClassesList.includes(studentClassKey);
      if (!hasClassMatch) return false;
    }
    if (quiz.targetSections && quiz.targetSections !== 'all' && quiz.targetSections !== '') {
      const targetSectionsList = quiz.targetSections.split(',').map(s => s.trim().toLowerCase());
      const studentSection = (reg.physicalGroup || '').toLowerCase();
      if (!targetSectionsList.includes(studentSection)) return false;
    }
    return true;
  }

  if (!quiz.assignToType || quiz.assignToType === 'all') return true;

  if (quiz.assignToType === 'batch') {
    return reg.batch === quiz.assignToValue;
  }
  if (quiz.assignToType === 'student') {
    return studentEmail === (quiz.assignToValue || '').toLowerCase().trim();
  }
  if (quiz.assignToType === 'category') {
    return reg.category === quiz.assignToValue;
  }
  if (quiz.assignToType === 'classes') {
    if (!quiz.assignToValue) return false;
    const targetClasses = quiz.assignToValue.split(',').map(c => c.trim().toLowerCase());
    const studentClassKey = `${reg.category}:${reg.subCategory}`.toLowerCase();
    return targetClasses.includes(studentClassKey) || targetClasses.includes((reg.subCategory || '').toLowerCase());
  }
  if (quiz.assignToType === 'class-physical-group') {
    if (!quiz.assignToValue) return false;
    const [classKey, physicalGroup] = quiz.assignToValue.split('|');
    const classMatch = classKey.toLowerCase() === `${reg.category}:${reg.subCategory}`.toLowerCase();
    const groupMatch = physicalGroup.toLowerCase() === (reg.physicalGroup || '').toLowerCase();
    return classMatch && groupMatch;
  }
  return false;
};


/**
 * Calculates academic metric breakdown for a single student across all their submitted quizzes.
 */
export const calculateStudentAcademicMetrics = (submissions: Submission[]) => {
  let totalCorrect = 0;
  let totalQuestions = 0;
  const totalQuizzesAttempted = submissions ? submissions.length : 0;

  const subjectMap: Record<string, { correct: number; total: number; quizzes: number; teacher: string }> = {};

  if (submissions && Array.isArray(submissions)) {
    submissions.forEach(sub => {
      if (!sub) return;
      const correct = sub.score || 0;
      const qCount = sub.totalQuestions || 0;
      totalCorrect += correct;
      totalQuestions += qCount;

      const subject = typeof sub.teacherSubject === 'string' && sub.teacherSubject.trim() ? sub.teacherSubject.trim() : 'General';
      const teacher = sub.teacherName || 'Academy Faculty';

      if (!subjectMap[subject]) {
        subjectMap[subject] = { correct: 0, total: 0, quizzes: 0, teacher };
      }
      subjectMap[subject].correct += correct;
      subjectMap[subject].total += qCount;
      subjectMap[subject].quizzes += 1;
    });
  }

  const overallPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const overallStats: AcademicOverallStats = {
    totalQuizzesAttempted,
    totalCorrect,
    totalQuestions,
    overallPercentage
  };

  const subjectMetrics: SubjectPerformanceMetric[] = Object.entries(subjectMap).map(([subject, data]) => {
    const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    return {
      subject,
      totalCorrect: data.correct,
      totalQuestions: data.total,
      totalQuizzesAttempted: data.quizzes,
      percentage,
      teacherName: data.teacher
    };
  });

  subjectMetrics.sort((a, b) => a.subject.localeCompare(b.subject));

  return { overallStats, subjectMetrics };
};

/**
 * Returns color, background, border, badge label and gradient fill for a given percentage score.
 */
export const getPerformanceTier = (pct: number) => {
  if (pct >= 80) {
    return {
      label: 'Excellent',
      color: 'var(--success)',
      bg: '#dcfce7',
      text: '#166534',
      border: '#bbf7d0',
      barGradient: 'linear-gradient(90deg, #10b981, #34d399)'
    };
  }
  if (pct >= 60) {
    return {
      label: 'Good Standing',
      color: 'var(--accent-gold-dark)',
      bg: '#fef9c3',
      text: '#854d0e',
      border: '#fef08a',
      barGradient: 'linear-gradient(90deg, var(--accent-gold-dark), var(--accent-gold))'
    };
  }
  return {
    label: 'Needs Improvement',
    color: 'var(--danger)',
    bg: '#fee2e2',
    text: '#991b1b',
    border: '#fecaca',
    barGradient: 'linear-gradient(90deg, #ef4444, #f87171)'
  };
};

/**
 * Calculates academic breakdown per cadet from global submissions array.
 */
export const getCadetAcademicOverview = (
  email: string,
  submissions: Submission[],
  users?: UserProfile[]
): CadetProgressOverview => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const cadetUser = users ? users.find(u => u && u.email && u.email.toLowerCase().trim() === normalizedEmail) : undefined;
  
  const targetUid = (cadetUser?.uid || '').trim();
  const targetName = (cadetUser?.displayName || '').toLowerCase().trim();
  const targetCadetNum = (cadetUser?.registrationDetails?.cadetNumber || '').toLowerCase().trim();

  const cadetSubs = (submissions || []).filter(s => {
    if (!s) return false;
    const sEmail = (s.studentEmail || '').toLowerCase().trim();
    const sUid = (s.studentUid || '').trim();
    const sName = (s.studentName || '').toLowerCase().trim();

    const emailMatch = normalizedEmail && sEmail && sEmail === normalizedEmail;
    const uidMatch = targetUid && sUid && sUid === targetUid;
    const nameMatch = targetName && sName && sName === targetName;
    const cadetNumMatch = targetCadetNum && (sEmail.includes(targetCadetNum) || sName.includes(targetCadetNum));

    return emailMatch || uidMatch || nameMatch || cadetNumMatch;
  });

  let totalCorrect = 0;
  let totalQuestions = 0;
  let sumPct = 0;
  const subjectMap: Record<string, { attempted: number; correct: number; questions: number }> = {};

  cadetSubs.forEach(sub => {
    if (!sub) return;
    const correct = sub.score || 0;
    const qCount = sub.totalQuestions || 0;
    totalCorrect += correct;
    totalQuestions += qCount;
    const pct = qCount > 0 ? Math.round((correct / qCount) * 100) : 0;
    sumPct += pct;

    const subj = typeof sub.teacherSubject === 'string' && sub.teacherSubject.trim() ? sub.teacherSubject.trim() : 'General';
    if (!subjectMap[subj]) {
      subjectMap[subj] = { attempted: 0, correct: 0, questions: 0 };
    }
    subjectMap[subj].attempted += 1;
    subjectMap[subj].correct += correct;
    subjectMap[subj].questions += qCount;
  });

  const subjectMetrics: Record<string, SubjectProgressMetric> = {};
  Object.keys(subjectMap).forEach(subj => {
    const item = subjectMap[subj];
    subjectMetrics[subj] = {
      subject: subj,
      totalAttempted: item.attempted,
      totalCorrect: item.correct,
      totalQuestions: item.questions,
      percentage: item.questions > 0 ? Math.round((item.correct / item.questions) * 100) : 0
    };
  });

  const studentName = cadetSubs[0]?.studentName || cadetUser?.displayName || 'Unknown Cadet';
  const cadetNumber = cadetUser?.registrationDetails?.cadetNumber || 'N/A';

  return {
    studentEmail: email,
    studentName,
    cadetNumber,
    totalQuizzesAttempted: cadetSubs.length,
    overallPercentage: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    scoreAverage: cadetSubs.length > 0 ? Math.round(sumPct / cadetSubs.length) : 0,
    subjectMetrics
  };
};

/**
 * Universal Fail-Safe Quiz Evaluator Engine.
 * Evaluates a student's submission against answer keys, question payloads, and fallback keying schemas.
 */
export const evaluateQuizAttempt = (
  quiz: Quiz,
  userAnswers: Record<string, any>,
  serverAnswerKey?: Record<string, any>
): { score: number; totalQuestions: number; resolvedCorrectMap: Record<string, number> } => {
  let score = 0;
  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;
  const resolvedCorrectMap: Record<string, number> = {};

  if (!questions || questions.length === 0) {
    return { score: 0, totalQuestions: 0, resolvedCorrectMap: {} };
  }

  questions.forEach((q, idx) => {
    const qObj = (q || {}) as any;
    const qIdStr = qObj.id !== undefined && qObj.id !== null ? String(qObj.id) : '';

    // Candidate key aliases for this question
    const candidateKeys = [
      qIdStr,
      String(idx),
      `q_${idx}`,
      `q${idx + 1}`,
      `question_${idx}`,
      `question_${idx + 1}`,
      qIdStr ? `q_${qIdStr}` : ''
    ].filter(Boolean);

    // 1. Resolve student's submitted answer across candidate keys
    let submittedVal: any = undefined;
    for (const key of candidateKeys) {
      if (userAnswers && userAnswers[key] !== undefined && userAnswers[key] !== null) {
        submittedVal = userAnswers[key];
        break;
      }
    }

    // 2. Resolve correct answer key across serverAnswerKey and question object properties
    let correctVal: any = undefined;

    // A. Check serverAnswerKey if provided
    if (serverAnswerKey) {
      for (const key of candidateKeys) {
        if (serverAnswerKey[key] !== undefined && serverAnswerKey[key] !== null) {
          correctVal = serverAnswerKey[key];
          break;
        }
      }
    }

    // B. Check question object properties if not resolved from serverAnswerKey
    if (correctVal === undefined || correctVal === null) {
      if (qObj.correctIndex !== undefined && qObj.correctIndex !== null) correctVal = qObj.correctIndex;
      else if (qObj.correctOptionIndex !== undefined && qObj.correctOptionIndex !== null) correctVal = qObj.correctOptionIndex;
      else if (qObj.correctOption !== undefined && qObj.correctOption !== null) correctVal = qObj.correctOption;
      else if (qObj.correctAnswer !== undefined && qObj.correctAnswer !== null) correctVal = qObj.correctAnswer;
      else if (qObj.answer !== undefined && qObj.answer !== null) correctVal = qObj.answer;
      else if (qObj.correct !== undefined && qObj.correct !== null) correctVal = qObj.correct;
    }

    // Convert correctVal to number if possible (e.g. index 0, 1, 2)
    let numericCorrectIndex: number | undefined = undefined;
    if (typeof correctVal === 'number') {
      numericCorrectIndex = correctVal;
    } else if (typeof correctVal === 'string' && /^\d+$/.test(correctVal.trim())) {
      numericCorrectIndex = parseInt(correctVal.trim(), 10);
    } else if (typeof correctVal === 'string' && Array.isArray(qObj.options)) {
      // If correctVal was stored as option text e.g. "Islamabad"
      const matchIdx = qObj.options.findIndex((opt: string) => String(opt).trim().toLowerCase() === String(correctVal).trim().toLowerCase());
      if (matchIdx !== -1) {
        numericCorrectIndex = matchIdx;
      }
    }

    if (numericCorrectIndex !== undefined && qIdStr) {
      resolvedCorrectMap[qIdStr] = numericCorrectIndex;
    }
    if (numericCorrectIndex !== undefined) {
      resolvedCorrectMap[String(idx)] = numericCorrectIndex;
    }

    // 3. Compare submitted vs correct
    if (submittedVal !== undefined && submittedVal !== null) {
      let isCorrect = false;

      // Match 1: Numeric index match
      if (numericCorrectIndex !== undefined) {
        const numSubmitted = typeof submittedVal === 'number' ? submittedVal : parseInt(String(submittedVal).trim(), 10);
        if (!isNaN(numSubmitted) && numSubmitted === numericCorrectIndex) {
          isCorrect = true;
        }
      }

      // Match 2: Text match against options array
      if (!isCorrect && Array.isArray(qObj.options)) {
        const numSubmitted = typeof submittedVal === 'number' ? submittedVal : parseInt(String(submittedVal).trim(), 10);
        if (!isNaN(numSubmitted) && qObj.options[numSubmitted] !== undefined) {
          const submittedText = String(qObj.options[numSubmitted]).trim().toLowerCase();
          const targetText = String(correctVal).trim().toLowerCase();
          if (submittedText === targetText) {
            isCorrect = true;
          }
        }

        // Case B: submittedVal is option text string matching options[numericCorrectIndex]
        if (!isCorrect && numericCorrectIndex !== undefined && qObj.options[numericCorrectIndex] !== undefined) {
          const correctOptionText = String(qObj.options[numericCorrectIndex]).trim().toLowerCase();
          const submittedText = String(submittedVal).trim().toLowerCase();
          if (correctOptionText === submittedText) {
            isCorrect = true;
          }
        }
      }

      // Match 3: Direct text equality match
      if (!isCorrect && correctVal !== undefined && correctVal !== null) {
        if (String(submittedVal).trim().toLowerCase() === String(correctVal).trim().toLowerCase()) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        score++;
      }
    }
  });

  return { score, totalQuestions, resolvedCorrectMap };
};
