import React from 'react';
import { motion } from 'motion/react';
import { UserRole, Teacher, Student } from '../types';
import { LogOut, Shield, UserCheck, GraduationCap, Code, Cloud, Menu, Clock, Sparkles } from 'lucide-react';
import { getDaysRemaining } from '../utils/subscription';
import { getUserSubscription } from '../utils/storage';

interface NavbarProps {
  currentRole: UserRole;
  currentTeacher?: Teacher | null;
  currentStudent?: Student | null;
  googleEmail?: string;
  googlePicture?: string;
  onLogout?: () => void;
  onOpenMobileSidebar?: () => void;
  onOpenPlanPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentTeacher,
  currentStudent,
  googleEmail,
  googlePicture,
  onLogout,
  onOpenMobileSidebar,
  onOpenPlanPortal,
}) => {
  const teacherSub =
    currentTeacher?.subscription ||
    (currentTeacher?.id ? getUserSubscription(currentTeacher.id) : null) ||
    (currentTeacher?.loginId ? getUserSubscription(currentTeacher.loginId) : null);

  const studentSub =
    currentStudent?.subscription ||
    (currentStudent?.id ? getUserSubscription(currentStudent.id) : null) ||
    (currentStudent?.loginId ? getUserSubscription(currentStudent.loginId) : null);

  const activeSub = currentRole === 'teacher' ? teacherSub : currentRole === 'student' ? studentSub : null;

  let daysLeft: number | null = activeSub ? getDaysRemaining(activeSub) : null;
  if (daysLeft === null && currentRole === 'teacher' && currentTeacher?.validityDays && currentTeacher.validityDays > 0) {
    const startMs = currentTeacher.recruitedAt ? new Date(currentTeacher.recruitedAt).getTime() : Date.now();
    const expMs = startMs + currentTeacher.validityDays * 24 * 60 * 60 * 1000;
    daysLeft = Math.max(0, Math.ceil((expMs - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  const isExpiringSoon = daysLeft !== null && daysLeft <= 5;
  const showValidityPill = currentRole === 'teacher' || (currentRole === 'student' && daysLeft !== null);

  return (
    <motion.header
      className="navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-container">
        {/* Left: Mobile Toggle & Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onOpenMobileSidebar && (
            <button
              type="button"
              className="navbar-mobile-toggle-btn"
              onClick={onOpenMobileSidebar}
              title="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>
          )}

          <div className="navbar-brand">
            <motion.img
              src="/logo.png"
              alt="Cadets Coaching Academy CCA Crest"
              className="brand-crest-img"
              whileHover={{ scale: 1.08, rotate: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            />
            <div>
              <div className="brand-title">CADETS COACHING ACADEMY</div>
              <div className="brand-subtitle">
                {currentRole === 'developer' && 'Master Developer & System Root Control'}
                {currentRole === 'admin' && 'Executive Administration Command'}
                {currentRole === 'teacher' && 'Faculty Portal & Examination Center'}
                {currentRole === 'student' && 'Student Portal & Examination Desk'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Validity Badge (Mobile), Live Sync, User Identity & Log Out */}
        <div className="navbar-right-container" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Dedicated Mobile/Tablet Validity Pill */}
          {showValidityPill && (
            <button
              type="button"
              className={`nav-validity-pill ${
                daysLeft === null ? 'is-lifetime' : isExpiringSoon ? 'is-warning' : 'is-active'
              }`}
              onClick={onOpenPlanPortal}
              title={
                activeSub?.expiryDate
                  ? `Pass valid until ${new Date(activeSub.expiryDate).toLocaleDateString()} — Tap to view or extend`
                  : 'Permanent Institutional Pass'
              }
            >
              <span className="nav-validity-icon">
                {daysLeft === null ? <Sparkles size={12} /> : <Clock size={12} />}
              </span>
              <span className="nav-validity-info">
                <span className="nav-validity-value">
                  {daysLeft !== null ? `${daysLeft}d Left` : 'Lifetime'}
                </span>
                <span className="nav-validity-sub">
                  {daysLeft !== null ? 'Validity' : 'Faculty Pass'}
                </span>
              </span>
            </button>
          )}

          {/* Live Sync Pulse Chip */}
          <div
            className="live-sync-chip"
            title="Real-time multi-tab & cross-window live proctoring synchronization active"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(22, 56, 38, 0.4)',
              border: '1px solid rgba(184, 226, 203, 0.25)',
              fontSize: '0.72rem',
              color: '#86efac',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
                animation: 'ccapPulseTimer 2s infinite',
              }}
            />
            <span className="live-sync-text">LIVE SYNC</span>
          </div>

          {/* Cloud Firestore Sync Chip */}
          <div
            className="firestore-sync-chip"
            title="Cloud Firestore: connected to project ccap-testportal. Real-time cloud sync active."
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '0.72rem',
              color: '#38bdf8',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <Cloud size={12} />
            <span className="live-sync-text">FIRESTORE</span>
          </div>

          {/* User Identity Chip */}
          <div className="nav-user-profile">
            <div
              className="nav-user-avatar"
              style={{
                background:
                  currentRole === 'developer'
                    ? '#7c3aed'
                    : currentRole === 'admin'
                    ? '#0b1728'
                    : currentRole === 'teacher'
                    ? '#163826'
                    : '#1d4ed8',
                borderColor:
                  currentRole === 'developer'
                    ? '#c4b5fd'
                    : currentRole === 'admin'
                    ? '#d4af37'
                    : currentRole === 'teacher'
                    ? '#a6e9c1'
                    : '#93c5fd',
                overflow: 'hidden',
              }}
            >
              {googlePicture ? (
                <img
                  src={googlePicture}
                  alt="Google Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : currentRole === 'developer' ? (
                <Code size={14} />
              ) : currentRole === 'admin' ? (
                <Shield size={14} />
              ) : currentRole === 'teacher' ? (
                <UserCheck size={14} />
              ) : (
                <GraduationCap size={14} />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                  {currentRole === 'developer' && 'Master Developer'}
                  {currentRole === 'admin' && 'Executive Admin'}
                  {currentRole === 'teacher' && (currentTeacher?.name || 'Faculty Teacher')}
                  {currentRole === 'student' && (currentStudent?.name || 'Student')}
                </span>
                {googleEmail && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.62rem',
                      background: 'rgba(255, 255, 255, 0.15)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      color: '#ffffff',
                      marginLeft: '0.35rem',
                    }}
                    title={`Google Account: ${googleEmail}`}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Google
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.68rem', color: '#e5c158', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {currentRole === 'developer' && 'Root Authority'}
                {currentRole === 'admin' && 'Academy Administrator'}
                {currentRole === 'teacher' && <span>Faculty • {currentTeacher?.loginId || ''}</span>}
                {currentRole === 'student' && `${currentStudent?.className || 'Class'} • Login ID: ${currentStudent?.loginId || ''}`}
              </span>
            </div>
          </div>

          {/* Log Out Button */}
          {onLogout && (
            <motion.button
              className="nav-logout-btn"
              onClick={onLogout}
              title="Log Out of Portal"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

