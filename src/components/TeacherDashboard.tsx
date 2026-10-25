import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Teacher, Student, Quiz, Submission, getQuizPublishState } from '../types';
import {
  Users,
  BookOpen,
  Award,
  UserPlus,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Search,
  Clock,
  Eye,
  HelpCircle,
  Layers,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  X,
  CheckCircle2,
  CheckCircle,
  Archive,
  Play,
  ShieldAlert,
  Shield,
  Printer,
  Check,
} from 'lucide-react';
import { ParentReportModal } from './ParentReportModal';
import { CumulativeReportModal } from './CumulativeReportModal';
import { useModalScrollLock } from '../utils/lenis';

interface TeacherDashboardProps {
  teacher: Teacher | null;
  students: Student[];
  quizzes: Quiz[];
  submissions: Submission[];
  onOpenEnrollModal: (initialClass?: string) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenCreateQuizModal: (initialClass?: string, initialSubject?: string) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (id: string) => void;
  onCloneQuiz: (quiz: Quiz) => void;
  onViewResult: (submission: Submission) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  onSaveQuiz?: (quiz: Quiz) => void;
  activeMobileTab?: string;
  onMobileTabChange?: (tab: string) => void;
  onOpenPlanPortal?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  students,
  quizzes,
  submissions,
  onOpenEnrollModal,
  onEditStudent,
  onDeleteStudent,
  onOpenCreateQuizModal,
  onEditQuiz,
  onDeleteQuiz,
  onCloneQuiz,
  onViewResult,
  onUpdateTeacher,
  onSaveQuiz,
  activeMobileTab = 'students',
  onMobileTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<
    'students' | 'active_quizzes' | 'quiz_bank' | 'analytics' | 'submissions'
  >('students');
  const activeTab = onMobileTabChange ? (activeMobileTab as any) : internalTab;
  const setActiveTab = onMobileTabChange ? onMobileTabChange : setInternalTab;

  const [studentSearch, setStudentSearch] = useState('');
  const [submissionSearch, setSubmissionSearch] = useState('');

  // Lifetime Class Quota calculations (Cumulative lifetime limit - does not decrease on delete)
  const uniqueClassNames = Array.from(new Set(teacher?.assignments.map((a) => a.className) || []));
  const maxClasses = teacher?.subscription?.maxClasses ?? teacher?.maxClasses ?? 5;
  const lifetimeCreated = teacher?.lifetimeClassesCreated ?? uniqueClassNames.length;
  const isAtLifetimeLimit = lifetimeCreated >= maxClasses;
  const lifetimeSlotsRemaining = Math.max(0, maxClasses - lifetimeCreated);

  // Class Creation Modal State (Direct custom class and multiple subjects)
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [subjectsList, setSubjectsList] = useState<string[]>(['']);
  const [classCreationError, setClassCreationError] = useState<string | null>(null);

  // Expand states for Class > Subject accordions
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({
    [teacher?.assignments[0]?.className || '']: true,
  });

  // Integrity Audit Modal State
  const [activeIntegrityModal, setActiveIntegrityModal] = useState<Submission | null>(null);

  // Parent Report Modal State (Single Test)
  const [activeParentReport, setActiveParentReport] = useState<{
    submission: Submission;
    quiz: Quiz | null;
  } | null>(null);

  // Cumulative Student Report Modal State (All Past Tests & Subjects)
  const [activeCumulativeReportStudent, setActiveCumulativeReportStudent] = useState<Student | null>(null);

  useModalScrollLock(isCreateClassModalOpen || !!activeIntegrityModal || !!activeParentReport || !!activeCumulativeReportStudent);

