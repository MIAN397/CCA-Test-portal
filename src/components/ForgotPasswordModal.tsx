import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  KeyRound,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  getStudents,
  getTeachers,
  getAdmins,
  getDevelopers,
  updateStudent,
  updateTeacher,
  updateAdmin,
  updateDeveloper,
} from '../utils/storage';
import {
  fetchStudentByEmailFromFirestore,
  fetchProfileByLoginId,
  fetchAllProfilesFromFirestore,
  syncProfileToFirestore,
} from '../services/firebaseSync';
import { normalizeEmail, isGmailAddress } from '../utils/googleAuth';
import { generateOtpCode, sendOtpEmail, maskEmail } from '../services/emailService';
import { UserRole } from '../types';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordResetSuccess?: (loginId: string) => void;
  initialIdentifier?: string;
}

type ResetStep = 'request_code' | 'verify_code' | 'new_password' | 'success';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onPasswordResetSuccess,
  initialIdentifier = '',
}) => {
  const [step, setStep] = useState<ResetStep>('request_code');
  const [identifier, setIdentifier] = useState(initialIdentifier || '');
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [matchedRole, setMatchedRole] = useState<UserRole>('student');
  const [targetEmail, setTargetEmail] = useState('');

  // OTP State
  const [otpInput, setOtpInput] = useState('');
  const [activeOtp, setActiveOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  // New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDevSimulation, setIsDevSimulation] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('request_code');
      setIdentifier(initialIdentifier || '');
      setMatchedUser(null);
      setTargetEmail('');
      setOtpInput('');
      setActiveOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
      setIsDevSimulation(false);
    }
  }, [isOpen, initialIdentifier]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendCooldown]);

  if (!isOpen) return null;

  // --- STEP 1: Find Account & Dispatch OTP ---
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanInput = identifier.trim().toLowerCase();
    if (!cleanInput) {
      setErrorMsg('Please enter your Cadet Login ID or registered personal Gmail address.');
      return;
    }

    setIsLoading(true);

    try {
      const normInput = cleanInput.includes('@') ? normalizeEmail(cleanInput) : '';

      // 1. Search Local Storage across all user types
      const allStudents = getStudents();
      const allTeachers = getTeachers();
      const allAdmins = getAdmins();
      const allDevs = getDevelopers();

      let found: any = null;
      let role: UserRole = 'student';

      // Check student first (primary audience)
      found = allStudents.find((s) => {
        const sLogin = (s.loginId || '').trim().toLowerCase();
        const sEmail = (s.email || '').trim().toLowerCase();
        if (sLogin === cleanInput) return true;
        if (cleanInput.includes('@') && sEmail) {
          return sEmail === cleanInput || (normInput && normalizeEmail(sEmail) === normInput);
        }
        return false;
      });
      if (found) role = 'student';

      // Check teacher
      if (!found) {
        found = allTeachers.find((t) => {
          const tLogin = (t.loginId || '').trim().toLowerCase();
          const tEmail = (t.email || '').trim().toLowerCase();
          if (tLogin === cleanInput) return true;
          if (cleanInput.includes('@') && tEmail) {
            return tEmail === cleanInput || (normInput && normalizeEmail(tEmail) === normInput);
          }
          return false;
        });
        if (found) role = 'teacher';
      }

      // Check admin
      if (!found) {
        found = allAdmins.find((a) => {
          const aLogin = (a.loginId || '').trim().toLowerCase();
          const aEmail = (a.email || '').trim().toLowerCase();
          if (aLogin === cleanInput) return true;
          if (cleanInput.includes('@') && aEmail) {
            return aEmail === cleanInput || (normInput && normalizeEmail(aEmail) === normInput);
          }
          return false;
        });
        if (found) role = 'admin';
      }

      // Check developer
      if (!found) {
        found = allDevs.find((d) => {
          const dLogin = (d.loginId || '').trim().toLowerCase();
          const dEmail = (d.email || '').trim().toLowerCase();
          if (dLogin === cleanInput) return true;
          if (cleanInput.includes('@') && dEmail) {
            return dEmail === cleanInput || (normInput && normalizeEmail(dEmail) === normInput);
          }
          return false;
        });
        if (found) role = 'developer';
      }

      // 2. Search Cloud Firestore if not found locally (or if local record lacks a personal email)
      const localHasPersonalEmail =
        found?.email &&
        found.email.includes('@') &&
        !found.email.trim().toLowerCase().endsWith('@ccap.com');

      if (!found || !localHasPersonalEmail) {
        try {
          let cloudFound: any = null;
          let cloudRole: UserRole = role;

          if (!cleanInput.includes('@')) {
            const cloudByLogin = await fetchProfileByLoginId(cleanInput);
            if (cloudByLogin) {
              cloudFound = cloudByLogin;
              cloudRole = (cloudByLogin.role as UserRole) || role;
            }
          } else {
            const cloudByEmail = await fetchStudentByEmailFromFirestore(cleanInput);
            if (cloudByEmail) {
              cloudFound = cloudByEmail;
              cloudRole = (cloudByEmail.role as UserRole) || role;
            }
          }

          if (!cloudFound) {
            const allCloud = await fetchAllProfilesFromFirestore();
            cloudFound = allCloud.find((p) => {
              const pLogin = (p.loginId || '').trim().toLowerCase();
              const pEmail = (p.email || '').trim().toLowerCase();
              if (pLogin === cleanInput) return true;
              if (cleanInput.includes('@') && pEmail) {
                return pEmail === cleanInput || (normInput && normalizeEmail(pEmail) === normInput);
              }
              return false;
            });
            if (cloudFound) {
              cloudRole = (cloudFound.role as UserRole) || role;
            }
          }

          if (cloudFound) {
            found = found ? { ...found, ...cloudFound, email: cloudFound.email || found.email } : cloudFound;
            role = (cloudFound.role as UserRole) || cloudRole;
          }
        } catch {
          // Offline fallback
        }
      }

      if (!found) {
        setErrorMsg(
          cleanInput.includes('@')
            ? `No cadet account was found registered with email "${cleanInput}". Please verify spelling or try your Cadet Login ID.`
            : `No cadet account was found with Login ID "${cleanInput}". Please verify your Login ID or try your personal Gmail.`
        );
        setIsLoading(false);
        return;
      }

      // 3. Extract the personal mail on which the ID / account was made
      let resolvedTargetEmail = '';
      const linkedEmail = (found.email || '').trim().toLowerCase();

      if (cleanInput.includes('@') && isGmailAddress(cleanInput)) {
        resolvedTargetEmail = cleanInput;
      } else if (linkedEmail && isGmailAddress(linkedEmail)) {
        resolvedTargetEmail = linkedEmail;
      } else if (linkedEmail && linkedEmail.includes('@') && !linkedEmail.endsWith('@ccap.com')) {
        resolvedTargetEmail = linkedEmail;
      }

      if (!resolvedTargetEmail) {
        setErrorMsg(
          `Account found for "${found.name}" (Login ID: ${found.loginId}), but no personal Gmail address is linked to this account. Institutional login emails (@ccap.com) cannot receive security codes. Please contact your academy instructor.`
        );
        setIsLoading(false);
        return;
      }

      // Generate & Dispatch OTP
      const otp = generateOtpCode();
      const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

      setMatchedUser(found);
      setMatchedRole(role);
      setTargetEmail(resolvedTargetEmail);
      setActiveOtp(otp);
      setOtpExpiresAt(expires);

      const emailResult = await sendOtpEmail({
        toEmail: resolvedTargetEmail,
        recipientName: found.name || 'Cadet Candidate',
        otpCode: otp,
      });

      if (!emailResult.success) {
        setErrorMsg(emailResult.error || 'Failed to dispatch verification email. Please try again.');
        setIsLoading(false);
        return;
      }

      setIsDevSimulation(!!emailResult.isDevSimulation);
      setResendCooldown(60);
      setStep('verify_code');
      setSuccessMsg(
        `A 6-digit verification code has been dispatched to ${maskEmail(resolvedTargetEmail)} (registered personal email for Cadet ${found.name}).`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while searching for your account.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RESEND OTP ---
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !matchedUser || !targetEmail) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const newOtp = generateOtpCode();
      const expires = Date.now() + 10 * 60 * 1000;

      setActiveOtp(newOtp);
      setOtpExpiresAt(expires);

      const emailResult = await sendOtpEmail({
        toEmail: targetEmail,
        recipientName: matchedUser.name || 'Cadet Candidate',
        otpCode: newOtp,
      });

      if (emailResult.success) {
        setIsDevSimulation(!!emailResult.isDevSimulation);
        setResendCooldown(60);
        setSuccessMsg(`A fresh verification code has been sent to ${maskEmail(targetEmail)}.`);
      } else {
        setErrorMsg(emailResult.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: Verify OTP ---
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedInput = otpInput.trim().replace(/\D/g, '');
    if (trimmedInput.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    if (Date.now() > otpExpiresAt) {
      setErrorMsg('This verification code has expired (10-minute limit). Please click "Resend Code".');
      return;
    }

    if (trimmedInput !== activeOtp) {
      setErrorMsg('Incorrect verification code. Please check your Gmail inbox and try again.');
      return;
    }

    // OTP Verified successfully!
    setStep('new_password');
  };

  // --- STEP 3: Save New Password ---
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (trimmedNew.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setErrorMsg('Passwords do not match. Please re-enter matching passwords.');
      return;
    }

    setIsLoading(true);

    try {
      const updatedUser = {
        ...matchedUser,
        password: trimmedNew,
        updatedAt: new Date().toISOString(),
      };

      // 1. Update local storage
      if (matchedRole === 'student') {
        updateStudent(updatedUser);
      } else if (matchedRole === 'teacher') {
        updateTeacher(updatedUser);
      } else if (matchedRole === 'admin') {
        updateAdmin(updatedUser);
      } else if (matchedRole === 'developer') {
        updateDeveloper(updatedUser);
      }

      // 2. Synchronize to Cloud Firestore immediately
      await syncProfileToFirestore(matchedRole, updatedUser);

      setStep('success');
      setTimeout(() => {
        if (onPasswordResetSuccess) {
          onPasswordResetSuccess(matchedUser.loginId);
        }
        onClose();
      }, 2200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-modal-backdrop" onClick={onClose}>
      <motion.div
        className="forgot-modal-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="forgot-modal-close-btn"
          aria-label="Close"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: 700,
              marginBottom: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <KeyRound size={13} />
            <span>Cadet Identity Recovery</span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            {step === 'request_code' && 'Reset Cadet Password'}
            {step === 'verify_code' && 'Verify 6-Digit Code'}
            {step === 'new_password' && 'Set New Password'}
            {step === 'success' && 'Password Updated!'}
          </h2>

          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            {step === 'request_code' &&
              'Enter your Cadet Login ID (e.g. ali_raza) or your registered personal Gmail to receive an instant verification code.'}
            {step === 'verify_code' &&
              `Enter the 6-digit code sent to ${maskEmail(targetEmail)} to verify account ownership.`}
            {step === 'new_password' &&
              `Create a secure new password for Cadet ${matchedUser?.name || ''}.`}
            {step === 'success' &&
              'Your new password is now active across all devices and portals.'}
          </p>
        </div>

        {/* Visual Multi-Step Progress Indicator */}
        <div className="forgot-modal-stepper">
          <div className={`forgot-step-item ${step === 'request_code' ? 'active' : 'completed'}`}>
            <span className="forgot-step-circle">
              {step === 'request_code' ? '1' : <CheckCircle2 size={13} />}
            </span>
            <span className="forgot-step-label">1. Enter ID or Gmail</span>
          </div>

          <div className={`forgot-step-line ${step === 'verify_code' || step === 'new_password' || step === 'success' ? 'completed' : ''}`} />

          <div className={`forgot-step-item ${step === 'verify_code' ? 'active' : (step === 'new_password' || step === 'success' ? 'completed' : '')}`}>
            <span className="forgot-step-circle">
              {step === 'new_password' || step === 'success' ? <CheckCircle2 size={13} /> : '2'}
            </span>
            <span className="forgot-step-label">2. Verify OTP</span>
          </div>

          <div className={`forgot-step-line ${step === 'new_password' || step === 'success' ? 'completed' : ''}`} />

          <div className={`forgot-step-item ${step === 'new_password' ? 'active' : (step === 'success' ? 'completed' : '')}`}>
            <span className="forgot-step-circle">
              {step === 'success' ? <CheckCircle2 size={13} /> : '3'}
            </span>
            <span className="forgot-step-label">3. Set Password</span>
          </div>
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <motion.div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Success / Info Feedback */}
        {successMsg && (
          <motion.div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* Development Simulation Notice Badge (Visible ONLY in development when no live email service is set) */}
        {isDevSimulation && import.meta.env.DEV && step === 'verify_code' && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1.25rem',
              fontSize: '0.78rem',
              color: '#166534',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '2px' }}>
              <Sparkles size={14} color="#15803d" />
              <span>Dev Preview Notice:</span>
            </div>
            <span>Your OTP code is <strong style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#0f172a' }}>{activeOtp}</strong>. (In production, this code is delivered to the student's personal email inbox).</span>
          </div>
        )}

        {/* --- STEP 1: Request Code Form --- */}
        {step === 'request_code' && (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label
                className="form-label"
                style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.04em', color: '#0f172a' }}
              >
                CADET LOGIN ID OR REGISTERED PERSONAL GMAIL
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. ali_raza or cadet.name@gmail.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoFocus
                  required
                  style={{ paddingLeft: '38px' }}
                />
                <Mail
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
              <p
                style={{
                  fontSize: '0.73rem',
                  color: '#64748b',
                  marginTop: '0.45rem',
                  marginBottom: 0,
                  lineHeight: 1.4,
                }}
              >
                Enter your <strong>Cadet Login ID</strong> (e.g. <code>ali_raza</code>) or your <strong>registered personal Gmail</strong>. We will look up your profile and dispatch a 6-digit verification code to the personal email on which your ID was made.
              </p>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>{isLoading ? 'Searching Profile & Dispatching Code...' : 'Send Verification Code to Personal Email'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* --- STEP 2: Verify Code Form --- */}
        {step === 'verify_code' && (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label
                  className="form-label"
                  style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.04em', color: '#0f172a', margin: 0 }}
                >
                  6-DIGIT VERIFICATION CODE
                </label>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Valid for 10 mins
                </span>
              </div>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="form-input font-mono forgot-otp-input"
                placeholder="123456"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading || otpInput.trim().length !== 6}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <span>Verify Code & Continue</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
              <button
                type="button"
                onClick={() => {
                  setStep('request_code');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px 0',
                  textDecoration: 'underline',
                }}
              >
                Change Gmail Address
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? '#94a3b8' : 'var(--ccap-gold-600, #b45309)',
                  fontWeight: 600,
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <RefreshCw size={12} className={isLoading ? 'spin' : ''} />
                <span>{resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}</span>
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 3: New Password Form --- */}
        {step === 'new_password' && (
          <form onSubmit={handleSaveNewPassword}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label
                className="form-label"
                style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.04em', color: '#0f172a' }}
              >
                NEW PASSWORD (MIN. 6 CHARACTERS)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-input font-mono"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label
                className="form-label"
                style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.04em', color: '#0f172a' }}
              >
                CONFIRM NEW PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input font-mono"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.74rem' }}>
                  {newPassword === confirmPassword ? (
                    <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <CheckCircle2 size={13} /> Passwords match
                    </span>
                  ) : (
                    <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <AlertCircle size={13} /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading || !newPassword || !confirmPassword}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <ShieldCheck size={16} />
              <span>{isLoading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
            </button>
          </form>
        )}

        {/* --- STEP 4: Success View --- */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ display: 'inline-block', marginBottom: '1rem' }}
            >
              <CheckCircle2 size={56} color="#16a34a" />
            </motion.div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Password Reset Successful!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Your account password has been updated and synchronized with Cloud Firestore. Redirecting to sign in...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
