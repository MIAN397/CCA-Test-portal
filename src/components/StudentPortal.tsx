import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Quiz, Submission, Teacher, getQuizPublishState } from '../types';
import {
  BookOpen,
  CheckCircle,
  Award,
  Clock,
  HelpCircle,
  Eye,
  PlayCircle,
  Calendar,
  Lock,
  BarChart3,
  FileCheck,
  ShieldAlert,
  AlertTriangle,
  Star,
} from 'lucide-react';

import { CumulativeReportModal } from './CumulativeReportModal';

interface StudentPortalProps {
  student: Student | null;
  quizzes: Quiz[];
  submissions: Submission[];
  teachers?: Teacher[];
  onStartTest: (quiz: Quiz) => void;
  onViewResult: (submission: Submission) => void;
  activeMobileTab?: string;
  onMobileTabChange?: (tab: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  quizzes,
  submissions,
  teachers,
  onStartTest,
  onViewResult,
  activeMobileTab = 'active_tests',
  onMobileTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'active_tests' | 'mastery' | 'history'>('active_tests');
  const [isCumulativeReportOpen, setIsCumulativeReportOpen] = useState(false);
  const currentTab = onMobileTabChange ? activeMobileTab : internalTab;
  const setTab = onMobileTabChange ? onMobileTabChange : setInternalTab;

  if (!student) {
    return (
      <div className="empty-state">
        <BookOpen className="empty-icon" />
        <h3>No Student Profile Selected</h3>
        <p>Please select an enrolled student from the navigation bar.</p>
      </div>
    );
  }

  // Helper to normalize strings for comparison (removes spaces, symbols, case)
  const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Extract all active enrollments for this student (fallback to legacy single className)
  const activeEnrollments =
    student.enrolledClasses && student.enrolledClasses.length > 0
      ? student.enrolledClasses.filter((e) => e.status === 'active')
      : student.className
      ? [
          {
            enrollmentId: 'legacy',
            className: student.className,
            enrolledByTeacherId: student.enrolledByTeacherId || '',
            status: 'active' as const,
            enrolledAt: student.enrolledAt,
          },
        ]
      : [];

  // Filter quizzes matching this student's allocation across ALL active enrolled classes
  const assignedQuizzes = quizzes.filter((q) => {
    if (q.publishStatus === 'draft') return false;

    // Direct student ID match
    const isDirectStudentMatch =
      q.allocation?.targetStudentIds &&
      (q.allocation.targetStudentIds.includes(student.id) ||
        q.allocation.targetStudentIds.includes(student.loginId));

    if (isDirectStudentMatch) return true;

    const targetClassClean = cleanStr(q.targetClass);

    // Check if the quiz matches ANY of the student's active enrolled classes
    const matchesAnyEnrollment = activeEnrollments.some((enr) => {
      const enrClassClean = cleanStr(enr.className);

      // Verify student's enrollment belongs to the teacher who authored the quiz or teaches this class
      const isTeacherCohortMatch =
        !enr.enrolledByTeacherId ||
        enr.enrolledByTeacherId.toUpperCase() === 'TEACHER' ||
        enr.enrolledByTeacherId === q.teacherId ||
        enr.enrolledByTeacherId.toLowerCase() === q.teacherId?.toLowerCase() ||
        (teachers &&
          teachers.some(
            (t) =>
              (t.id === q.teacherId || t.loginId.toLowerCase() === q.teacherId?.toLowerCase()) &&
              (t.assignments.some((a) => cleanStr(a.className) === enrClassClean) ||
                t.id === enr.enrolledByTeacherId ||
                t.loginId.toLowerCase() === enr.enrolledByTeacherId?.toLowerCase())
          ));

      if (!isTeacherCohortMatch) return false;

      // Direct class match within teacher cohort
      const isDirectClassMatch =
        (targetClassClean && targetClassClean === enrClassClean) ||
        (q.allocation?.targetClasses &&
          q.allocation.targetClasses.some((tc) => cleanStr(tc) === enrClassClean));

      return isDirectClassMatch || q.allocation?.mode === 'all';
    });

    return matchesAnyEnrollment;
  });

  // Submissions for this student
  const studentSubmissions = submissions.filter((s) => s.studentId === student.id);
  const completedCount = studentSubmissions.length;
  const averagePercentage =
    completedCount > 0
      ? Math.round(
          studentSubmissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / completedCount
        )
      : 0;

  // Student Academic Honor & Standing Calculation
  const getStudentRank = () => {
    if (completedCount >= 3 && averagePercentage >= 85) {
      return { title: 'High Academic Distinction', color: '#d4af37', bg: '#fbf7ec' };
    }
    if (completedCount >= 2 && averagePercentage >= 75) {
      return { title: 'Honors Standing', color: '#163826', bg: '#ecf8f1' };
    }
    if (completedCount >= 1 && averagePercentage >= 60) {
      return { title: 'Merit Standing', color: '#1d4ed8', bg: '#eff6ff' };
    }
    return { title: 'Active Student', color: '#64748b', bg: '#f1f5f9' };
  };
  const studentRank = getStudentRank();

  // Subject-wise accuracy metrics
  const subjectProgress: Record<string, { total: number; sumPercent: number }> = {};
  studentSubmissions.forEach((sub) => {
    if (!subjectProgress[sub.subject]) {
      subjectProgress[sub.subject] = { total: 0, sumPercent: 0 };
    }
    subjectProgress[sub.subject].total += 1;
    subjectProgress[sub.subject].sumPercent += sub.percentage || 0;
  });

  // Dynamic Tab Header & Stats Data per active tab
  const getTabContext = () => {
    switch (currentTab) {
      case 'mastery':
        return {
          badgeText: studentRank.title,
          badgeColor: studentRank.color,
          badgeBg: studentRank.bg,
          badgeIcon: Star,
          subBadge: `Top Score: ${Math.max(0, ...studentSubmissions.map((s) => s.percentage || 0))}%`,
          title: `ACADEMIC MASTERY & ACCURACY — ${student.name.toUpperCase()}`,
          subtitle: `Class: ${student.className} • Real-time Subject Performance Tracking`,
          stats: [
            { icon: Award, color: 'gold', count: `${averagePercentage}%`, label: 'Overall Accuracy' },
            { icon: BarChart3, color: 'blue', count: Object.keys(subjectProgress).length, label: 'Subjects Tracked' },
            { icon: CheckCircle, color: 'green', count: completedCount, label: 'Completed Tests' },
          ],
        };
      case 'history':
        return {
          badgeText: 'Official Scorecards',
          badgeColor: '#15803d',
          badgeBg: '#ecfdf5',
          badgeIcon: FileCheck,
          subBadge: `Pass Rate: ${averagePercentage >= 50 ? 'Passing Standing' : 'Review Standing'}`,
          title: `SCORECARDS & CERTIFICATES — ${student.name.toUpperCase()}`,
          subtitle: `Class: ${student.className} • Official Verified Examination Records`,
          stats: [
            { icon: FileCheck, color: 'blue', count: studentSubmissions.length, label: 'Total Scorecards' },
            { icon: CheckCircle, color: 'green', count: studentSubmissions.filter((s) => s.passed).length, label: 'Passed Tests' },
            { icon: Award, color: 'gold', count: `${averagePercentage}%`, label: 'Average Score' },
          ],
        };
      case 'active_tests':
      default:
        return {
          badgeText: studentRank.title,
          badgeColor: studentRank.color,
          badgeBg: studentRank.bg,
          badgeIcon: Star,
          subBadge: `Study Progress: ${completedCount} Test(s) Done`,
          title: `STUDENT EXAMINATION DESK — ${student.name.toUpperCase()}`,
          subtitle: `Student Name: ${student.name} • Class: ${student.className}`,
          stats: [
            { icon: BookOpen, color: 'blue', count: assignedQuizzes.length, label: 'Assigned Quizzes' },
            { icon: Clock, color: 'gold', count: Math.max(0, assignedQuizzes.length - completedCount), label: 'Pending Tests' },
            { icon: CheckCircle, color: 'green', count: completedCount, label: 'Completed Tests' },
          ],
        };
    }
  };

  const tabContext = getTabContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* KPI Stats Grid (Dynamic Per Tab) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`stats-${currentTab}`}
          className="stats-grid"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tabContext.stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={idx}
                className={`stat-card ${stat.color}`}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <div className={`stat-icon ${stat.color}`}>
                  <StatIcon size={22} />
                </div>
                <div className="stat-info">
                  <h3>{stat.count}</h3>
                  <p>{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Desktop/Tablet Tab Header */}
      <div className="tabs-header">
        <button
          className={`tab-button ${currentTab === 'active_tests' ? 'active' : ''}`}
          onClick={() => setTab('active_tests')}
        >
          <BookOpen size={18} />
          <span>Assigned Tests</span>
          <span className="tab-badge">{assignedQuizzes.length}</span>
        </button>

