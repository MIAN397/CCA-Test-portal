import React, { useState } from 'react';
import { motion } from 'motion/react';

import { Teacher, Student, Quiz, Submission } from '../types';
import {
  Users,
  UserCheck,
  BookOpen,
  Award,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Eye,
  Search,
  Sparkles,
} from 'lucide-react';
import { SubscriptionTable } from './SubscriptionTable';


interface AdminDashboardProps {
  teachers: Teacher[];
  students: Student[];
  quizzes: Quiz[];
  submissions: Submission[];
  onOpenRecruitModal: () => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onViewResult: (submission: Submission) => void;
  onRefreshData?: () => void;
  activeMobileTab?: string;
  onMobileTabChange?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  teachers,
  students,
  quizzes,
  submissions,
  onOpenRecruitModal,
  onEditTeacher,
  onDeleteTeacher,
  onViewResult,
  onRefreshData,
  activeMobileTab = 'hierarchy',
  onMobileTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'hierarchy' | 'teachers' | 'subscriptions'>('hierarchy');
  const activeTab = onMobileTabChange ? (activeMobileTab as 'hierarchy' | 'teachers' | 'subscriptions') : internalTab;
  const setActiveTab = onMobileTabChange ? (onMobileTabChange as any) : setInternalTab;

  const [expandedTeachers, setExpandedTeachers] = useState<Record<string, boolean>>({
    [teachers[0]?.id || '']: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Metrics
  const totalTeachers = teachers.length;
  const totalStudents = students.length;
  const totalQuizzes = quizzes.length;
  const totalSubmissions = submissions.length;
  const passedCount = submissions.filter((s) => s.passed).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;

  const toggleTeacherExpand = (teacherId: string) => {
    setExpandedTeachers((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignments.some(
        (a) =>
          a.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* KPI Stats */}
      <div className="stats-grid">
        <motion.div className="stat-card" whileHover={{ y: -3 }}>
          <div className="stat-icon purple">
            <UserCheck size={22} />
          </div>
          <div className="stat-info">
            <h3>{totalTeachers}</h3>
            <p>Faculty Teachers</p>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ y: -3 }}>
          <div className="stat-icon blue">
            <Users size={22} />
          </div>
          <div className="stat-info">
            <h3>{totalStudents}</h3>
            <p>Enrolled Students</p>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ y: -3 }}>
          <div className="stat-icon gold">
            <BookOpen size={22} />
          </div>
          <div className="stat-info">
            <h3>{totalQuizzes}</h3>
            <p>Quizzes in Bank</p>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ y: -3 }}>
          <div className="stat-icon green">
            <Award size={22} />
          </div>
          <div className="stat-info">
            <h3>{passRate}%</h3>
            <p>Academy Pass Rate</p>
          </div>
        </motion.div>
      </div>


      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-button ${activeTab === 'hierarchy' ? 'active' : ''}`}
          onClick={() => setActiveTab('hierarchy')}
        >
          <BookOpen size={18} />
          <span>Hierarchical Record Explorer</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => setActiveTab('teachers')}
        >
          <UserCheck size={18} />
          <span>Recruited Teachers Roster</span>
          <span className="tab-badge">{teachers.length}</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          <Sparkles size={18} />
          <span>Cadet Plans & Subscriptions</span>
        </button>
      </div>

      {/* TAB 1: Hierarchical Academy Record Explorer */}
      {activeTab === 'hierarchy' && (
        <div className="content-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h2>Academy Hierarchical Record Explorer</h2>
              <p>
                Drilldown: <strong>Teacher Name &rarr; Class &rarr; Subject &rarr; Test # &rarr; Student Details & Scores</strong>
              </p>
            </div>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '32px' }}
                placeholder="Search teacher, class or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="empty-state">
              <UserCheck className="empty-icon" />
              <h3>No Records Found</h3>
              <p>Recruit teachers to begin building the academy structure.</p>
            </div>
          ) : (
            <div className="hierarchy-tree">
              {filteredTeachers.map((teacher) => {
                const isExpanded = !!expandedTeachers[teacher.id];
                const teacherQuizzes = quizzes.filter((q) => q.teacherId === teacher.id);
                const teacherSubmissions = submissions.filter((s) => s.teacherId === teacher.id);

                // Group assignments by class
                const classesMap: Record<string, string[]> = {};
                teacher.assignments.forEach((asg) => {
                  if (!classesMap[asg.className]) {
                    classesMap[asg.className] = [];
                  }
                  if (!classesMap[asg.className].includes(asg.subject)) {
                    classesMap[asg.className].push(asg.subject);
                  }
                });

                return (
                  <div
                    key={teacher.id}
                    className={`tree-node-teacher ${isExpanded ? 'expanded' : ''}`}
                  >
                    {/* LEVEL 1: Teacher Header */}
                    <div
                      className="tree-header-teacher"
                      onClick={() => toggleTeacherExpand(teacher.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {isExpanded ? <ChevronDown size={20} color="#64748b" /> : <ChevronRight size={20} color="#64748b" />}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                            {teacher.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Login ID: <code>{teacher.loginId}</code> • Email: {teacher.email} • Phone: {teacher.phone || '—'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-purple font-mono">
                          {teacher.lifetimeClassesCreated ?? Object.keys(classesMap).length} / {teacher.maxClasses ?? 5} Classes (Lifetime)
                        </span>
                        <span className="badge badge-gold">
                          {teacherQuizzes.length} Quizzes
                        </span>
                        <span className="badge badge-green">
                          {teacherSubmissions.length} Subs
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTeacher(teacher);
                            }}
                            title="Edit Teacher"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete and remove faculty teacher "${teacher.name}"?`)) {
                                onDeleteTeacher(teacher.id);
                              }
                            }}
                            title="Remove Teacher"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* LEVEL 2, 3, 4, 5: Expanded hierarchy */}
                    {isExpanded && (
                      <div className="tree-body-classes">
                        {Object.keys(classesMap).length === 0 ? (
                          <div style={{ padding: '1rem', color: '#64748b', fontStyle: 'italic', fontSize: '0.84rem' }}>
                            No classes created yet by this teacher (Lifetime Quota: {teacher.lifetimeClassesCreated ?? 0}/{teacher.maxClasses ?? 5}). The teacher will create classes from their Faculty Command dashboard.
                          </div>
                        ) : (
                          Object.entries(classesMap).map(([className, subjects]) => {
                            const classStudents = students.filter(
                              (s) =>
                                s.enrolledByTeacherId === teacher.id &&
                                (s.className.trim().toLowerCase() === className.trim().toLowerCase() ||
                                  s.className.toLowerCase().replace(/[\s&]+/g, '') ===
                                    className.toLowerCase().replace(/[\s&]+/g, ''))
                            );

                            return (
                              <div key={className} className="tree-class-block">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>
                                    Class: <span style={{ color: 'var(--accent-gold)' }}>{className}</span>
                                  </div>
                                  <span className="badge badge-gray font-mono">
                                    {classStudents.length} Students Enrolled
                                  </span>
                                </div>

                              {/* LEVEL 3: Subjects taught in this class */}
                              {subjects.map((subject) => {
                                const subjectQuizzes = teacherQuizzes.filter((q) => q.subject === subject);
                                const subjectSubmissions = teacherSubmissions.filter((s) => s.subject === subject);

                                return (
                                  <div key={subject} className="tree-subject-block">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                                        Subject: <strong>{subject}</strong>
                                      </div>
                                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <span className="badge badge-blue">
                                          {subjectQuizzes.length} Tests Created
                                        </span>
                                        <span className="badge badge-green">
                                          {subjectSubmissions.length} Submissions
                                        </span>
                                      </div>
                                    </div>

                                    {/* LEVEL 4: Tests created for this subject */}
                                    {subjectQuizzes.length === 0 ? (
                                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.35rem 0' }}>
                                        No tests created for this subject yet.
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                                        {subjectQuizzes.map((quiz, qIdx) => {
                                          const quizSubs = subjectSubmissions.filter((s) => s.quizId === quiz.id);

                                          return (
                                            <div
                                              key={quiz.id}
                                              style={{
                                                background: '#ffffff',
                                                borderRadius: '6px',
                                                border: '1px solid #e2e8f0',
                                                padding: '0.75rem',
                                              }}
                                            >
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                                                <div>
                                                  <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>
                                                    Test #{qIdx + 1}: {quiz.title}
                                                  </strong>
                                                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                                                    ({quiz.durationMinutes} mins • {quiz.questions.length} Qs • Pass: {quiz.passMarks}/{quiz.totalMarks})
                                                  </span>
                                                </div>
                                                <span className="badge badge-gold">
                                                  {quizSubs.length} Student Attempts
                                                </span>
                                              </div>

                                              {/* LEVEL 5: Students Details & Scorecards */}
                                              {quizSubs.length === 0 ? (
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0.25rem 0' }}>
                                                  No students have taken this test yet.
                                                </div>
                                              ) : (
                                                <div className="table-container" style={{ marginTop: '0.4rem' }}>
                                                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                                                    <thead>
                                                      <tr>
                                                        <th>Student Name</th>
                                                        <th>Class</th>
                                                        <th>Marks Obtained</th>
                                                        <th>Percentage</th>
                                                        <th>Status</th>
                                                        <th>Time Spent</th>
                                                        <th>Submitted</th>
                                                        <th style={{ textAlign: 'right' }}>Scorecard</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {quizSubs.map((sub) => (
                                                        <tr key={sub.id}>
                                                          <td>
                                                            <strong>{sub.studentName}</strong>
                                                          </td>
                                                          <td>{sub.studentClass}</td>
                                                          <td>
                                                            <strong>{sub.score}</strong> / {sub.totalMarks}
                                                          </td>
                                                          <td>{sub.percentage}%</td>
                                                          <td>
                                                            <span className={`badge ${sub.passed ? 'badge-green' : 'badge-red'}`}>
                                                              {sub.passed ? 'Passed' : 'Failed'}
                                                            </span>
                                                          </td>
                                                          <td>{Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s</td>
                                                          <td style={{ color: '#64748b', fontSize: '0.72rem' }}>
                                                            {new Date(sub.submittedAt).toLocaleDateString()}
                                                          </td>
                                                          <td style={{ textAlign: 'right' }}>
                                                            <button
                                                              className="btn btn-secondary btn-sm"
                                                              style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}
                                                              onClick={() => onViewResult(sub)}
                                                            >
                                                              <Eye size={12} />
                                                              <span>Review</span>
                                                            </button>
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
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
                          );
                        })
                      )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Recruited Teachers Roster */}
      {activeTab === 'teachers' && (
        <div className="content-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h2>Recruited Teachers Roster</h2>
              <p>Manage instructor credentials and their multi-class assignments</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onOpenRecruitModal}>
              <Plus size={16} />
              <span>Recruit New Teacher</span>
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="table-container desktop-table-view">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Login ID & Password</th>
                  <th>Email & Phone</th>
                  <th>Class Limit Quota</th>
                  <th>Assigned Classes & Subjects</th>
                  <th>Recruited Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => {
                  const uniqueClasses = new Set(teacher.assignments.map((a) => a.className)).size;
                  const maxCls = teacher.maxClasses ?? 5;
                  const isNearLimit = uniqueClasses >= maxCls;

                  return (
                    <tr key={teacher.id}>
                      <td>
                        <strong>{teacher.name}</strong>
                      </td>
                      <td>
                        <div>
                          <code>{teacher.loginId}</code>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Pass: {
                            (teacher.loginId.toLowerCase() === 'afzal@ccap.com' || teacher.email?.toLowerCase() === 'afzal@ccap.com')
                              ? (teacher.password && teacher.password !== 'password123' ? teacher.password : 'Afzal123/')
                              : (teacher.password || '••••••••')
                          }
                        </div>
                      </td>
                      <td>
                        <div>{teacher.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {teacher.phone || '—'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isNearLimit ? 'badge-gold' : 'badge-green'} font-mono`}>
                          {teacher.lifetimeClassesCreated ?? uniqueClasses} / {maxCls} Lifetime
                        </span>
                      </td>
                      <td>
                        {teacher.assignments.length === 0 ? (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.78rem' }}>
                            No classes created yet
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {teacher.assignments.map((asg, idx) => (
                              <span
                                key={idx}
                                className="badge badge-blue"
                                style={{ fontSize: '0.72rem' }}
                              >
                                {asg.className}: {asg.subject}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {new Date(teacher.recruitedAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onEditTeacher(teacher)}
                            title="Edit Teacher"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              if (window.confirm(`Delete teacher profile "${teacher.name}"?`)) {
                                onDeleteTeacher(teacher.id);
                              }
                            }}
                            title="Delete Teacher"
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

          {/* Mobile Native Teacher Cards */}
          <div className="mobile-card-list">
            {teachers.map((teacher) => {
              const uniqueClasses = new Set(teacher.assignments.map((a) => a.className)).size;
              const maxCls = teacher.maxClasses ?? 5;
              const lifetimeCreated = teacher.lifetimeClassesCreated ?? uniqueClasses;
              const isNearLimit = lifetimeCreated >= maxCls;

              return (
                <div key={teacher.id} className="mobile-record-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>
                        {teacher.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Login: <code className="font-mono">{teacher.loginId}</code> • Pass: {
                          (teacher.loginId.toLowerCase() === 'afzal@ccap.com' || teacher.email?.toLowerCase() === 'afzal@ccap.com')
                            ? (teacher.password && teacher.password !== 'password123' ? teacher.password : 'Afzal123/')
                            : (teacher.password || '••••••••')
                        }
                      </div>
                    </div>
                    <span className={`badge ${isNearLimit ? 'badge-gold' : 'badge-green'} font-mono`} style={{ fontSize: '0.72rem' }}>
                      {lifetimeCreated}/{maxCls} Lifetime
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                    {teacher.email} {teacher.phone ? `• ${teacher.phone}` : ''}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.85rem' }}>
                    {teacher.assignments.length === 0 ? (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>
                        No classes created yet
                      </span>
                    ) : (
                      teacher.assignments.map((asg, idx) => (
                        <span key={idx} className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                          {asg.className}: {asg.subject}
                        </span>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => onEditTeacher(teacher)}
                    >
                      <Edit2 size={14} />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (window.confirm(`Delete teacher "${teacher.name}"?`)) {
                          onDeleteTeacher(teacher.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Cadet Subscriptions & Payment Ledger */}
      {activeTab === 'subscriptions' && (
        <SubscriptionTable
          students={students}
          onRefreshData={onRefreshData || (() => {})}
          viewerRole="admin"
        />
      )}
    </motion.div>
  );
};