  // Quick Credential Copy State
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);

  const handleCopyCredentials = (std: Student) => {
    const emailInfo = std.email ? `\nEmail / Gmail: ${std.email} (Can simply login by mail)` : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const passText = std.password ? `\nPassword: ${std.password}` : '';
    const text = `CCA Academy Portal Login\nStudent Name: ${std.name}\nClass: ${std.className}${emailInfo}\nLogin ID: ${std.loginId}${passText}\nPortal URL: ${origin}`;
    navigator.clipboard.writeText(text);
    setCopiedStudentId(std.id);
    setTimeout(() => setCopiedStudentId(null), 2000);
  };

  if (!teacher) {
    return (
      <div className="empty-state">
        <Users className="empty-icon" />
        <h3>No Teacher Profile Selected</h3>
        <p>Please select an active teacher from the top navigation bar.</p>
      </div>
    );
  }

  // Teacher-specific data strictly isolated by teacher.id
  const teacherQuizzes = quizzes.filter((q) => q.teacherId === teacher.id);
  const quizBankItems = teacherQuizzes.filter((q) => q.isInQuizBank || q.publishStatus === 'draft');
  const liveActiveQuizzes = teacherQuizzes.filter((q) => {
    if (q.publishStatus === 'draft') return false;
    const publishState = getQuizPublishState(q);
    return publishState.status === 'active' || publishState.status === 'scheduled';
  });
  const teacherSubmissions = submissions.filter((s) => s.teacherId === teacher.id);

  const teacherClassesClean = new Set(
    teacher.assignments.map((a) => a.className.trim().toLowerCase().replace(/[\s&]+/g, ''))
  );

  // Isolate teacher students: students enrolled by this teacher or with active enrollments in this teacher's cohort
  const teacherStudents = students.filter((s) => {
    if (s.enrolledByTeacherId === teacher.id) return true;
    if (s.enrolledClasses && s.enrolledClasses.some((ec) => ec.enrolledByTeacherId === teacher.id && ec.status === 'active')) return true;

    const sLegacyClean = s.className ? s.className.trim().toLowerCase().replace(/[\s&]+/g, '') : '';
    if (sLegacyClean && teacherClassesClean.has(sLegacyClean)) return true;

    if (
      s.enrolledClasses &&
      s.enrolledClasses.some((ec) => {
        const ecClean = ec.className ? ec.className.trim().toLowerCase().replace(/[\s&]+/g, '') : '';
        return ec.status === 'active' && teacherClassesClean.has(ecClean);
      })
    ) {
      return true;
    }
    return false;
  });

  // Group teacher's assignments by Class -> Subjects
  const teacherClassesMap: Record<string, string[]> = {};
  teacher.assignments.forEach((asg) => {
    if (!teacherClassesMap[asg.className]) {
      teacherClassesMap[asg.className] = [];
    }
    if (!teacherClassesMap[asg.className].includes(asg.subject)) {
      teacherClassesMap[asg.className].push(asg.subject);
    }
  });

  // Identify quizzes in Quiz Bank that are unassigned drafts (not matching any of teacher's current assigned classes)
  const unassignedDraftQuizzes = quizBankItems.filter((q) => {
    if (q.allocation.mode === 'all') return false;
    const matchesAnyClass = Object.keys(teacherClassesMap).some((className) => {
      const cleanClass = className.toLowerCase().replace(/[\s&]+/g, '');
      const inTargetClasses =
        q.allocation.targetClasses &&
        q.allocation.targetClasses.some(
          (tc) => tc.toLowerCase().replace(/[\s&]+/g, '') === cleanClass
        );
      const inTargetClass =
        q.targetClass &&
        q.targetClass.toLowerCase().replace(/[\s&]+/g, '') === cleanClass;
      return inTargetClasses || inTargetClass;
    });
    return !matchesAnyClass;
  });

  const toggleClassExpand = (className: string) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [className]: !prev[className],
    }));
  };

  const handleOpenCreateClassModal = () => {
    setClassCreationError(null);
    setNewClassName('');
    setSubjectsList(['']);
    setIsCreateClassModalOpen(true);
  };

  const handleAddSubjectRow = () => {
    setSubjectsList([...subjectsList, '']);
  };

  const handleRemoveSubjectRow = (index: number) => {
    if (subjectsList.length <= 1) return;
    setSubjectsList(subjectsList.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index: number, val: string) => {
    const updated = [...subjectsList];
    updated[index] = val;
    setSubjectsList(updated);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    const finalClassName = newClassName.trim();

    if (!finalClassName) {
      setClassCreationError('Please enter a class name.');
      return;
    }

    // Collect all subjects entered (supports multiple input rows and comma separation)
    const parsedSubjects: string[] = [];
    subjectsList.forEach((row) => {
      row.split(',').forEach((part) => {
        const trimmed = part.trim();
        if (trimmed && !parsedSubjects.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
          parsedSubjects.push(trimmed);
        }
      });
    });

    if (parsedSubjects.length === 0) {
      setClassCreationError('Please enter at least one subject taught for this class.');
      return;
    }

    // Check if this is a brand new class cohort
    const isNewClass = !uniqueClassNames.some(
      (c) => c.toLowerCase() === finalClassName.toLowerCase()
    );

    if (isNewClass && isAtLifetimeLimit) {
      setClassCreationError(
        `Lifetime Class Limit Reached: You have used all ${maxClasses} lifetime class creation slots authorized by the Administrator. Note: Lifetime quota does not increase when deleting classes. Please contact Academy Admin to request an increase in your limit.`
      );
      return;
    }

    // Find new assignments to add that don't already exist
    const newAssignmentsToAdd: { className: string; subject: string }[] = [];
    for (const subj of parsedSubjects) {
      const alreadyExists = teacher.assignments.some(
        (a) =>
          a.className.toLowerCase() === finalClassName.toLowerCase() &&
          a.subject.toLowerCase() === subj.toLowerCase()
      );
      if (!alreadyExists) {
        newAssignmentsToAdd.push({ className: finalClassName, subject: subj });
      }
    }

    if (newAssignmentsToAdd.length === 0) {
      setClassCreationError(
        `All specified subjects already exist for class "${finalClassName}".`
      );
      return;
    }

    const nextLifetimeCount = isNewClass ? lifetimeCreated + 1 : lifetimeCreated;

    const updatedTeacher: Teacher = {
      ...teacher,
      lifetimeClassesCreated: nextLifetimeCount,
      assignments: [...teacher.assignments, ...newAssignmentsToAdd],
    };

    if (onUpdateTeacher) {
      onUpdateTeacher(updatedTeacher);
    }

    setIsCreateClassModalOpen(false);
    // Auto-expand the newly created/updated class
    setExpandedClasses((prev) => ({ ...prev, [finalClassName]: true }));
  };

  const handleRemoveClass = (classNameToRemove: string) => {
    if (!teacher) return;
    if (
      window.confirm(
        `Are you sure you want to remove Class "${classNameToRemove}" and its subject assignments? Note: Lifetime class creation quota will not be refunded.`
      )
    ) {
      const updatedAssignments = teacher.assignments.filter((a) => a.className !== classNameToRemove);
      const updatedTeacher: Teacher = {
        ...teacher,
        assignments: updatedAssignments,
      };
      if (onUpdateTeacher) {
        onUpdateTeacher(updatedTeacher);
      }
    }
  };

  const handleRemoveSubjectFromClass = (className: string, subjectToRemove: string) => {
    if (!teacher) return;
    if (window.confirm(`Remove subject "${subjectToRemove}" from class "${className}"?`)) {
      const updatedAssignments = teacher.assignments.filter(
        (a) => !(a.className === className && a.subject === subjectToRemove)
      );
      const updatedTeacher: Teacher = {
        ...teacher,
        assignments: updatedAssignments,
      };
      if (onUpdateTeacher) {
        onUpdateTeacher(updatedTeacher);
      }
    }
  };

  const totalSubmissions = teacherSubmissions.length;
  const passedCount = teacherSubmissions.filter((s) => s.passed).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;
  const averageScore =
    totalSubmissions > 0
      ? Math.round(
          teacherSubmissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / totalSubmissions
        )
      : 0;

  const filteredSubmissions = teacherSubmissions.filter(
    (s) =>
      s.studentName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.quizTitle.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.subject.toLowerCase().includes(submissionSearch.toLowerCase())
  );

  // Dynamic Tab Context Data per active tab
  const getTeacherTabContext = () => {
    switch (activeTab) {
      case 'quiz_bank':
        return {
          badge: 'Question Repository',
          title: `QUESTION BANK REPOSITORY — ${teacher.name.toUpperCase()}`,
          subtitle: `Instructor: ${teacher.name} • ${quizBankItems.length} Question Bank Items`,
          stats: [
            { icon: Layers, color: 'purple', count: quizBankItems.length, label: 'Bank Items' },
            { icon: BookOpen, color: 'blue', count: teacher.assignments?.length || 0, label: 'Subject Categories' },
            { icon: Award, color: 'green', count: teacherQuizzes.length, label: 'Quizzes Created' },
          ],
        };
      case 'active_quizzes':
        return {
          badge: 'Active & Scheduled Tests',
          title: `PUBLISHED TIMED ASSESSMENTS — ${teacher.name.toUpperCase()}`,
          subtitle: `Instructor: ${teacher.name} • Manage Live Examination Windows`,
          stats: [
            { icon: BookOpen, color: 'gold', count: liveActiveQuizzes.length, label: 'Active Live Quizzes' },
            { icon: Clock, color: 'blue', count: teacherQuizzes.filter((q) => getQuizPublishState(q).status === 'scheduled').length, label: 'Scheduled Tests' },
            { icon: Award, color: 'green', count: teacherQuizzes.filter((q) => q.publishStatus === 'draft').length, label: 'Draft Quizzes' },
          ],
        };
      case 'analytics':
        return {
          badge: 'Performance & Growth Metrics',
          title: `STUDENT COHORT ANALYTICS — ${teacher.name.toUpperCase()}`,
          subtitle: `Instructor: ${teacher.name} • Class-wise Mastery & Score Distribution`,
          stats: [
            { icon: Award, color: 'green', count: `${passRate}%`, label: 'Pass Rate' },
            { icon: BarChart3, color: 'blue', count: `${averageScore}%`, label: 'Average Score' },
            { icon: Users, color: 'gold', count: teacherStudents.length, label: 'Cadets Analyzed' },
          ],
        };
      case 'submissions':
        return {
          badge: 'Integrity Audits & Transcripts',
          title: `SUBMISSIONS & PROCTOR AUDITS — ${teacher.name.toUpperCase()}`,
          subtitle: `Instructor: ${teacher.name} • AI Webcam Evidence Snapshots & Integrity Logs`,
          stats: [
            { icon: Award, color: 'blue', count: teacherSubmissions.length, label: 'Total Submissions' },
            { icon: ShieldAlert, color: 'purple', count: teacherSubmissions.filter((s) => s.integrityAudit?.isDisqualified).length, label: 'Disqualified' },
            { icon: Award, color: 'green', count: teacherSubmissions.filter((s) => s.passed).length, label: 'Passed Submissions' },
          ],
        };
      case 'students':
      default:
        return {
          badge: `${teacher.assignments?.length || 0} Subject Cohort(s)`,
          title: `ENROLLED CADETS DIRECTORY — ${teacher.name.toUpperCase()}`,
          subtitle: `Instructor Portal & Timed Assessment Command Center • Login ID: ${teacher.loginId}`,
          stats: [
            { icon: Users, color: 'blue', count: teacherStudents.length, label: 'Enrolled Cadets' },
            { icon: BookOpen, color: 'gold', count: Object.keys(teacherClassesMap).length, label: 'Class Groups' },
            { icon: Layers, color: 'purple', count: teacher.assignments?.length || 0, label: 'Subjects Assigned' },
          ],
        };
    }
  };

  const tabCtx = getTeacherTabContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* KPI Stats Grid (Dynamic Per Tab) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`stats-${activeTab}`}
          className="stats-grid"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tabCtx.stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <motion.div key={idx} className="stat-card" whileHover={{ y: -3 }}>
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

      {/* Navigation Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={18} />
          <span>Students (Class → Subject)</span>
          <span className="tab-badge">{teacherStudents.length}</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'quiz_bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz_bank')}
        >
          <Layers size={18} />
          <span>Quiz Bank</span>
          <span className="tab-badge">{quizBankItems.length}</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'active_quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('active_quizzes')}
        >
          <BookOpen size={18} />
          <span>Active Quizzes</span>
          <span className="tab-badge">{liveActiveQuizzes.length}</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={18} />
          <span>Analytics</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <Award size={18} />
          <span>Submissions</span>
          <span className="tab-badge">{teacherSubmissions.length}</span>
        </button>
      </div>

      {/* ========================================================================
          TAB 1: Enrolled Students Organized by CLASS > SUBJECT > STUDENT
          ======================================================================== */}
      {activeTab === 'students' && (
        <div className="content-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h2>Enrolled Students Directory (Class → Subject → Student)</h2>
              <p>Explore your students grouped by assigned Class Cohort, Subject, and Login ID</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <button className="btn btn-navy btn-sm" onClick={handleOpenCreateClassModal}>
                <Plus size={16} />
                <span>Create Class</span>
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onOpenEnrollModal()}>
                <UserPlus size={16} />
                <span>Enroll Student</span>
              </button>
            </div>
          </div>

          {Object.keys(teacherClassesMap).length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <h3>No Classes Created Yet</h3>
              <p>Click "Create Class" to create your first class and assign subjects.</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleOpenCreateClassModal}>
                <Plus size={16} />
                <span>Create Class Now</span>
              </button>
            </div>
          ) : (
            <div className="hierarchy-tree">
              {Object.entries(teacherClassesMap).map(([className, subjects]) => {
                const isExpanded = expandedClasses[className] !== false;
                const cleanClass = className.trim().toLowerCase();
                const cleanClassNorm = cleanClass.replace(/[\s&]+/g, '');

                const classStudents = teacherStudents.filter((s) => {
                  const matchesLegacyClass =
                    s.className &&
                    (s.className.trim().toLowerCase() === cleanClass ||
                      s.className.toLowerCase().replace(/[\s&]+/g, '') === cleanClassNorm);

                  const matchesEnrolledClasses =
                    s.enrolledClasses &&
                    s.enrolledClasses.some(
                      (ec) =>
                        ec.status === 'active' &&
                        (ec.className.trim().toLowerCase() === cleanClass ||
                          ec.className.toLowerCase().replace(/[\s&]+/g, '') === cleanClassNorm)
                    );

                  const matchesSearch =
                    !studentSearch ||
                    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    s.loginId.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()));

                  return (matchesLegacyClass || matchesEnrolledClasses) && matchesSearch;
                });

                return (
                  <div key={className} className={`tree-node-teacher ${isExpanded ? 'expanded' : ''}`}>
                    {/* LEVEL 1: Class Header */}
                    <div
                      className="tree-header-teacher"
                      onClick={() => toggleClassExpand(className)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {isExpanded ? <ChevronDown size={20} color="#64748b" /> : <ChevronRight size={20} color="#64748b" />}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>
                            Class: <span style={{ color: 'var(--crest-gold-dark)' }}>{className}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {subjects.join(' • ')} • {classStudents.length} Enrolled Student(s)
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-navy">
                          {subjects.length} Subject(s) Taught
                        </span>
                        <span className="badge badge-gold font-mono">
                          {classStudents.length} Students
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEnrollModal(className);
                          }}
                        >
                          <UserPlus size={13} />
                          <span>Enroll Student</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                          title={`Remove class "${className}"`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveClass(className);
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Remove Class</span>
                        </button>
                      </div>
                    </div>

                    {/* LEVEL 2 & 3: Subjects & Enrolled Students */}
                    {isExpanded && (
                      <div className="tree-body-classes">
                        {subjects.map((subject) => {
                          const subjectQuizzes = quizzes.filter(
                            (q) => q.teacherId === teacher.id && q.subject === subject
                          );

                          return (
                            <div key={subject} className="tree-subject-block">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                                  Subject: <span style={{ color: 'var(--cadet-green)' }}>{subject}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <span className="badge badge-green font-mono" style={{ fontSize: '0.74rem' }}>
                                    {subjectQuizzes.length} Quizzes Created for {subject}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                                    title={`Remove subject "${subject}" from "${className}"`}
                                    onClick={() => handleRemoveSubjectFromClass(className, subject)}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Students in this Class */}
                              {classStudents.length === 0 ? (
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                                  No students enrolled in {className} yet. Click "Enroll Student" to add students.
                                </div>
                              ) : (
                                <>
                                  {/* Desktop Table View */}
                                  <div className="table-container desktop-table-view" style={{ background: '#ffffff' }}>
                                    <table className="custom-table">
                                      <thead>
                                        <tr>
                                          <th>Student Name</th>
                                          <th>Login ID / Mail</th>
                                          <th>Password</th>
                                          <th>Phone Number</th>
                                          <th>{subject} Accuracy</th>
                                          <th>Submissions</th>
                                          <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {classStudents.map((std) => {
                                          const stdSubjectSubs = teacherSubmissions.filter(
                                            (s) =>
                                              s.studentId === std.id &&
                                              s.subject.trim().toLowerCase() === subject.trim().toLowerCase()
                                          );
                                          const avgAccuracy =
                                            stdSubjectSubs.length > 0
                                              ? Math.round(
                                                  stdSubjectSubs.reduce((acc, s) => acc + s.percentage, 0) /
                                                    stdSubjectSubs.length
                                                )
                                              : null;

                                           return (
                                            <tr key={std.id}>
                                              <td>
                                                <strong style={{ color: 'var(--text-heading)' }}>
                                                  {std.name}
                                                </strong>
                                                {std.email && (
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#15803d', marginTop: '2px', fontWeight: 600 }}>
                                                    <CheckCircle2 size={12} />
                                                    <span>{std.email} (Mail Login Active)</span>
                                                  </div>
                                                )}
                                              </td>
                                              <td>
                                                <code className="font-mono">{std.loginId}</code>
                                                {std.email && (
                                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                    {std.email}
                                                  </div>
                                                )}
                                              </td>
                                              <td>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                                  {std.password || '••••••••'}
                                                </span>
                                              </td>
                                              <td style={{ color: 'var(--text-muted)' }}>{std.phone || '—'}</td>
                                              <td>
                                                {avgAccuracy !== null ? (
                                                  <span
                                                    className={`badge ${avgAccuracy >= 60 ? 'badge-green' : 'badge-gold'}`}
                                                  >
                                                    {avgAccuracy}% Avg
                                                  </span>
                                                ) : (
                                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Not Attempted
                                                  </span>
                                                )}
                                              </td>
                                              <td>
                                                <span className="badge badge-gray font-mono">
                                                  {stdSubjectSubs.length} Tests
                                                </span>
                                              </td>
                                              <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                                                  <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleCopyCredentials(std)}
                                                    title="Copy Student Login ID & Password"
                                                    style={{ minWidth: '34px', padding: '0.3rem 0.5rem' }}
                                                  >
                                                    {copiedStudentId === std.id ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                                                    {copiedStudentId === std.id && <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>Copied</span>}
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className="btn btn-navy btn-sm"
                                                    onClick={() => setActiveCumulativeReportStudent(std)}
                                                    title="Generate Official Cumulative Academic Progress Report Card"
                                                  >
                                                    <Printer size={12} />
                                                    <span>Report</span>
                                                  </button>
                                                  <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => onEditStudent(std)}
                                                    title="Edit Cadet"
                                                  >
                                                    <Edit2 size={13} />
                                                  </button>
                                                  <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => {
                                                      if (window.confirm(`Delete cadet "${std.name}"?`)) {
                                                        onDeleteStudent(std.id);
                                                      }
                                                    }}
                                                    title="Delete Cadet"
                                                  >
                                                    <Trash2 size={13} />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Mobile Native Cadet Cards */}
                                  <div className="mobile-card-list">
                                    {classStudents.map((std) => {
                                      const stdSubjectSubs = teacherSubmissions.filter(
                                        (s) =>
                                          s.studentId === std.id &&
                                          s.subject.trim().toLowerCase() === subject.trim().toLowerCase()
                                      );
                                      const avgAccuracy =
                                        stdSubjectSubs.length > 0
                                          ? Math.round(
                                              stdSubjectSubs.reduce((acc, s) => acc + s.percentage, 0) /
                                                stdSubjectSubs.length
                                            )
                                          : null;

                                      return (
                                        <div key={std.id} className="mobile-record-card">
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                            <div>
                                              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)' }}>
                                                {std.name}
                                              </div>
                                              {std.email && (
                                                <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600, margin: '2px 0' }}>
                                                  ✉️ {std.email} (Mail Login Active)
                                                </div>
                                              )}
                                              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                                Roll: <code className="font-mono">{std.loginId}</code> • Pass: {std.password || '••••••••'}
                                              </div>
                                            </div>
                                            {avgAccuracy !== null ? (
                                              <span className={`badge ${avgAccuracy >= 60 ? 'badge-green' : 'badge-gold'}`}>
                                                {avgAccuracy}% Avg
                                              </span>
                                            ) : (
                                              <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>
                                                Untested
                                              </span>
                                            )}
                                          </div>

                                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                                            Phone: {std.phone || '—'} • {stdSubjectSubs.length} Tests Attempted
                                          </div>

                                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            <button
                                              type="button"
                                              className="btn btn-secondary btn-sm"
                                              onClick={() => handleCopyCredentials(std)}
                                              title="Copy Cadet Credentials"
                                            >
                                              {copiedStudentId === std.id ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                                              <span>{copiedStudentId === std.id ? 'Copied' : 'Credentials'}</span>
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-navy btn-sm"
                                              style={{ flex: 1 }}
                                              onClick={() => setActiveCumulativeReportStudent(std)}
                                            >
                                              <Printer size={13} />
                                              <span>Cumulative Report</span>
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-secondary btn-sm"
                                              onClick={() => onEditStudent(std)}
                                            >
                                              <Edit2 size={13} />
                                              <span>Edit</span>
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-danger btn-sm"
                                              onClick={() => {
                                                if (window.confirm(`Delete cadet "${std.name}"?`)) {
                                                  onDeleteStudent(std.id);
                                                }
                                              }}
                                            >
                                              <Trash2 size={13} />
                                              <span>Delete</span>
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================
          TAB 2: Quiz Bank Organized by CLASS > SUBJECT > QUIZ
          ======================================================================== */}
      {activeTab === 'quiz_bank' && (
        <div className="content-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h2>Persistent Quiz Bank (Class &rarr; Subject &rarr; Quizzes)</h2>
              <p>Reusable question repository structured by Class and Subject for instant batch cloning</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenCreateQuizModal()}>
              <Plus size={16} />
              <span>Create New Quiz Paper</span>
            </button>
          </div>

          {quizBankItems.length === 0 ? (
            <div className="empty-state">
              <Layers className="empty-icon" />
              <h3>Quiz Bank Is Empty</h3>
              <p>Save assessments to your Quiz Bank so you can reuse and re-assign them anytime.</p>
            </div>
          ) : (
            <div className="hierarchy-tree">
              {/* Dedicated General / Unassigned Drafts Accordion */}
              {unassignedDraftQuizzes.length > 0 && (
                <div
                  className={`tree-node-teacher ${
                    expandedClasses['__unassigned_drafts__'] !== false ? 'expanded' : ''
                  }`}
                  style={{ borderLeft: '4px solid #f59e0b', marginBottom: '1rem' }}
                >
                  <div
                    className="tree-header-teacher"
                    onClick={() => toggleClassExpand('__unassigned_drafts__')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {expandedClasses['__unassigned_drafts__'] !== false ? (
                        <ChevronDown size={20} color="#64748b" />
                      ) : (
                        <ChevronRight size={20} color="#64748b" />
                      )}
                      <div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            color: 'var(--primary-navy)',
                          }}
                        >
                          General / Unassigned Drafts
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Draft assessments not yet allocated to a specific class cohort •{' '}
                          {unassignedDraftQuizzes.length} Draft(s) Available
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="badge badge-gold font-mono">
                        {unassignedDraftQuizzes.length} Unassigned Draft(s)
                      </span>
                    </div>
                  </div>

                  {expandedClasses['__unassigned_drafts__'] !== false && (
                    <div className="tree-body-classes">
                      <div className="assessment-grid" style={{ marginTop: '0.5rem' }}>
                        {unassignedDraftQuizzes.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="assessment-card"
                            style={{ borderLeft: '4px solid #f59e0b' }}
                          >
                            <div>
                              <div className="assessment-card-header">
                                <span className="badge badge-gold">{quiz.subject}</span>
                                <span className="badge badge-gray font-mono">
                                  {quiz.questions.length} Qs ({quiz.totalMarks} Marks)
                                </span>
                              </div>

                              <div className="assessment-card-title">{quiz.title}</div>
                              <div className="assessment-card-desc">
                                {quiz.description || 'Unassigned draft saved in Quiz Bank.'}
                              </div>

                              <div className="assessment-meta-list">
                                <div className="assessment-meta-item">
                                  <Clock size={14} />
                                  <span>Duration: {quiz.durationMinutes}m</span>
                                </div>
                                <div className="assessment-meta-item">
                                  <Award size={14} />
                                  <span>Pass: {quiz.passMarks} Marks</span>
                                </div>
                              </div>
                            </div>

                            <div className="assessment-card-footer">
                              <span
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#d97706',
                                  fontWeight: 700,
                                }}
                              >
                                Unassigned Draft
                              </span>
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => onEditQuiz(quiz)}
                                  title="Assign and schedule this draft to classes"
                                >
                                  <Play size={13} />
                                  <span>Assign to Class</span>
                                </button>
                                <button
                                  className="btn btn-navy btn-sm"
                                  onClick={() => {
                                    onCloneQuiz(quiz);
                                    alert(
                                      `Cloned "${quiz.title}"! You can now allot it to a class.`
                                    );
                                  }}
                                  title="Clone duplicate copy in Quiz Bank"
                                >
                                  <Copy size={13} />
                                  <span>Clone</span>
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => onEditQuiz(quiz)}
                                  title="Edit Test Questions"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Permanently delete draft "${quiz.title}" from your Quiz Bank?`
                                      )
                                    ) {
                                      onDeleteQuiz(quiz.id);
                                    }
                                  }}
                                  title="Delete Permanently from Bank"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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

                return (
                  <div key={className} className={`tree-node-teacher ${isExpanded ? 'expanded' : ''}`}>
                    {/* Class Header */}
                    <div
                      className="tree-header-teacher"
                      onClick={() => toggleClassExpand(className)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {isExpanded ? <ChevronDown size={20} color="#64748b" /> : <ChevronRight size={20} color="#64748b" />}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>
                            Class Repository: <span style={{ color: 'var(--crest-gold-dark)' }}>{className}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {subjects.join(' • ')} • {classBankQuizzes.length} Quizzes Available
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="badge badge-purple font-mono">
                          {classBankQuizzes.length} Banked Tests
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCreateQuizModal(className);
                          }}
                          title={`Create assessment for ${className}`}
                        >
                          <Plus size={13} />
                          <span>Add Quiz</span>
                        </button>
                      </div>
                    </div>

                    {/* Subjects and Banked Quizzes */}
                    {isExpanded && (
                      <div className="tree-body-classes">
                        {subjects.map((subject) => {
                          const subjectBankQuizzes = classBankQuizzes.filter(
                            (q) => q.subject.trim().toLowerCase() === subject.trim().toLowerCase()
                          );

                          return (
                            <div key={subject} className="tree-subject-block">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                                  Subject: <span style={{ color: 'var(--cadet-green)' }}>{subject}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span className="badge badge-purple font-mono" style={{ fontSize: '0.74rem' }}>
                                    {subjectBankQuizzes.length} Banked Tests
                                  </span>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '0.2rem 0.55rem', fontSize: '0.74rem' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenCreateQuizModal(className, subject);
                                    }}
                                    title={`Create assessment for ${subject} (${className})`}
                                  >
                                    <Plus size={12} />
                                    <span>Add Quiz</span>
                                  </button>
                                </div>
                              </div>

                              {subjectBankQuizzes.length === 0 ? (
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  <span>No quizzes stored in bank for {subject} under {className}.</span>
                                  <button
                                    type="button"
                                    className="btn btn-navy btn-sm"
                                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                                    onClick={() => onOpenCreateQuizModal(className, subject)}
                                  >
                                    <Plus size={12} />
                                    <span>Build {subject} Quiz</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="assessment-grid" style={{ marginTop: '0.5rem' }}>
                                  {subjectBankQuizzes.map((quiz) => (
                                    <div key={quiz.id} className="assessment-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                                      <div>
                                        <div className="assessment-card-header">
                                          <span className="badge badge-purple">{quiz.subject}</span>
                                          <span className="badge badge-gray font-mono">
                                            {quiz.questions.length} Qs ({quiz.totalMarks} Marks)
                                          </span>
                                        </div>

                                        <div className="assessment-card-title">{quiz.title}</div>
                                        <div className="assessment-card-desc">
                                          {quiz.description || 'Saved in Quiz Bank for instant reuse.'}
                                        </div>

                                        <div className="assessment-meta-list">
                                          <div className="assessment-meta-item">
                                            <Clock size={14} />
                                            <span>Duration: {quiz.durationMinutes}m</span>
                                          </div>
                                          <div className="assessment-meta-item">
                                            <Award size={14} />
                                            <span>Pass: {quiz.passMarks} Marks</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="assessment-card-footer">
                                        <span style={{ fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 700 }}>
                                          Stored in Bank
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                                          <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => onEditQuiz(quiz)}
                                            title="Assign and schedule this test to classes"
                                          >
                                            <Play size={13} />
                                            <span>{quiz.publishStatus === 'draft' ? 'Resume Draft' : 'Assign to Class'}</span>
                                          </button>
                                          <button
                                            className="btn btn-navy btn-sm"
                                            onClick={() => {
                                              onCloneQuiz(quiz);
                                              alert(`Cloned "${quiz.title}"! You can now allot it to a new class.`);
                                            }}
                                            title="Clone duplicate copy in Quiz Bank"
                                          >
                                            <Copy size={13} />
                                            <span>Clone</span>
                                          </button>
                                          <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => onEditQuiz(quiz)}
                                            title="Edit Test Questions"
                                          >
                                            <Edit2 size={13} />
                                          </button>
                                          <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                              if (window.confirm(`Permanently delete quiz "${quiz.title}" from your Quiz Bank?`)) {
                                                onDeleteQuiz(quiz.id);
                                              }
                                            }}
                                            title="Delete Permanently from Bank"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================
          TAB 3: Active Quizzes & Publishing Schedules
          ======================================================================== */}
      {activeTab === 'active_quizzes' && (
        <div className="content-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h2>Active Quizzes & Publishing Schedules</h2>
              <p>Dual Timers: Test-taking duration & live publishing availability countdowns</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenCreateQuizModal()}>
              <Plus size={16} />
              <span>Create New Quiz</span>
            </button>
          </div>

          {liveActiveQuizzes.length === 0 ? (
            <div className="empty-state">
              <Clock className="empty-icon" />
              <h3>No Active Live Quizzes Right Now</h3>
              <p>Only quizzes actively published or scheduled for classes appear here. Drafts and unassigned tests are stored in your Quiz Bank.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.2rem' }}>
                <button className="btn btn-navy" onClick={() => setActiveTab('quiz_bank')}>
                  <Layers size={16} />
                  <span>Go to Quiz Bank</span>
                </button>
                <button className="btn btn-primary" onClick={() => onOpenCreateQuizModal()}>
                  <Plus size={16} />
                  <span>Create & Publish Quiz</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="assessment-grid">
              {liveActiveQuizzes.map((quiz) => {
                const publishState = getQuizPublishState(quiz);
                const subCount = teacherSubmissions.filter((s) => s.quizId === quiz.id).length;

                return (
                  <div key={quiz.id} className="assessment-card">
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

                      <div className="assessment-card-title">
                        {quiz.title}
                      </div>
                      <div className="assessment-card-desc">
                        {quiz.description || 'Live assessment paper in circulation.'}
                      </div>

                      {/* Allocation Targets Info */}
                      <div style={{ margin: '0.5rem 0', fontSize: '0.78rem', color: '#64748b' }}>
                        <strong>Target Allocation:</strong>{' '}
                        {quiz.allocation.mode === 'all' && (
                          <span className="badge badge-blue">All Enrolled Students</span>
                        )}
                        {quiz.allocation.mode === 'classes' && (
                          <span className="badge badge-purple">
                            {quiz.allocation.targetClasses.join(', ')}
                          </span>
                        )}
                        {quiz.allocation.mode === 'students' && (
                          <span className="badge badge-gold">
                            {quiz.allocation.targetStudentIds.length} Selected Students
                          </span>
                        )}
                      </div>

                      <div className="assessment-meta-list">
                        <div className="assessment-meta-item">
                          <Clock size={14} />
                          <span>{quiz.durationMinutes} Mins Test Timer</span>
                        </div>
                        <div className="assessment-meta-item">
                          <HelpCircle size={14} />
                          <span>{quiz.questions.length} Questions</span>
                        </div>
                        <div className="assessment-meta-item">
                          <Award size={14} />
                          <span>
                            {quiz.passMarks}/{quiz.totalMarks} Pass
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="assessment-card-footer">
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        {subCount} Submissions
                      </span>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onEditQuiz(quiz)}
                          title="Edit Quiz & Schedule Timers"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-navy btn-sm"
                          style={{ background: '#4338ca' }}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Move "${quiz.title}" back to Quiz Bank (Unassign from active live circulation)?\n\n• Students will no longer see it as active.\n• It will remain safely stored in your Quiz Bank so you can re-allot it anytime with fresh timers.`
                              )
                            ) {
                              if (onSaveQuiz) {
                                onSaveQuiz({ ...quiz, publishStatus: 'draft', isInQuizBank: true });
                              }
                            }
                          }}
                          title="Return to Quiz Bank (Unassign from live circulation)"
                        >
                          <Archive size={13} />
                          <span>To Bank</span>
                        </button>
                        <button
                          className="btn btn-navy btn-sm"
                          onClick={() => onCloneQuiz(quiz)}
                          title="Clone to Quiz Bank"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            const moveToBank = window.confirm(
                              `What would you like to do with "${quiz.title}"?\n\n• Click [OK] to Return to Quiz Bank (Unassign from active circulation so you can re-allot later).\n• Click [Cancel] to choose Permanent Deletion.`
                            );
                            if (moveToBank) {
                              if (onSaveQuiz) {
                                onSaveQuiz({ ...quiz, publishStatus: 'draft', isInQuizBank: true });
                              }
                            } else {
                              if (
                                window.confirm(
                                  `Are you sure you want to PERMANENTLY DELETE "${quiz.title}" from the entire system?`
                                )
                              ) {
                                onDeleteQuiz(quiz.id);
                              }
                            }
                          }}
                          title="Delete or Return to Quiz Bank"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================
          TAB 4: Subject Progress Analytics
          ======================================================================== */}
      {activeTab === 'analytics' && (
        <div className="content-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h2>Student Subject-Wise & Overall Performance</h2>
              <p>Track student accuracy, pass rate, and individual subject mastery for your enrolled students</p>
            </div>
          </div>

          {teacherStudents.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <h3>No Students in Your Classes</h3>
              <p>Enroll students or assign classes to track their performance analytics.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {teacherStudents.map((std) => {
                const stdSubmissions = teacherSubmissions.filter((s) => s.studentId === std.id);
                const totalAttempted = stdSubmissions.length;
                const overallPercent =
                  totalAttempted > 0
                    ? Math.round(
                        stdSubmissions.reduce((acc, s) => acc + s.percentage, 0) / totalAttempted
                      )
                    : 0;

                // Subject-wise grouping
                const subjectStats: Record<string, { total: number; sumPercent: number }> = {};
                stdSubmissions.forEach((sub) => {
                  if (!subjectStats[sub.subject]) {
                    subjectStats[sub.subject] = { total: 0, sumPercent: 0 };
                  }
                  subjectStats[sub.subject].total += 1;
                  subjectStats[sub.subject].sumPercent += sub.percentage;
                });

                return (
                  <div
                    key={std.id}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                          {std.name}
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {std.className} • Login ID: <code>{std.loginId}</code> • Phone: {std.phone || '—'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">
                          {totalAttempted} Tests Attempted
                        </span>
                        <span
                          className={`badge ${
                            overallPercent >= 60 ? 'badge-green' : overallPercent > 0 ? 'badge-gold' : 'badge-gray'
                          }`}
                          style={{ fontSize: '0.85rem' }}
                        >
                          Overall Average: {overallPercent}%
                        </span>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.28rem 0.75rem', fontSize: '0.76rem' }}
                          onClick={() => setActiveCumulativeReportStudent(std)}
                          title="Generate Official Cumulative Academic Progress Report Card (All Subjects & Tests)"
                        >
                          <Printer size={13} />
                          <span>Cumulative Report</span>
                        </button>
                      </div>
                    </div>

                    {/* Subject Progress Bars */}
                    {Object.keys(subjectStats).length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        No tests attempted yet by this student.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                        {Object.entries(subjectStats).map(([subj, data]) => {
                          const avg = data.total > 0 ? Math.round(data.sumPercent / data.total) : 0;
                          let color = 'green';
                          if (avg < 50) color = 'red';
                          else if (avg < 75) color = 'gold';

                          return (
                            <div
                              key={subj}
                              style={{
                                background: '#ffffff',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                                <strong>{subj}</strong>
                                <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{avg}%</span>
                              </div>
                              <div className="progress-bar-container">
                                <div className={`progress-fill ${color}`} style={{ width: `${avg}%` }} />
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem' }}>
                                {data.total} attempt(s)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================
          TAB 5: Student Submissions Review
          ======================================================================== */}
      {activeTab === 'submissions' && (
        <div className="content-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h2>Student Examination Submissions</h2>
              <p>Review scorecards, student responses, and answer keys</p>
            </div>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '32px' }}
                placeholder="Search submissions..."
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="empty-state">
              <Award className="empty-icon" />
              <h3>No Submissions Found</h3>
              <p>Student submissions will appear here as soon as they complete tests.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="table-container desktop-table-view">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student Name & Class</th>
                      <th>Quiz Title</th>
                      <th>Subject</th>
                      <th>Score / Total</th>
                      <th>Percentage</th>
                      <th>Status</th>
                      <th>Academic Integrity</th>
                      <th>Time Spent</th>
                      <th>Submitted At</th>
                      <th style={{ textAlign: 'right' }}>Transcript</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id}>
                        <td>
                          <strong>{sub.studentName}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{sub.studentClass}</div>
                        </td>
                        <td>{sub.quizTitle}</td>
                        <td>
                          <span className="badge badge-purple">{sub.subject}</span>
                        </td>
                        <td>
                          <strong>
                            {sub.score} / {sub.totalMarks}
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: sub.passed ? '#15803d' : '#b91c1c' }}>
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
                            <button
                              type="button"
                              className="badge badge-red"
                              style={{
                                cursor: 'pointer',
                                border: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.3rem 0.6rem',
                              }}
                              onClick={() => setActiveIntegrityModal(sub)}
                              title="Click to view infraction audit log"
                            >
                              <ShieldAlert size={13} />
                              <span>Disqualified ({sub.integrityAudit.tabSwitches} Strikes)</span>
                            </button>
                          ) : sub.integrityAudit &&
                            (sub.integrityAudit.tabSwitches > 0 || sub.integrityAudit.copyAttempts > 0) ? (
                            <button
                              type="button"
                              className="badge"
                              style={{
                                cursor: 'pointer',
                                border: '1px solid #fde68a',
                                background: '#fef3c7',
                                color: '#b45309',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.3rem 0.6rem',
                              }}
                              onClick={() => setActiveIntegrityModal(sub)}
                              title="Click to view infraction audit log"
                            >
                              <AlertTriangle size={13} />
                              <span>Flagged ({sub.integrityAudit.tabSwitches} Switches)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="badge badge-green"
                              style={{
                                cursor: 'pointer',
                                border: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.3rem 0.6rem',
                              }}
                              onClick={() => setActiveIntegrityModal(sub)}
                              title="100% Proctored & Clean"
                            >
                              <CheckCircle size={13} />
                              <span>100% High Integrity</span>
                            </button>
                          )}
                        </td>
                        <td>{Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s</td>
                        <td style={{ color: '#64748b', fontSize: '0.78rem' }}>
                          {new Date(sub.submittedAt).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn-navy btn-sm"
                              onClick={() => {
                                const matchedQuiz = quizzes.find((q) => q.id === sub.quizId) || null;
                                setActiveParentReport({ submission: sub, quiz: matchedQuiz });
                              }}
                              title="Generate Official Parent Progress Report (Print / Save as PDF)"
                            >
                              <Printer size={13} />
                              <span>Parent Report</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => onViewResult(sub)}
                              title="View Cadet Scorecard Transcript"
                            >
                              <Eye size={14} />
                              <span>Scorecard</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Native Submissions List */}
              <div className="mobile-card-list">
                {filteredSubmissions.map((sub) => (
                  <div key={sub.id} className="mobile-record-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-heading)' }}>
                          {sub.studentName}
                        </div>
                        <span className="badge badge-blue" style={{ fontSize: '0.68rem', marginTop: '0.2rem' }}>
                          {sub.studentClass} • {sub.subject}
                        </span>
                      </div>
                      <span className={`badge ${sub.passed ? 'badge-green' : 'badge-red'}`}>
                        {sub.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', margin: '0.4rem 0' }}>
                      Test: <strong>{sub.quizTitle}</strong>
                    </div>

                    {/* Mobile Academic Integrity Row */}
                    <div style={{ margin: '0.4rem 0' }}>
                      {sub.integrityAudit?.isDisqualified ? (
                        <button
                          type="button"
                          className="badge badge-red"
                          style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', width: '100%', justifyContent: 'center' }}
                          onClick={() => setActiveIntegrityModal(sub)}
                        >
                          <ShieldAlert size={12} />
                          <span>Disqualified ({sub.integrityAudit.tabSwitches} Strikes) • View Audit</span>
                        </button>
                      ) : sub.integrityAudit &&
                        (sub.integrityAudit.tabSwitches > 0 || sub.integrityAudit.copyAttempts > 0) ? (
                        <button
                          type="button"
                          className="badge"
                          style={{ cursor: 'pointer', border: '1px solid #fde68a', background: '#fef3c7', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', width: '100%', justifyContent: 'center' }}
                          onClick={() => setActiveIntegrityModal(sub)}
                        >
                          <AlertTriangle size={12} />
                          <span>Flagged ({sub.integrityAudit.tabSwitches} Switches) • View Audit</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="badge badge-green"
                          style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', width: '100%', justifyContent: 'center' }}
                          onClick={() => setActiveIntegrityModal(sub)}
                        >
                          <CheckCircle size={12} />
                          <span>100% High Integrity • Verified</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <span>Score: <strong>{sub.score}/{sub.totalMarks}</strong> ({sub.percentage}%)</span>
                      <span>Time: {Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-navy btn-sm"
                        onClick={() => {
                          const matchedQuiz = quizzes.find((q) => q.id === sub.quizId) || null;
                          setActiveParentReport({ submission: sub, quiz: matchedQuiz });
                        }}
                      >
                        <Printer size={13} />
                        <span>Parent Report</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onViewResult(sub)}
                      >
                        <Eye size={13} />
                        <span>Scorecard</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Create New Class Modal with Quota Enforcement */}
      {isCreateClassModalOpen && (
        <div className="modal-overlay" data-lenis-prevent="true" onClick={() => setIsCreateClassModalOpen(false)}>
          <div
            className="modal-container"
            data-lenis-prevent="true"
            style={{ maxWidth: '520px', width: '92vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'var(--crest-gold-surface)',
                    border: '1px solid var(--crest-gold-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--crest-gold-dark)',
                  }}
                >
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-cinzel" style={{ fontSize: '1.15rem', color: 'var(--primary-navy)' }}>
                    Create Faculty Class Cohort
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Lifetime Quota: <span className="font-mono" style={{ fontWeight: 700 }}>{lifetimeCreated} / {maxClasses}</span> Classes Created
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCreateClassModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClass}>
              <div className="modal-body" data-lenis-prevent="true">
                {/* Lifetime Quota Warning Banner */}
                {isAtLifetimeLimit ? (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.84rem', color: '#92400e', lineHeight: 1.4 }}>
                      <strong>Lifetime Class Quota Full ({maxClasses}/{maxClasses}):</strong> You have reached your maximum lifetime class limit set by the Administrator. Deleting classes does not restore lifetime slots. You can still add new subjects to existing classes, or contact Academy Admin to request an increase.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.84rem', color: '#166534' }}>
                      <strong>{lifetimeSlotsRemaining} lifetime class creation slot(s) remaining</strong> in your profile.
                    </div>
                  </div>
                )}

                {classCreationError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      fontSize: '0.84rem',
                      color: '#dc2626',
                      marginBottom: '1rem',
                    }}
                  >
                    {classCreationError}
                  </div>
                )}

                {/* Direct Custom Class Name Entry */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Class / Cohort Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Class 7 Cadet Prep, 9th Class Alpha, Matric Special"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    required
                    autoFocus
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Type any custom name for your class cohort or cadet batch.
                  </div>
                </div>

                {/* Multi-Subject Entry with Add Row Button */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Subjects Taught ({subjectsList.filter((s) => s.trim()).length || 1}) *
                    </label>
                    <button
                      type="button"
                      className="btn btn-navy btn-sm"
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.74rem' }}
                      onClick={handleAddSubjectRow}
                    >
                      <Plus size={13} />
                      <span>Add Another Subject</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {subjectsList.map((subjectVal, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={
                            idx === 0
                              ? 'e.g. Mathematics'
                              : idx === 1
                              ? 'e.g. English Grammar'
                              : idx === 2
                              ? 'e.g. General Science'
                              : 'e.g. Intelligence Test Prep'
                          }
                          value={subjectVal}
                          onChange={(e) => handleSubjectChange(idx, e.target.value)}
                          required={idx === 0}
                          autoFocus={idx > 0}
                        />
                        {subjectsList.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ height: '42px', width: '42px', padding: 0, flexShrink: 0 }}
                            onClick={() => handleRemoveSubjectRow(idx)}
                            title="Remove Subject"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Add as many subjects as needed, or separate subjects by comma (e.g. Mathematics, English, Physics).
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateClassModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>Create Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institutional Academic Integrity Audit Modal */}
      {activeIntegrityModal && (
        <div className="modal-overlay" data-lenis-prevent="true" onClick={() => setActiveIntegrityModal(null)}>
          <div className="modal-container large" data-lenis-prevent="true" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Shield size={22} color="var(--accent-gold)" />
                <div>
                  <h3 style={{ margin: 0 }}>Institutional Academic Integrity Audit</h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                    Proctoring Telemetry & Anti-AI Infraction Log
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveIntegrityModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" data-lenis-prevent="true" style={{ background: '#f8fafc', padding: '1.5rem' }}>
              {/* Candidate Info Card */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                      {activeIntegrityModal.studentName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {activeIntegrityModal.studentClass} • Test: <strong>{activeIntegrityModal.quizTitle}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: activeIntegrityModal.passed ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {activeIntegrityModal.score} / {activeIntegrityModal.totalMarks} ({activeIntegrityModal.percentage}%)
                    </div>
                    <span className={`badge ${activeIntegrityModal.passed ? 'badge-green' : 'badge-red'}`}>
                      {activeIntegrityModal.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proctoring Metric Counters */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: '0.65rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: (activeIntegrityModal.integrityAudit?.tabSwitches || 0) > 0 ? '#ea580c' : '#15803d',
                    }}
                  >
                    {activeIntegrityModal.integrityAudit?.tabSwitches || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Tab Switches</div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: (activeIntegrityModal.integrityAudit?.webcamAudit?.gazeAwayCount || 0) > 0 ? '#ea580c' : '#15803d',
                    }}
                  >
                    {activeIntegrityModal.integrityAudit?.webcamAudit?.gazeAwayCount || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Gaze / Desk Alerts</div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: (activeIntegrityModal.integrityAudit?.webcamAudit?.faceAbsenceCount || 0) > 0 ? '#ea580c' : '#15803d',
                    }}
                  >
                    {activeIntegrityModal.integrityAudit?.webcamAudit?.faceAbsenceCount || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Face Lost</div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: (activeIntegrityModal.integrityAudit?.webcamAudit?.totalGazeAwaySeconds || 0) > 10 ? '#dc2626' : (activeIntegrityModal.integrityAudit?.webcamAudit?.totalGazeAwaySeconds || 0) > 0 ? '#ea580c' : '#15803d',
                    }}
                  >
                    {activeIntegrityModal.integrityAudit?.webcamAudit?.totalGazeAwaySeconds || 0}s
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Total Away Time</div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: (activeIntegrityModal.integrityAudit?.fullscreenExits || 0) > 0 ? '#ea580c' : '#15803d',
                    }}
                  >
                    {activeIntegrityModal.integrityAudit?.fullscreenExits || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Fullscreen Exits</div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: activeIntegrityModal.integrityAudit?.isDisqualified ? '#dc2626' : '#15803d',
                    }}
                  >
                    {activeIntegrityModal.integrityAudit?.isDisqualified ? 'DISQUALIFIED' : 'VERIFIED'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Audit Status</div>
                </div>
              </div>

              {/* Proctor Snapshot Evidence Gallery (if captured) */}
              {activeIntegrityModal.integrityAudit?.webcamAudit?.snapshots &&
                activeIntegrityModal.integrityAudit.webcamAudit.snapshots.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>AI Proctor Snapshot Evidence ({activeIntegrityModal.integrityAudit.webcamAudit.snapshots.length})</span>
                    </h4>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                        gap: '0.6rem',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        background: '#ffffff',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {activeIntegrityModal.integrityAudit.webcamAudit.snapshots.map((snap, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            background: '#0f172a',
                          }}
                        >
                          <img
                            src={snap.imageBase64}
                            alt={`Snapshot ${sIdx + 1}`}
                            style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                          />
                          <div style={{ padding: '0.3rem', fontSize: '0.68rem', color: '#cbd5e1' }}>
                            <div style={{ fontWeight: 700, color: '#f59e0b' }}>{snap.timestamp}</div>
                            <div style={{ fontSize: '0.64rem', lineHeight: 1.2, marginTop: '2px' }}>{snap.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Timestamped Log */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Proctoring Telemetry & Infraction Log
                </h4>
                {activeIntegrityModal.integrityAudit?.infractionTimestamps &&
                activeIntegrityModal.integrityAudit.infractionTimestamps.length > 0 ? (
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      padding: '0.75rem',
                      maxHeight: '150px',
                      overflowY: 'auto',
                    }}
                  >
                    {activeIntegrityModal.integrityAudit.infractionTimestamps.map((log, lIdx) => (
                      <div
                        key={lIdx}
                        style={{
                          fontSize: '0.78rem',
                          color: '#b91c1c',
                          padding: '0.3rem 0',
                          borderBottom:
                            lIdx < activeIntegrityModal.integrityAudit!.infractionTimestamps.length - 1
                              ? '1px dashed #f1f5f9'
                              : 'none',
                        }}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#166534',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                    }}
                  >
                    Zero security infractions detected. Candidate maintained continuous focus on the exam window throughout the test duration.
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveIntegrityModal(null)}>
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Parent Progress Assessment Report Modal (Single Test) */}
      <ParentReportModal
        submission={activeParentReport?.submission || null}
        quiz={activeParentReport?.quiz || null}
        isOpen={!!activeParentReport}
        onClose={() => setActiveParentReport(null)}
      />

      {/* Official Cumulative Student Academic Progress Report Modal (All Subjects & Tests) */}
      <CumulativeReportModal
        student={activeCumulativeReportStudent}
        submissions={teacherSubmissions}
        teacher={teacher}
        isOpen={!!activeCumulativeReportStudent}
        onClose={() => setActiveCumulativeReportStudent(null)}
      />
    </motion.div>
  );
};