        <button
          className={`tab-button ${currentTab === 'mastery' ? 'active' : ''}`}
          onClick={() => setTab('mastery')}
        >
          <BarChart3 size={18} />
          <span>Subject Mastery</span>
        </button>

        <button
          className={`tab-button ${currentTab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          <FileCheck size={18} />
          <span>Completed Scorecards</span>
          <span className="tab-badge">{studentSubmissions.length}</span>
        </button>
      </div>

      {/* TAB CONTENT WITH MOTION */}
      <AnimatePresence mode="wait">
        {/* TAB 1: Assigned Tests */}
        {currentTab === 'active_tests' && (
          <motion.div
            key="active_tests"
            className="content-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card-header-flex">
              <div className="card-title-group">
                <h2>Assigned Examination Tests</h2>
                <p>Check the publishing availability window and launch your proctored timed test</p>
              </div>
            </div>

            {assignedQuizzes.length === 0 ? (
              <div className="empty-state">
                <BookOpen className="empty-icon" />
                <h3>No Quizzes Assigned</h3>
                <p>Your instructors have not published any tests for your class cohort yet.</p>
              </div>
            ) : (
              <div className="assessment-grid">
                {assignedQuizzes.map((quiz, idx) => {
                  const publishState = getQuizPublishState(quiz);
                  const previousSub = studentSubmissions.find((s) => s.quizId === quiz.id);
                  const isLocked = publishState.status !== 'active';

                  return (
                    <motion.div
                      key={quiz.id}
                      className="assessment-card"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <div>
                        <div className="assessment-card-header">
                          <span className="badge badge-gold">{quiz.subject}</span>
                          <span
                            className={`badge ${
                              publishState.status === 'active'
                                ? 'badge-timer-active'
                                : publishState.status === 'scheduled'
                                ? 'badge-timer-scheduled'
                                : 'badge-timer-expired'
                            }`}
                          >
                            <Calendar size={12} />
                            <span>{publishState.label}</span>
                          </span>
                        </div>

                        <div className="assessment-card-title">{quiz.title}</div>
                        <div className="assessment-card-desc">
                          {quiz.description || 'Complete this test before the examination deadline.'}
                        </div>

                        <div className="assessment-meta-list">
                          <div className="assessment-meta-item">
                            <Clock size={14} />
                            <span>{quiz.durationMinutes} Mins Duration</span>
                          </div>
                          <div className="assessment-meta-item">
                            <HelpCircle size={14} />
                            <span>{quiz.questions.length} Questions</span>
                          </div>
                          <div className="assessment-meta-item">
                            <Award size={14} />
                            <span>{quiz.totalMarks} Marks</span>
                          </div>
                        </div>
                      </div>

                      <div className="assessment-card-footer">
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Faculty: <strong>{quiz.teacherName}</strong>
                        </div>

                        {previousSub ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                            <span
                              className={`badge ${previousSub.passed ? 'badge-green' : 'badge-red'}`}
                              style={{ fontSize: '0.74rem' }}
                            >
                              Submitted: {previousSub.percentage}% ({previousSub.passed ? 'Passed' : 'Needs Work'})
                            </span>
                            <motion.button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => onViewResult(previousSub)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Eye size={14} />
                              <span>View Scorecard</span>
                            </motion.button>
                          </div>
                        ) : isLocked ? (
                          <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                            <Lock size={14} />
                            <span>{publishState.status === 'scheduled' ? 'Opens Soon' : 'Closed / Expired'}</span>
                          </button>
                        ) : (
                          <motion.button
                            className="btn btn-primary"
                            onClick={() => onStartTest(quiz)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <PlayCircle size={16} />
                            <span>Start Timed Exam</span>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: Subject Mastery */}
        {currentTab === 'mastery' && (
          <motion.div
            key="mastery"
            className="content-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card-header-flex">
              <div className="card-title-group">
                <h2>My Subject-Wise Academic Mastery</h2>
                <p>Performance breakdown across individual intelligence, science, and academic disciplines</p>
              </div>
            </div>

            {Object.keys(subjectProgress).length === 0 ? (
              <div className="empty-state">
                <BarChart3 className="empty-icon" />
                <h3>No Subject Data Yet</h3>
                <p>Complete assigned examination papers to view your subject accuracy analytics.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {Object.entries(subjectProgress).map(([subj, data]) => {
                  const avg = data.total > 0 ? Math.round(data.sumPercent / data.total) : 0;
                  let color = 'green';
                  if (avg < 50) color = 'red';
                  else if (avg < 75) color = 'gold';

                  return (
                    <motion.div
                      key={subj}
                      style={{
                        background: '#ffffff',
                        padding: '1.25rem',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                      whileHover={{ y: -2 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                        <strong>{subj}</strong>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>{avg}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className={`progress-fill ${color}`} style={{ width: `${avg}%` }} />
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{data.total} test(s) completed</span>
                        <span style={{ fontWeight: 700, color: avg >= 60 ? '#15803d' : '#b91c1c' }}>
                          {avg >= 85 ? 'Distinction' : avg >= 60 ? 'Mastery' : 'Needs Review'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: Completed Scorecards History */}
        {currentTab === 'history' && (
          <motion.div
            key="history"
            className="content-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card-header-flex">
              <div className="card-title-group">
                <h2>My Test History & Performance Transcripts</h2>
                <p>Review past scorecards, proctoring audits, and marking explanations</p>
              </div>

              {studentSubmissions.length > 0 && (
                <motion.button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => setIsCumulativeReportOpen(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FileCheck size={15} />
                  <span>View Progress Transcript</span>
                </motion.button>
              )}
            </div>

            {studentSubmissions.length === 0 ? (
              <div className="empty-state">
                <Award className="empty-icon" />
                <h3>No Tests Completed Yet</h3>
                <p>When you complete tests, your official certificates and performance scorecards will appear here.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="table-container desktop-table-view">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Test Title</th>
                        <th>Subject</th>
                        <th>Score / Total</th>
                        <th>Percentage</th>
                        <th>Status</th>
                        <th>Integrity Audit</th>
                        <th>Time Taken</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Transcript</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentSubmissions.map((sub) => (
                        <tr key={sub.id}>
                          <td>
                            <strong>{sub.quizTitle}</strong>
                          </td>
                          <td>
                            <span className="badge badge-purple">{sub.subject}</span>
                          </td>
                          <td>
                            <strong className="font-mono">
                              {sub.score} / {sub.totalMarks}
                            </strong>
                          </td>
                          <td>
                            <span className="font-mono" style={{ fontWeight: 800, color: sub.passed ? '#15803d' : '#b91c1c' }}>
                              {sub.percentage}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${sub.passed ? 'badge-green' : 'badge-red'}`}>
                              {sub.passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                          <td>
                            {sub.integrityAudit?.isDisqualified ? (
                              <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ShieldAlert size={12} />
                                <span>Disqualified</span>
                              </span>
                            ) : sub.integrityAudit && (sub.integrityAudit.tabSwitches > 0 || sub.integrityAudit.copyAttempts > 0) ? (
                              <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fef3c7', color: '#b45309' }}>
                                <AlertTriangle size={12} />
                                <span>Flagged ({sub.integrityAudit.tabSwitches} Switches)</span>
                              </span>
                            ) : (
                              <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle size={12} />
                                <span>Proctored & Clean</span>
                              </span>
                            )}
                          </td>
                          <td className="font-mono">{Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s</td>
                          <td style={{ color: '#64748b', fontSize: '0.78rem' }}>
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onViewResult(sub)}
                            >
                              <Eye size={14} />
                              <span>Transcript</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Native Scorecard List */}
                <div className="mobile-card-list">
                  {studentSubmissions.map((sub) => (
                    <div key={sub.id} className="mobile-record-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                            {sub.quizTitle}
                          </div>
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                            {sub.subject}
                          </span>
                        </div>
                        <span className={`badge ${sub.passed ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.78rem' }}>
                          {sub.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>

                      <div style={{ margin: '0.35rem 0' }}>
                        {sub.integrityAudit?.isDisqualified ? (
                          <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem' }}>
                            <ShieldAlert size={12} />
                            <span>Disqualified (Security Violations)</span>
                          </span>
                        ) : sub.integrityAudit && (sub.integrityAudit.tabSwitches > 0 || sub.integrityAudit.copyAttempts > 0) ? (
                          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', background: '#fef3c7', color: '#b45309' }}>
                            <AlertTriangle size={12} />
                            <span>Flagged ({sub.integrityAudit.tabSwitches} Window Blur Events)</span>
                          </span>
                        ) : (
                          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem' }}>
                            <CheckCircle size={12} />
                            <span>Proctored Exam • 100% Clean</span>
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.65rem 0', fontSize: '0.84rem' }}>
                        <div>
                          Score: <strong>{sub.score} / {sub.totalMarks}</strong> ({sub.percentage}%)
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.76rem' }} className="font-mono">
                          {Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => onViewResult(sub)}
                      >
                        <Eye size={14} />
                        <span>View Official Certificate & Key</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Official Cumulative Student Academic Progress Report Modal */}
      <CumulativeReportModal
        student={student}
        submissions={studentSubmissions}
        teacher={teachers?.find((t) => t.id === student.enrolledByTeacherId) || null}
        isOpen={isCumulativeReportOpen}
        canPrint={false}
        onClose={() => setIsCumulativeReportOpen(false)}
      />
    </motion.div>
  );
};

