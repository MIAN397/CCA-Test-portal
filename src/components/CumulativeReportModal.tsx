import React, { useState, useEffect, useRef } from 'react';
import { Student, Submission, Teacher } from '../types';
import { useModalScrollLock } from '../utils/lenis';
import {
  Printer,
  X,
  FileCheck,
} from 'lucide-react';

interface CumulativeReportModalProps {
  student: Student | null;
  submissions: Submission[];
  teacher: Teacher | null;
  isOpen: boolean;
  canPrint?: boolean;
  onClose: () => void;
}

export const CumulativeReportModal: React.FC<CumulativeReportModalProps> = ({
  student,
  submissions,
  teacher,
  isOpen,
  canPrint = true,
  onClose,
}) => {
  useModalScrollLock(isOpen);

  const [teacherRemarks, setTeacherRemarks] = useState('');
  const prevIsOpenRef = useRef(false);
  const prevStudentIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      return;
    }

    const justOpened = isOpen && !prevIsOpenRef.current;
    const studentChanged = (student?.id || '') !== (prevStudentIdRef.current || '');

    if ((justOpened || studentChanged) && student) {
      const studentSubmissions = submissions.filter((s) => s.studentId === student.id);
      const totalTests = studentSubmissions.length;
      const totalMarksObtained = studentSubmissions.reduce((acc, s) => acc + s.score, 0);
      const totalPossibleMarks = studentSubmissions.reduce((acc, s) => acc + s.totalMarks, 0);
      const overallPercentage =
        totalPossibleMarks > 0 ? Math.round((totalMarksObtained / totalPossibleMarks) * 100) : 0;

      const def =
        totalTests === 0
          ? `Student ${student.name} is enrolled in ${student.className}. Scheduled examinations will appear on subsequent academic progress transcripts.`
          : overallPercentage >= 75
          ? `Student ${student.name} has maintained consistent academic dedication across all assessed subjects with an overall average of ${overallPercentage}%. Regular revision and practice tests will ensure continuous excellence in board examinations.`
          : `Student ${student.name} has completed ${totalTests} test(s) with an overall average of ${overallPercentage}%. Targeted practice in lower-scoring subjects is recommended to raise overall performance.`;

      setTeacherRemarks(def);
    }

    prevIsOpenRef.current = true;
    prevStudentIdRef.current = student?.id;
  }, [isOpen, student?.id]);

  if (!isOpen || !student) return null;

  // Filter submissions for this student
  const studentSubmissions = submissions.filter((s) => s.studentId === student.id);
  const totalTests = studentSubmissions.length;

  const totalMarksObtained = studentSubmissions.reduce((acc, s) => acc + s.score, 0);
  const totalPossibleMarks = studentSubmissions.reduce((acc, s) => acc + s.totalMarks, 0);
  const overallPercentage =
    totalPossibleMarks > 0 ? Math.round((totalMarksObtained / totalPossibleMarks) * 100) : 0;
  const passedCount = studentSubmissions.filter((s) => s.passed).length;
  const passRate = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0;

  // Subject-wise grouping
  const subjectStats: Record<
    string,
    { testsCount: number; marksObtained: number; totalMarks: number; percentages: number[] }
  > = {};

  studentSubmissions.forEach((sub) => {
    if (!subjectStats[sub.subject]) {
      subjectStats[sub.subject] = {
        testsCount: 0,
        marksObtained: 0,
        totalMarks: 0,
        percentages: [],
      };
    }
    subjectStats[sub.subject].testsCount += 1;
    subjectStats[sub.subject].marksObtained += sub.score;
    subjectStats[sub.subject].totalMarks += sub.totalMarks;
    subjectStats[sub.subject].percentages.push(sub.percentage);
  });

  const getOverallGrade = (pct: number) => {
    if (totalTests === 0) return 'NO TESTS RECORDED';
    if (pct >= 90) return 'DISTINCTION (A+ GRADE)';
    if (pct >= 80) return 'EXCELLENT (A GRADE)';
    if (pct >= 70) return 'VERY GOOD (B+ GRADE)';
    if (pct >= 60) return 'QUALIFIED / PASS (B GRADE)';
    return 'ACADEMIC REVISION RECOMMENDED';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" data-lenis-prevent="true" onClick={onClose}>
      <div
        className="modal-container large"
        data-lenis-prevent="true"
        style={{ maxWidth: '900px', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Header (Hidden in Print) */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileCheck size={22} color="var(--accent-gold)" />
            <div>
              <h3 style={{ margin: 0 }}>Cumulative Student Academic Progress Transcript</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                Multi-Subject Comprehensive Report Card for Parents
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {canPrint && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handlePrint}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={15} />
                <span>Print / Save as PDF</span>
              </button>
            )}

            <button className="modal-close-btn" onClick={onClose} title="Close Report">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          className="modal-body print-document-body"
          data-lenis-prevent="true"
          style={{
            background: '#f8fafc',
            padding: '1.75rem',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <div className="parent-report-sheet">
            {/* Sheet Header & Academy Insignia */}
            <div className="report-header-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <img
                  src="/logo.png"
                  alt="Cadets Coaching Academy Crest"
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    border: '2px solid #b45309',
                    background: '#ffffff',
                  }}
                />
                <div>
                  <h1
                    style={{
                      fontSize: '1.45rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: 0,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Cadets Coaching Academy (CCA)
                  </h1>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#b45309',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginTop: '0.2rem',
                    }}
                  >
                    Cumulative Academic Transcript & Progress Ledger
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Official Academic Term Performance Summary for Parents / Legal Guardians
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
                <div><strong>Login ID:</strong> {student.loginId}</div>
                <div><strong>Issue Date:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Academic Year:</strong> 2026</div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '1.25rem 0' }} />

            {/* Student Profile Box */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Student Full Name
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{student.name}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Class & Cohort
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{student.className}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Student Login ID
                </span>
                <code style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>{student.loginId}</code>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Assigned Faculty
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                  {teacher?.name || 'Academy Faculty Board'}
                </strong>
              </div>
            </div>

            {/* Cumulative Overall Executive Summary Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  {totalMarksObtained} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ {totalPossibleMarks}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>
                  Total Cumulative Marks
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: overallPercentage >= 60 ? '#15803d' : '#b91c1c',
                  }}
                >
                  {overallPercentage}%
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>
                  Overall Percentage
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  {totalTests} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>({passRate}% Passed)</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>
                  Tests Attempted
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: overallPercentage >= 60 ? '#15803d' : '#b91c1c',
                  }}
                >
                  {getOverallGrade(overallPercentage)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>
                  Overall Academic Standing
                </div>
              </div>
            </div>

            {/* Subject-Wise Performance Breakdown Table */}
            <div style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#0f172a',
                  marginBottom: '0.65rem',
                  borderBottom: '1.5px solid #cbd5e1',
                  paddingBottom: '0.4rem',
                }}
              >
                Subject-Wise Performance & Mastery Matrix
              </h3>

              {Object.keys(subjectStats).length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', padding: '0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  No tests attempted yet for this cadet.
                </div>
              ) : (
                <div className="table-container" style={{ background: '#ffffff' }}>
                  <table className="custom-table" style={{ width: '100%', background: '#ffffff', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem' }}>Subject Name</th>
                        <th style={{ textAlign: 'center', padding: '0.6rem 0.8rem' }}>Tests Attempted</th>
                        <th style={{ textAlign: 'center', padding: '0.6rem 0.8rem' }}>Marks Obtained / Total</th>
                        <th style={{ textAlign: 'center', padding: '0.6rem 0.8rem' }}>Subject Average</th>
                        <th style={{ textAlign: 'right', padding: '0.6rem 0.8rem' }}>Mastery Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(subjectStats).map(([subj, data]) => {
                        const avg = data.totalMarks > 0 ? Math.round((data.marksObtained / data.totalMarks) * 100) : 0;
                        const isStrong = avg >= 75;
                        const isPass = avg >= 60;

                        return (
                          <tr key={subj} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '0.6rem 0.8rem' }}>
                              {subj}
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.6rem 0.8rem' }}>
                              {data.testsCount}
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.6rem 0.8rem' }}>
                              <strong>{data.marksObtained}</strong> / {data.totalMarks}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: isPass ? '#15803d' : '#b91c1c', padding: '0.6rem 0.8rem' }}>
                              {avg}%
                            </td>
                            <td style={{ textAlign: 'right', padding: '0.6rem 0.8rem' }}>
                              <span
                                className={`badge ${isStrong ? 'badge-green' : isPass ? 'badge-gold' : 'badge-red'}`}
                                style={{ fontSize: '0.72rem' }}
                              >
                                {isStrong ? 'Distinction' : isPass ? 'Satisfactory' : 'Needs Practice'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Chronological Examination History Ledger */}
            <div style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#0f172a',
                  marginBottom: '0.65rem',
                  borderBottom: '1.5px solid #cbd5e1',
                  paddingBottom: '0.4rem',
                }}
              >
                Chronological Examination History Ledger
              </h3>

              {studentSubmissions.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', padding: '0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  No examination records found.
                </div>
              ) : (
                <div className="table-container" style={{ background: '#ffffff' }}>
                  <table className="custom-table" style={{ width: '100%', background: '#ffffff', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>Test Title</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>Subject</th>
                        <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem' }}>Score / Total</th>
                        <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem' }}>Percentage</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem' }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentSubmissions.map((sub) => (
                        <tr key={sub.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ color: '#64748b', padding: '0.5rem 0.75rem' }}>
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </td>
                          <td style={{ fontWeight: 600, color: '#0f172a', padding: '0.5rem 0.75rem' }}>
                            {sub.quizTitle}
                          </td>
                          <td style={{ color: '#2563eb', padding: '0.5rem 0.75rem' }}>
                            {sub.subject}
                          </td>
                          <td style={{ textAlign: 'center', padding: '0.5rem 0.75rem' }}>
                            <strong>{sub.score}</strong> / {sub.totalMarks}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: sub.passed ? '#15803d' : '#b91c1c', padding: '0.5rem 0.75rem' }}>
                            {sub.percentage}%
                          </td>
                          <td style={{ textAlign: 'right', padding: '0.5rem 0.75rem' }}>
                            <span className={`badge ${sub.passed ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                              {sub.passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Teacher Remarks Box (Editable for customization before printing) */}
            <div style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#0f172a',
                  marginBottom: '0.5rem',
                  borderBottom: '1.5px solid #cbd5e1',
                  paddingBottom: '0.4rem',
                }}
              >
                Faculty Overall Assessment & Recommendations
              </h3>

              {canPrint ? (
                <>
                  <div className="no-print" style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.4rem' }}>
                    You can edit these cumulative remarks below before printing or saving as PDF:
                  </div>

                  <textarea
                    className="form-input print-textarea"
                    rows={3}
                    style={{
                      width: '100%',
                      fontSize: '0.84rem',
                      lineHeight: 1.5,
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                    }}
                    value={teacherRemarks}
                    onChange={(e) => setTeacherRemarks(e.target.value)}
                  />
                </>
              ) : (
                <div
                  style={{
                    fontSize: '0.86rem',
                    lineHeight: 1.6,
                    padding: '0.75rem 1rem',
                    background: '#f1f5f9',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                  }}
                >
                  {teacherRemarks}
                </div>
              )}
            </div>

            {/* Official Signatures & Parent Acknowledgment Tear Slip */}
            <div
              style={{
                border: '1.5px dashed #94a3b8',
                borderRadius: '8px',
                padding: '1.25rem',
                background: '#ffffff',
                pageBreakInside: 'avoid',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#64748b',
                    background: '#f1f5f9',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                  }}
                >
                  Official Parent Sign-off & Acknowledgment Slip (Session 2026)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '40px', borderBottom: '1px solid #0f172a', marginBottom: '0.35rem' }} />
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    {teacher?.name || 'Faculty Head'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Assessing Faculty Instructor Signature</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '40px', borderBottom: '1px solid #0f172a', marginBottom: '0.35rem' }} />
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    Parent / Legal Guardian
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Signature & Date Received</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Toolbar (Hidden in Print) */}
        <div className="modal-footer no-print" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close Transcript
            </button>
            {!canPrint && (
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                Student On-Screen Transcript View Only
              </span>
            )}
          </div>

          {canPrint && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={16} />
              <span>Print / Save as PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
