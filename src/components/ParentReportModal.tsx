import React, { useState, useEffect, useRef } from 'react';
import { Quiz, Submission } from '../types';
import { useModalScrollLock } from '../utils/lenis';
import {
  Printer,
  X,
  FileText,
  Shield,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

interface ParentReportModalProps {
  submission: Submission | null;
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ParentReportModal: React.FC<ParentReportModalProps> = ({
  submission,
  quiz,
  isOpen,
  onClose,
}) => {
  useModalScrollLock(isOpen);

  const [teacherRemarks, setTeacherRemarks] = useState('');
  const prevIsOpenRef = useRef(false);
  const prevSubmissionIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      return;
    }

    const justOpened = isOpen && !prevIsOpenRef.current;
    const submissionChanged = (submission?.id || '') !== (prevSubmissionIdRef.current || '');

    if ((justOpened || submissionChanged) && submission) {
      const def = submission.passed
        ? `Student ${submission.studentName} demonstrated strong conceptual clarity and disciplined time management during this assessment. Continued focus on regular problem solving is recommended to maintain top performance.`
        : `Student ${submission.studentName} requires focused revision in core concepts and regular practice tests to improve speed, accuracy, and overall confidence.`;
      setTeacherRemarks(def);
    }

    prevIsOpenRef.current = true;
    prevSubmissionIdRef.current = submission?.id;
  }, [isOpen, submission?.id]);

  if (!isOpen || !submission) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGradeClassification = (percentage: number) => {
    if (submission.integrityAudit?.isDisqualified) return 'DISQUALIFIED (SECURITY INFRACTION)';
    if (percentage >= 90) return 'DISTINCTION (A+ GRADE)';
    if (percentage >= 80) return 'EXCELLENT (A GRADE)';
    if (percentage >= 70) return 'VERY GOOD (B+ GRADE)';
    if (percentage >= 60) return 'QUALIFIED / PASS (B GRADE)';
    return 'IMPROVEMENT NEEDED (RETAKE)';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay parent-report-modal-overlay" data-lenis-prevent="true" onClick={onClose}>
      <div
        className="modal-container large parent-report-modal-container"
        data-lenis-prevent="true"
        style={{ maxWidth: '850px', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Header (Hidden in Print) */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={22} color="var(--accent-gold)" />
            <div>
              <h3 style={{ margin: 0 }}>Official Parent Assessment Report</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                Official Printable Transcript for Parents & Academic File
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>

            <button className="modal-close-btn" onClick={onClose} title="Close Report">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
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
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    border: '2px solid #b45309',
                    background: '#ffffff',
                  }}
                />
                <div>
                  <h1
                    style={{
                      fontSize: '1.4rem',
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
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#b45309',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginTop: '0.2rem',
                    }}
                  >
                    Department of Examination & Academic Evaluation
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Official Academic Progress Report for Parents / Legal Guardians
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
                <div><strong>Ref ID:</strong> CCA-{submission.id.toUpperCase().slice(-8)}</div>
                <div><strong>Issue Date:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</div>
                <div><strong>Session:</strong> Academic Term 2026</div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '1.25rem 0' }} />

            {/* Candidate & Class Profile Box */}
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
                  Student Name
                </span>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{submission.studentName}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Enrolled Class
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{submission.studentClass}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Examination Paper
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{submission.quizTitle}</strong>
                <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{submission.subject}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Faculty Instructor
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                  {submission.teacherName || 'Academy Faculty'}
                </strong>
              </div>
            </div>

            {/* Performance Summary Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  {submission.score} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {submission.totalMarks}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>
                  Marks Obtained
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: submission.passed ? '#15803d' : '#b91c1c',
                  }}
                >
                  {submission.percentage}%
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>
                  Score Percentage
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  {formatDuration(submission.timeSpentSeconds)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>
                  Time Taken
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: submission.passed ? '#15803d' : '#b91c1c',
                  }}
                >
                  {getGradeClassification(submission.percentage)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>
                  Evaluation Result
                </div>
              </div>
            </div>

            {/* Academic Integrity Verification Stamp */}
            <div
              style={{
                background: submission.integrityAudit?.isDisqualified
                  ? '#fef2f2'
                  : submission.integrityAudit &&
                    (submission.integrityAudit.tabSwitches > 0 || submission.integrityAudit.copyAttempts > 0)
                  ? '#fffbeb'
                  : '#f0fdf4',
                border: `1px solid ${
                  submission.integrityAudit?.isDisqualified
                    ? '#f87171'
                    : submission.integrityAudit &&
                      (submission.integrityAudit.tabSwitches > 0 || submission.integrityAudit.copyAttempts > 0)
                    ? '#fcd34d'
                    : '#86efac'
                }`,
                borderRadius: '8px',
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              {submission.integrityAudit?.isDisqualified ? (
                <ShieldAlert size={24} color="#dc2626" />
              ) : submission.integrityAudit &&
                (submission.integrityAudit.tabSwitches > 0 || submission.integrityAudit.copyAttempts > 0) ? (
                <AlertTriangle size={24} color="#d97706" />
              ) : (
                <Shield size={24} color="#16a34a" />
              )}

              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    color: submission.integrityAudit?.isDisqualified
                      ? '#991b1b'
                      : submission.integrityAudit &&
                        (submission.integrityAudit.tabSwitches > 0 || submission.integrityAudit.copyAttempts > 0)
                      ? '#92400e'
                      : '#166534',
                  }}
                >
                  {submission.integrityAudit?.isDisqualified
                    ? 'Security Infraction: Examination Disqualified'
                    : submission.integrityAudit &&
                      (submission.integrityAudit.tabSwitches > 0 || submission.integrityAudit.copyAttempts > 0)
                    ? `Proctored Examination (Audit Alert: ${submission.integrityAudit.tabSwitches} window blur event(s))`
                    : '100% Proctored Examination • Academic Integrity Certified'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '0.15rem' }}>
                  {submission.integrityAudit?.isDisqualified
                    ? submission.integrityAudit.disqualificationReason ||
                      'Student exceeded allowed window focus infractions during exam taking.'
                    : 'Examination was conducted under secured institutional browser lockdown with automated proctoring.'}
                </div>
              </div>
            </div>

            {/* Question-by-Question Marking & Explanations (Page Break Clean) */}
            {quiz && (
              <div style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid' }}>
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#0f172a',
                    marginBottom: '0.75rem',
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '0.4rem',
                  }}
                >
                  Assessment Question Analysis & Key Review
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {quiz.questions.map((q, idx) => {
                    const studentChoice = submission.answers[q.id];
                    const isCorrect = studentChoice === q.correctOption;

                    return (
                      <div
                        key={q.id}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          background: isCorrect ? '#f0fdf4' : '#fef2f2',
                          border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                          fontSize: '0.82rem',
                          pageBreakInside: 'avoid',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            Q{idx + 1}: {q.questionText}
                          </span>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              color: isCorrect ? '#166534' : '#991b1b',
                            }}
                          >
                            {isCorrect ? `+${q.points} Marks (Correct)` : `0 / ${q.points} Marks`}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.76rem', color: '#475569', marginTop: '0.25rem' }}>
                          <div>
                            <strong>Student Response:</strong>{' '}
                            <span style={{ color: isCorrect ? '#166534' : '#dc2626', fontWeight: 600 }}>
                              {studentChoice !== undefined ? `${String.fromCharCode(65 + studentChoice)}. ${q.options[studentChoice]}` : 'Not Answered'}
                            </span>
                          </div>

                          {!isCorrect && (
                            <div>
                              <strong>Correct Key:</strong>{' '}
                              <span style={{ color: '#166534', fontWeight: 600 }}>
                                {String.fromCharCode(65 + q.correctOption)}. {q.options[q.correctOption]}
                              </span>
                            </div>
                          )}
                        </div>

                        {q.explanation && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem', fontStyle: 'italic' }}>
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                Teacher Evaluation Commentary & Recommendations
              </h3>

              <div className="no-print" style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.4rem' }}>
                You can edit these remarks below before printing or saving as PDF:
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
                  Official Parent Sign-off & Acknowledgment Slip
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '40px', borderBottom: '1px solid #0f172a', marginBottom: '0.35rem' }} />
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    {submission.teacherName || 'Faculty Instructor'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Assessing Instructor Signature</div>
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
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Report
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
