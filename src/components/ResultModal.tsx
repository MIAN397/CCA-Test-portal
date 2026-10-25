import React from 'react';
import { motion } from 'motion/react';
import { Quiz, Submission } from '../types';
import { useModalScrollLock } from '../utils/lenis';
import {
  X,
  CheckCircle,
  XCircle,
  Award,
  Clock,
  FileCheck,
  ShieldAlert,
  AlertTriangle,
  Shield,
  Printer,
} from 'lucide-react';

interface ResultModalProps {
  submission: Submission | null;
  quiz: Quiz | null;
  isOpen: boolean;
  canPrint?: boolean;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  submission,
  quiz,
  isOpen,
  canPrint = true,
  onClose,
}) => {
  useModalScrollLock(isOpen);
  if (!isOpen || !submission) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGradeDetails = (percentage: number) => {
    if (submission.integrityAudit?.isDisqualified) {
      return { title: 'DISQUALIFIED (SECURITY INFRACTION)', color: '#b91c1c', badge: 'badge-red' };
    }
    if (percentage >= 90) {
      return { title: 'DISTINCTION (1ST CLASS HONORS)', color: '#d4af37', badge: 'badge-gold' };
    }
    if (percentage >= 80) {
      return { title: 'HONORS / HIGH MERIT', color: '#163826', badge: 'badge-green' };
    }
    if (percentage >= 60) {
      return { title: 'QUALIFIED / MERIT PASS', color: '#1d4ed8', badge: 'badge-blue' };
    }
    return { title: 'RETAKE RECOMMENDED', color: '#b91c1c', badge: 'badge-red' };
  };

  const gradeInfo = getGradeDetails(submission.percentage);

  return (
    <div className="modal-overlay" data-lenis-prevent="true" onClick={onClose}>
      <motion.div
        className="modal-container large"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileCheck size={22} color="var(--ccap-gold-500)" />
            <h3 className="font-cinzel">Official Examination Certificate & Scorecard</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" data-lenis-prevent="true" style={{ position: 'relative', overflowY: 'auto' }}>
          {/* Certificate Style Container */}
          <div className="certificate-view">
            {/* Background Watermark Seal */}
            <img
              src="/logo.png"
              alt="CCA Official Watermark"
              className="certificate-watermark"
            />

            {/* Official Header */}
            <div className="certificate-header">
              <img
                src="/logo.png"
                alt="Cadets Coaching Academy Seal"
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  border: '2px solid var(--ccap-gold-500)',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.35)',
                }}
              />
              <h2 className="font-cinzel" style={{ fontSize: '1.45rem', color: 'var(--ccap-navy-900)', letterSpacing: '0.04em' }}>
                CADETS COACHING ACADEMY (CCA)
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--ccap-gold-600)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Official Examination Performance Transcript
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', fontFamily: 'JetBrains Mono, monospace' }}>
                EXAM REF: CCA-{submission.id.toUpperCase().slice(-8)} • DATE: {new Date(submission.submittedAt).toLocaleDateString()}
              </div>
            </div>

            {/* Student & Test Info Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.85rem',
                background: 'var(--bg-subtle)',
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                marginBottom: '1.5rem',
                fontSize: '0.84rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Student Name
                </span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{submission.studentName}</strong>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.76rem' }}>{submission.studentClass}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Examination Paper
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>{submission.quizTitle}</strong>
                <div style={{ color: 'var(--ccap-green-800)', fontWeight: 700 }}>{submission.subject}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Faculty Assessor
                </span>
                <strong>{submission.teacherName || 'Academy Examination Board'}</strong>
              </div>
            </div>

            {/* Key Scores Grid */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="stat-card gold">
                <div className="stat-icon gold">
                  <Award size={22} />
                </div>
                <div className="stat-info">
                  <h3 className="font-mono">{submission.score} / {submission.totalMarks}</h3>
                  <p>Marks ({submission.percentage}%)</p>
                </div>
              </div>

              <div className="stat-card blue">
                <div className="stat-icon blue">
                  <Clock size={22} />
                </div>
                <div className="stat-info">
                  <h3 className="font-mono">{formatDuration(submission.timeSpentSeconds)}</h3>
                  <p>Time Taken</p>
                </div>
              </div>

              <div className={`stat-card ${submission.passed ? 'green' : 'red'}`}>
                <div className={`stat-icon ${submission.passed ? 'green' : 'red'}`}>
                  {submission.passed ? <CheckCircle size={22} /> : <XCircle size={22} />}
                </div>
                <div className="stat-info">
                  <h3 style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>{gradeInfo.title}</h3>
                  <p>Standing Classification</p>
                </div>
              </div>
            </div>

            {/* Official Academic Integrity Verification Banner */}
            <div style={{ marginBottom: '1.5rem' }}>
              {submission.integrityAudit?.isDisqualified ? (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid #f87171',
                    borderRadius: '8px',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#991b1b',
                  }}
                >
                  <ShieldAlert size={24} color="#dc2626" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                      Security Infraction: Candidate Disqualified
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#b91c1c' }}>
                      {submission.integrityAudit.disqualificationReason ||
                        `Exceeded maximum allowed security strikes (${submission.integrityAudit.tabSwitches} window blur / tab switches detected).`}
                    </div>
                  </div>
                </div>
              ) : submission.integrityAudit &&
                (submission.integrityAudit.tabSwitches > 0 ||
                  submission.integrityAudit.copyAttempts > 0 ||
                  (submission.integrityAudit.webcamAudit?.gazeAwayCount || 0) > 0 ||
                  (submission.integrityAudit.webcamAudit?.faceAbsenceCount || 0) > 0) ? (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1.5px solid #fcd34d',
                    borderRadius: '8px',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#92400e',
                  }}
                >
                  <AlertTriangle size={24} color="#d97706" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                      AI Proctored Exam: Telemetry Flagged in Institutional Log
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#b45309' }}>
                      {submission.integrityAudit.tabSwitches > 0 && `${submission.integrityAudit.tabSwitches} tab switch(es) • `}
                      {(submission.integrityAudit.webcamAudit?.gazeAwayCount || 0) > 0 &&
                        `${submission.integrityAudit.webcamAudit?.gazeAwayCount} gaze/desk alert(s) • `}
                      {(submission.integrityAudit.webcamAudit?.faceAbsenceCount || 0) > 0 &&
                        `${submission.integrityAudit.webcamAudit?.faceAbsenceCount} face loss event(s) • `}
                      Audit log archived for faculty inspection.
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: '8px',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#166534',
                  }}
                >
                  <Shield size={24} color="#16a34a" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                      Verified Proctored Examination • 100% High Integrity
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#15803d' }}>
                      Candidate maintained continuous focus in the secure examination desk with zero detected infractions.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Question Review */}
            {quiz && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--ccap-navy-900)',
                    marginBottom: '1rem',
                    borderBottom: '1px solid var(--border-light)',
                    paddingBottom: '0.5rem',
                  }}
                >
                  Question-by-Question Marking & Key Review
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {quiz.questions.map((q, idx) => {
                    const studentChoice = submission.answers[q.id];
                    const isCorrect = studentChoice === q.correctOption;

                    return (
                      <div
                        key={q.id}
                        style={{
                          padding: '1rem 1.15rem',
                          borderRadius: '8px',
                          background: isCorrect ? 'var(--badge-pass-bg)' : 'var(--badge-fail-bg)',
                          border: `1px solid ${isCorrect ? 'var(--badge-pass-border)' : 'var(--badge-fail-border)'}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                            Question #{idx + 1}
                          </span>
                          <span
                            className={`badge ${isCorrect ? 'badge-green' : 'badge-red'}`}
                            style={{ fontSize: '0.72rem' }}
                          >
                            {isCorrect ? `+${q.points} Marks (Correct)` : '0 Marks (Incorrect)'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                          {q.questionText}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
                          {q.options.map((opt, optIdx) => {
                            const isPicked = studentChoice === optIdx;
                            const isTheCorrectOne = q.correctOption === optIdx;

                            let bg = '#ffffff';
                            let border = 'var(--border-light)';
                            let color = 'var(--text-secondary)';

                            if (isTheCorrectOne) {
                              bg = '#dcfce7';
                              border = '#86efac';
                              color = '#166534';
                            } else if (isPicked && !isCorrect) {
                              bg = '#fee2e2';
                              border = '#fca5a5';
                              color = '#991b1b';
                            }

                            return (
                              <div
                                key={optIdx}
                                style={{
                                  padding: '0.45rem 0.75rem',
                                  borderRadius: '6px',
                                  background: bg,
                                  border: `1px solid ${border}`,
                                  color: color,
                                  fontWeight: isTheCorrectOne || isPicked ? 700 : 400,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                }}
                              >
                                <span className="font-mono">{String.fromCharCode(65 + optIdx)}:</span>
                                <span>{opt}</span>
                                {isTheCorrectOne && <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#15803d', fontWeight: 800 }}>Key</span>}
                                {isPicked && !isTheCorrectOne && <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#b91c1c', fontWeight: 800 }}>Your Answer</span>}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: '#475569', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                            <strong>Marking Note:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer no-print" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close Transcript
            </button>
            {!canPrint && (
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                Student On-Screen Result View Only
              </span>
            )}
          </div>

          {canPrint && (
            <motion.button
              type="button"
              className="btn btn-primary"
              onClick={() => window.print()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Printer size={16} />
              <span>Print Official Report / PDF</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

