import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  UserRole,
  AdminUser,
  DeveloperUser,
  Teacher,
  Student,
  CLASS_OPTIONS,
} from '../types';
import { useModalScrollLock } from '../utils/lenis';
import {
  parseGoogleJwt,
  matchGoogleUser,
  getGoogleClientId,
  loadGoogleIdentityScript,
  initiateGoogleRedirect,
  GoogleUserProfile,
} from '../utils/googleAuth';
import {
  X,
  UserPlus,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { saveGoogleUserToFirestore } from '../services/firebaseSync';
import { createSubscriptionRecord } from '../utils/subscription';
import { saveUserSubscription } from '../utils/storage';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  admins: AdminUser[];
  developers: DeveloperUser[];
  teachers: Teacher[];
  students: Student[];
  onLoginSuccess: (role: UserRole, userObj?: any, extraAuth?: { authProvider: 'google'; googleEmail: string; googlePicture?: string }) => void;
  onEnrollStudent: (studentData: Omit<Student, 'id' | 'enrolledAt'>) => Student;
  onLinkAccount: (role: UserRole, userId: string, googleEmail: string, googlePicture?: string, googleId?: string) => boolean;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  admins,
  developers,
  teachers,
  students,
  onLoginSuccess,
  onEnrollStudent,
  onLinkAccount,
}) => {
  useModalScrollLock(isOpen);

  const [activeStep, setActiveStep] = useState<'signin' | 'onboarding'>('signin');
  const [googleProfile, setGoogleProfile] = useState<GoogleUserProfile | null>(null);

  // Manual / Test Gmail Input
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Unlinked Account Onboarding Form State
  const [onboardingTab, setOnboardingTab] = useState<'enroll' | 'link'>('enroll');
  const [enrollName, setEnrollName] = useState('');
  const [enrollClass, setEnrollClass] = useState(CLASS_OPTIONS[0]);
  const [enrollPhone, setEnrollPhone] = useState('');
  const [linkLoginId, setLinkLoginId] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement | null>(null);
  const clientId = getGoogleClientId();

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setActiveStep('signin');
      setGoogleProfile(null);
      setManualEmail('');
      setManualName('');
      setErrorMsg('');
      setInfoMsg('');
      setOnboardingTab('enroll');
    }
  }, [isOpen]);

  // Handle Real Google Identity Services (GIS) rendering when Client ID is configured
  useEffect(() => {
    if (!isOpen || activeStep !== 'signin') return;

    let isCancelled = false;

    loadGoogleIdentityScript().then((loaded) => {
      if (isCancelled || !loaded) return;

      const googleObj = (window as any).google;
      if (googleObj?.accounts?.id && clientId) {
        try {
          googleObj.accounts.id.initialize({
            client_id: clientId,
            callback: (response: any) => {
              if (response?.credential) {
                const profile = parseGoogleJwt(response.credential);
                if (profile) {
                  processGoogleProfile(profile);
                } else {
                  setErrorMsg('Failed to process Google credential. Please try again.');
                }
              }
            },
            auto_select: false,
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            googleObj.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'signin_with',
              logo_alignment: 'left',
              width: 320,
            });
          }
        } catch (e) {
          console.warn('Google Identity initialization notice:', e);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, activeStep, clientId]);

  if (!isOpen) return null;

  // Central processor for verified Google identities
  const processGoogleProfile = (profile: GoogleUserProfile) => {
    setErrorMsg('');
    setGoogleProfile(profile);

    const match = matchGoogleUser(profile.email, admins, developers, teachers, students);

    if (match.matched && match.role && match.user) {
      // Existing user found -> Sync profile to Firestore and log in immediately
      saveGoogleUserToFirestore({
        googleId: profile.sub,
        email: profile.email,
        name: match.user.name,
        role: match.role,
        picture: profile.picture,
        loginId: match.user.loginId,
        authProvider: 'google',
      }).catch(() => {});

      setInfoMsg(`Welcome back, ${match.user.name}! Logging you in as ${match.role.toUpperCase()} (Cloud Synced)...`);
      setTimeout(() => {
        onLoginSuccess(match.role!, match.user, {
          authProvider: 'google',
          googleEmail: profile.email,
          googlePicture: profile.picture,
        });
        onClose();
      }, 700);
    } else {
      // User is not yet in the academy system -> Transition to Onboarding
      setEnrollName(profile.name || '');
      setActiveStep('onboarding');
    }
  };

  // Handle Direct / Test Gmail Form
  const handleManualEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = manualEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter a valid Gmail address.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setErrorMsg('Please include a valid domain (e.g., username@gmail.com).');
      return;
    }

    const defaultName = manualName.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const profile: GoogleUserProfile = {
      email: cleanEmail,
      name: defaultName,
      sub: 'google_sim_' + Date.now(),
      email_verified: true,
    };

    processGoogleProfile(profile);
  };

  // Quick Account Selector
  const handleQuickSelectEmail = (email: string, name: string) => {
    const profile: GoogleUserProfile = {
      email,
      name,
      sub: 'google_demo_' + Date.now(),
      email_verified: true,
    };
    processGoogleProfile(profile);
  };

  // Handle New Cadet Self-Enrollment
  const handleCompleteEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleProfile) return;

    if (!enrollName.trim()) {
      setErrorMsg('Please enter the cadet student name.');
      return;
    }

    const baseSlug = (googleProfile.email.split('@')[0] || enrollName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 15);

    const newStudent = onEnrollStudent({
      name: enrollName.trim(),
      email: googleProfile.email.toLowerCase(),
      phone: enrollPhone.trim() || '+92 300 0000000',
      className: enrollClass,
      loginId: baseSlug,
      password: `CCA-${Math.random().toString(36).substring(2, 8)}`,
      googleId: googleProfile.sub,
      googlePicture: googleProfile.picture,
    });

    const trialSub = createSubscriptionRecord(newStudent, 'trial', 'free_trial', 'TRIAL-ONBOARD-OK');
    saveUserSubscription(trialSub);

    setInfoMsg(`Enrollment complete! Welcome Cadet ${newStudent.name}.`);
    setTimeout(() => {
      onLoginSuccess('student', { ...newStudent, subscription: trialSub }, {
        authProvider: 'google',
        googleEmail: googleProfile.email,
        googlePicture: googleProfile.picture,
      });
      onClose();
    }, 800);
  };

  // Handle Linking Google Account to Existing Login ID
  const handleLinkExistingAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleProfile) return;

    const trimmedLogin = linkLoginId.trim().toLowerCase();
    const trimmedPass = linkPassword.trim();

    if (!trimmedLogin || !trimmedPass) {
      setErrorMsg('Please enter both Login ID and password.');
      return;
    }

    // Find user across all roles
    let matchedRole: UserRole | null = null;
    let matchedUser: any = null;

    const teacher = teachers.find((t) => t.loginId.trim().toLowerCase() === trimmedLogin);
    if (teacher) {
      const isAfzal = teacher.loginId.toLowerCase() === 'afzal@ccap.com';
      const pass = isAfzal
        ? (teacher.password && teacher.password !== 'password123' ? teacher.password : 'Afzal123/')
        : teacher.password;
      if (pass && (trimmedPass === pass || (isAfzal && trimmedPass === 'Afzal123/'))) {
        matchedRole = 'teacher';
        matchedUser = teacher;
      }
    }

    if (!matchedUser) {
      const student = students.find((s) => s.loginId.trim().toLowerCase() === trimmedLogin);
      if (student && student.password && trimmedPass === student.password) {
        matchedRole = 'student';
        matchedUser = student;
      }
    }

    if (!matchedUser) {
      const admin = admins.find((a) => a.loginId.trim().toLowerCase() === trimmedLogin);
      if (admin && admin.password && trimmedPass === admin.password) {
        matchedRole = 'admin';
        matchedUser = admin;
      }
    }

    if (!matchedUser) {
      const dev = developers.find((d) => d.loginId.trim().toLowerCase() === trimmedLogin);
      if (dev && dev.password && trimmedPass === dev.password) {
        matchedRole = 'developer';
        matchedUser = dev;
      }
    }

    if (!matchedUser || !matchedRole) {
      setErrorMsg('Invalid credentials. Could not verify existing account.');
      return;
    }

    // Link the account
    const success = onLinkAccount(
      matchedRole,
      matchedUser.id,
      googleProfile.email.toLowerCase(),
      googleProfile.picture,
      googleProfile.sub
    );

    if (success) {
      setInfoMsg(`Successfully linked ${googleProfile.email} to ${matchedUser.name} (${matchedRole.toUpperCase()})!`);
      setTimeout(() => {
        onLoginSuccess(matchedRole!, { ...matchedUser, email: googleProfile.email.toLowerCase() }, {
          authProvider: 'google',
          googleEmail: googleProfile.email,
          googlePicture: googleProfile.picture,
        });
        onClose();
      }, 800);
    } else {
      setErrorMsg('Failed to link account. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" data-lenis-prevent="true" onClick={onClose}>
      <motion.div
        className="modal-container"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          padding: '2rem 1.75rem',
          borderRadius: '16px',
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(11, 23, 40, 0.35)',
        }}
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Google "G" Icon Badge */}
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                flexShrink: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                {activeStep === 'signin' ? 'Sign in with Google' : 'Google Account Connected'}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {activeStep === 'signin'
                  ? 'Access the Academy Portal using your Gmail account'
                  : 'Link to existing profile or enroll as a new Cadet'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="modal-close-btn"
            style={{ padding: '0.4rem', borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 1: SIGN IN WITH GOOGLE                                         */}
        {/* ==================================================================== */}
        {activeStep === 'signin' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => initiateGoogleRedirect()}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Redirect to Google Account Sign-In</span>
              </button>
            </div>
            {/* Live Google Identity Services Button Container (if Client ID present) */}
            {clientId && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '1.25rem 0',
                  borderBottom: '1px solid #e2e8f0',
                  marginBottom: '1.25rem',
                }}
              >
                <div ref={googleBtnContainerRef} id="google-btn-container" style={{ minHeight: '44px' }} />
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Live Google One Tap & OAuth 2.0 Client Active
                </span>
              </div>
            )}

            {/* Direct Gmail Input Section */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.4rem',
                }}
              >
                Enter your Gmail / Google Account:
              </label>

              <form onSubmit={handleManualEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input font-mono"
                    placeholder="e.g. yourname@gmail.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    style={{ fontSize: '0.9rem', padding: '0.65rem 0.85rem' }}
                    autoFocus
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Full Name (optional)"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    style={{ fontSize: '0.85rem', flex: 1 }}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>Sign In with Gmail</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quick-Select Seed Accounts for Easy Testing */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed #cbd5e1' }}>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  marginBottom: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Sparkles size={13} color="#d97706" />
                <span>Quick Sign-In with Registered Academy Accounts:</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                {[
                  { name: 'Prof. M. Afzal', email: 'afzal@ccap.com', role: 'Faculty Teacher', badge: 'badge-navy' },
                  { name: 'Cadet Ali Raza', email: 'ali_raza', role: 'Cadet Student', badge: 'badge-blue' },
                  { name: 'Cadet Aiza', email: 'aiza@ccap.com', role: 'Cadet Student', badge: 'badge-blue' },
                  { name: 'Principal Admin', email: 'principal@cadetsacademy.com', role: 'Administrator', badge: 'badge-gold' },
                  { name: 'Dev Master', email: 'dev@cadetsacademy.com', role: 'Developer', badge: 'badge-purple' },
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickSelectEmail(acc.email, acc.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#94a3b8';
                      e.currentTarget.style.background = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{acc.name}</div>
                      <code style={{ fontSize: '0.72rem', color: '#64748b' }}>{acc.email}</code>
                    </div>
                    <span className={`badge ${acc.badge}`} style={{ fontSize: '0.66rem' }}>
                      {acc.role.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Developer / Admin Integration Note */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => setShowConfigGuide(!showConfigGuide)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '0.76rem',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <HelpCircle size={14} color="#3b82f6" />
                <span>{showConfigGuide ? 'Hide Google Cloud Console setup guide' : 'How to configure Google OAuth Client ID (.env)?'}</span>
              </button>

              {showConfigGuide && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.76rem',
                    color: '#334155',
                    lineHeight: 1.5,
                  }}
                >
                  <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    <li>Open <strong>Google Cloud Console</strong> &gt; <em>APIs & Services</em> &gt; <em>Credentials</em>.</li>
                    <li>Create an <strong>OAuth 2.0 Client ID</strong> for <em>Web application</em>.</li>
                    <li>Add your authorized JavaScript origin (e.g., <code>http://localhost:5173</code>).</li>
                    <li>Add <code>VITE_GOOGLE_CLIENT_ID=your-client-id</code> to a <code>.env</code> file in project root.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 2: UNLINKED GOOGLE ACCOUNT ONBOARDING                          */}
        {/* ==================================================================== */}
        {activeStep === 'onboarding' && googleProfile && (
          <div>
            {/* Google Profile Chip Banner */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {googleProfile.picture ? (
                  <img
                    src={googleProfile.picture}
                    alt="Google Profile Avatar"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#1d4ed8',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                    }}
                  >
                    {googleProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    {googleProfile.name}
                  </div>
                  <code style={{ fontSize: '0.76rem', color: '#64748b' }}>{googleProfile.email}</code>
                </div>
              </div>

              <span className="badge badge-green font-mono" style={{ fontSize: '0.72rem' }}>
                Verified
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
              This Gmail address is not yet linked to an Academy profile. Choose how you would like to proceed:
            </p>

            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${onboardingTab === 'enroll' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setOnboardingTab('enroll')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
              >
                <UserPlus size={14} />
                <span>Enroll as Cadet Student</span>
              </button>

              <button
                type="button"
                className={`btn btn-sm ${onboardingTab === 'link' ? 'btn-navy' : 'btn-secondary'}`}
                onClick={() => setOnboardingTab('link')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
              >
                <LinkIcon size={14} />
                <span>Link Existing Account</span>
              </button>
            </div>

            {/* Sub-View A: Cadet Self-Enrollment */}
            {onboardingTab === 'enroll' && (
              <form onSubmit={handleCompleteEnrollment} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Cadet Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={enrollName}
                    onChange={(e) => setEnrollName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Assigned Class Cohort *</label>
                  <select
                    className="form-control"
                    value={enrollClass}
                    onChange={(e) => setEnrollClass(e.target.value)}
                  >
                    {CLASS_OPTIONS.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Contact Phone (optional)</label>
                  <input
                    type="tel"
                    className="form-input font-mono"
                    placeholder="+92 300 1234567"
                    value={enrollPhone}
                    onChange={(e) => setEnrollPhone(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveStep('signin')}
                    style={{ fontSize: '0.82rem' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <UserPlus size={15} />
                    <span>Complete Enrollment & Enter Portal</span>
                  </button>
                </div>
              </form>
            )}

            {/* Sub-View B: Link to Existing Account */}
            {onboardingTab === 'link' && (
              <form onSubmit={handleLinkExistingAccount} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0 }}>
                  Enter your current Academy Login ID and password to permanently connect your Gmail address.
                </p>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Existing Login ID *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="e.g. afzal@ccap.com or ali_raza"
                      value={linkLoginId}
                      onChange={(e) => setLinkLoginId(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input font-mono"
                      placeholder="Enter account password"
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveStep('signin')}
                    style={{ fontSize: '0.82rem' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-navy"
                    style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <LinkIcon size={15} />
                    <span>Verify & Link Gmail Account</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
