import React, { useState, useEffect, useRef } from 'react';
import { Student, CLASS_OPTIONS } from '../types';
import { useModalScrollLock } from '../utils/lenis';
import { X, UserPlus, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { checkLoginIdConflictAcrossAll, getStudents } from '../utils/storage';
import { normalizeEmail } from '../utils/googleAuth';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (student: Omit<Student, 'id' | 'enrolledAt'>) => void;
  teacherId?: string;
  editingStudent?: Student | null;
  initialClass?: string;
  availableClasses?: string[];
}

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  isOpen,
  onClose,
  onEnroll,
  teacherId,
  editingStudent,
  initialClass,
  availableClasses = CLASS_OPTIONS,
}) => {
  useModalScrollLock(isOpen);
  const classList = availableClasses.length > 0 ? availableClasses : CLASS_OPTIONS;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [className, setClassName] = useState(initialClass || classList[0]);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginIdManuallyEdited, setIsLoginIdManuallyEdited] = useState(false);
  const [loginIdError, setLoginIdError] = useState<string | null>(null);
  const [detectedExistingStudent, setDetectedExistingStudent] = useState<Student | null>(null);

  const prevIsOpenRef = useRef(false);
  const prevEditingIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      return;
    }

    const justOpened = isOpen && !prevIsOpenRef.current;
    const editingIdChanged = (editingStudent?.id || '') !== (prevEditingIdRef.current || '');

    // Only populate or reset when the modal actually transitions from closed to open,
    // OR when the target editing student changes. NEVER wipe fields during active typing!
    if (justOpened || editingIdChanged) {
      if (editingStudent) {
        setName(editingStudent.name);
        setEmail(editingStudent.email || '');
        setPhone(editingStudent.phone || '');
        setClassName(editingStudent.className || initialClass || classList[0]);
        setLoginId(editingStudent.loginId);
        setPassword(editingStudent.password || '');
        setIsLoginIdManuallyEdited(true);
        setLoginIdError(null);
        setDetectedExistingStudent(null);
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setClassName(initialClass || classList[0]);
        setLoginId('');
        setPassword('');
        setIsLoginIdManuallyEdited(false);
        setLoginIdError(null);
        setDetectedExistingStudent(null);
      }
    }

    prevIsOpenRef.current = true;
    prevEditingIdRef.current = editingStudent?.id;
  }, [isOpen, editingStudent?.id]);

  const validateLoginId = (val: string) => {
    const clean = val.trim().toLowerCase();
    if (!clean) {
      setLoginIdError(null);
      return;
    }
    const excludeId =
      editingStudent?.id ||
      (detectedExistingStudent && clean === detectedExistingStudent.loginId.toLowerCase()
        ? detectedExistingStudent.id
        : undefined);
    const conflict = checkLoginIdConflictAcrossAll(clean, excludeId);
    if (conflict.isTaken) {
      setLoginIdError(`Username already taken (${conflict.roleName}: ${conflict.existingName}). Please choose a unique Login ID.`);
    } else {
      setLoginIdError(null);
    }
  };

  // Auto-detect existing cadet by email address
  const handleEmailChange = (val: string) => {
    setEmail(val);
    const clean = val.trim().toLowerCase();
    if (!editingStudent && clean && clean.includes('@')) {
      const allStudents = getStudents();
      const norm = normalizeEmail(clean);
      const matched = allStudents.find(
        (s) =>
          s.email && (s.email.toLowerCase() === clean || normalizeEmail(s.email) === norm)
      );
      if (matched) {
        setDetectedExistingStudent(matched);
        if (!name.trim()) setName(matched.name);
        if (!phone.trim() && matched.phone) setPhone(matched.phone);
        if (!loginId.trim()) {
          setLoginId(matched.loginId);
          setLoginIdError(null);
        }
      } else {
        setDetectedExistingStudent(null);
      }
    } else if (!clean) {
      setDetectedExistingStudent(null);
    }
  };

  // Auto-generate a login ID when user types name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingStudent && !isLoginIdManuallyEdited && val) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 15);
      setLoginId(slug);
      validateLoginId(slug);
    }
  };

  const handleLoginIdChange = (val: string) => {
    setLoginId(val);
    setIsLoginIdManuallyEdited(true);
    validateLoginId(val);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !loginId.trim()) {
      alert('Please enter student name and login ID.');
      return;
    }

    const cleanLogin = loginId.trim().toLowerCase();
    const excludeId =
      editingStudent?.id ||
      (detectedExistingStudent && cleanLogin === detectedExistingStudent.loginId.toLowerCase()
        ? detectedExistingStudent.id
        : undefined);
    const conflict = checkLoginIdConflictAcrossAll(cleanLogin, excludeId);
    if (conflict.isTaken) {
      setLoginIdError(`Username already taken (${conflict.roleName}: ${conflict.existingName}). Please choose a unique Login ID.`);
      alert(`Username already taken. The Login ID "${loginId}" is already taken by ${conflict.roleName} (${conflict.existingName}). Please choose a unique Login ID.`);
      return;
    }

    const finalPassword = password.trim() || editingStudent?.password || '';

    onEnroll({
      name: name.trim(),
      email: email.trim().toLowerCase() || (cleanLogin.includes('@') ? cleanLogin : undefined),
      phone: phone.trim(),
      className,
      loginId: cleanLogin,
      password: finalPassword,
      enrolledByTeacherId: teacherId,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" data-lenis-prevent="true" onClick={onClose}>
      <div className="modal-container" data-lenis-prevent="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserPlus size={20} color="var(--accent-gold)" />
            <h3>{editingStudent ? 'Edit Student Profile' : 'Enroll New Student'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" data-lenis-prevent="true">
            <div className="form-group">
              <label className="form-label">Student Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ali Raza"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Email login highlighting */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                marginBottom: '1rem',
                fontSize: '0.78rem',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Sparkles size={16} style={{ flexShrink: 0, color: '#15803d' }} />
              <span>
                <strong>Mail Login:</strong> When you provide the student's email, the student can simply log in with their email address (or via Google) to access this profile and your examinations without remembering complicated IDs.
              </span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student Email Address (for Email & Google Login)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. cadet.ali@gmail.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Class / Section *</label>
              <input
                type="text"
                list="enroll-class-suggestions"
                className="form-input"
                placeholder="e.g. Class 8, Class 9&10, Grade 9"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />
              {classList.length > 0 && (
                <datalist id="enroll-class-suggestions">
                  {classList.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student Login ID *</label>
                <input
                  type="text"
                  className={`form-input ${loginIdError ? 'border-red-500' : ''}`}
                  style={loginIdError ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                  placeholder="e.g. ali_raza or aiza@ccap.com"
                  value={loginId}
                  onChange={(e) => handleLoginIdChange(e.target.value)}
                  required
                />
                {loginIdError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b91c1c', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>
                    <AlertCircle size={13} />
                    <span>{loginIdError}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{editingStudent ? 'Password (leave blank to keep current)' : 'Password'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={editingStudent ? 'Leave blank to preserve current' : 'Enter password or leave blank'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {detectedExistingStudent && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  padding: '0.75rem 0.95rem',
                  marginTop: '1rem',
                  fontSize: '0.82rem',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.55rem',
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0, color: '#16a34a', marginTop: '1px' }} />
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                    Existing Cadet Profile Located ({detectedExistingStudent.name} • {detectedExistingStudent.loginId})
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#166534', lineHeight: 1.4 }}>
                    Enrolling will add <strong>{className}</strong> to this cadet's profile while preserving all previous test scores, submissions, accuracy stats, and credentials.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingStudent ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
