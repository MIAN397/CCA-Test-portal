import React, { useState, useEffect, useRef } from 'react';
import { Teacher } from '../types';
import { useModalScrollLock } from '../utils/lenis';
import { X, UserPlus, Layers, AlertCircle, Clock } from 'lucide-react';
import { checkLoginIdConflictAcrossAll } from '../utils/storage';

interface RecruitTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacherData: Omit<Teacher, 'id' | 'recruitedAt'>) => void;
  editingTeacher?: Teacher | null;
}

export const RecruitTeacherModal: React.FC<RecruitTeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTeacher,
}) => {
  useModalScrollLock(isOpen);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [maxClasses, setMaxClasses] = useState<number>(5);
  const [validityDays, setValidityDays] = useState<number>(30);
  const [loginIdError, setLoginIdError] = useState<string | null>(null);

  const prevIsOpenRef = useRef(false);
  const prevEditingTeacherIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      return;
    }

    const justOpened = isOpen && !prevIsOpenRef.current;
    const editingTeacherChanged = (editingTeacher?.id || '') !== (prevEditingTeacherIdRef.current || '');

    if (justOpened || editingTeacherChanged) {
      if (editingTeacher) {
        setName(editingTeacher.name);
        setEmail(editingTeacher.email);
        setPhone(editingTeacher.phone);
        setLoginId(editingTeacher.loginId);
        setPassword(editingTeacher.password || '');
        setMaxClasses(editingTeacher.maxClasses ?? 5);
        setValidityDays(editingTeacher.validityDays ?? editingTeacher.subscription?.durationDays ?? 30);
        setLoginIdError(null);
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setLoginId('');
        setPassword('');
        setMaxClasses(5);
        setValidityDays(30);
        setLoginIdError(null);
      }
    }

    prevIsOpenRef.current = true;
    prevEditingTeacherIdRef.current = editingTeacher?.id;
  }, [isOpen, editingTeacher?.id]);

  if (!isOpen) return null;

  const handleLoginIdChange = (val: string) => {
    setLoginId(val);
    const clean = val.trim().toLowerCase();
    if (!clean) {
      setLoginIdError(null);
      return;
    }
    const conflict = checkLoginIdConflictAcrossAll(clean, editingTeacher?.id);
    if (conflict.isTaken) {
      setLoginIdError(`Username already taken (${conflict.roleName}: ${conflict.existingName}). Please choose a unique Login ID.`);
    } else {
      setLoginIdError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !loginId.trim()) {
      alert('Please fill in teacher name, email, and login ID.');
      return;
    }

    const cleanLogin = loginId.trim().toLowerCase();
    const conflict = checkLoginIdConflictAcrossAll(cleanLogin, editingTeacher?.id);
    if (conflict.isTaken) {
      setLoginIdError(`Username already taken (${conflict.roleName}: ${conflict.existingName}). Please choose a unique Login ID.`);
      alert(`Username already taken. The Login ID "${loginId}" is already taken by ${conflict.roleName} (${conflict.existingName}). Please choose a unique Login ID.`);
      return;
    }

    const isAfzal = cleanLogin === 'afzal@ccap.com' || email.trim().toLowerCase() === 'afzal@ccap.com';
    let finalPassword = password.trim() || editingTeacher?.password || '';
    if (isAfzal && (!finalPassword || finalPassword === 'password123')) {
      finalPassword = 'Afzal123/';
    }
    if (!finalPassword && !editingTeacher) {
      alert('Please provide a password for this new teacher account.');
      return;
    }

    onSave({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      loginId: cleanLogin,
      password: finalPassword,
      maxClasses: Number(maxClasses) > 0 ? Number(maxClasses) : 5,
      validityDays: Number(validityDays) > 0 ? Number(validityDays) : 30,
      lifetimeClassesCreated: editingTeacher
        ? (editingTeacher.lifetimeClassesCreated !== undefined
            ? editingTeacher.lifetimeClassesCreated
            : (editingTeacher.assignments ? new Set(editingTeacher.assignments.map((a) => a.className)).size : 0))
        : 0,
      assignments: editingTeacher ? editingTeacher.assignments : [],
    });

    onClose();
  };

  return (
    <div className="modal-overlay" data-lenis-prevent="true" onClick={onClose}>
      <div className="modal-container" data-lenis-prevent="true" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserPlus size={20} color="var(--accent-gold)" />
            <h3>{editingTeacher ? 'Edit Teacher Profile' : 'Add New Teacher'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" data-lenis-prevent="true">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teacher Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sir Asad Mahmood"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. asad@cadetsacademy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +92 301 5551122"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teacher Login ID *</label>
                <input
                  type="text"
                  className={`form-input ${loginIdError ? 'border-red-500' : ''}`}
                  style={loginIdError ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                  placeholder="e.g. asad_math or afzal@ccap.com"
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
                <label className="form-label">{editingTeacher ? 'Password (leave blank to keep current)' : 'Password *'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={editingTeacher ? 'Leave blank to preserve current' : 'Enter account password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingTeacher}
                />
              </div>
            </div>

            {/* Class Creation Lifetime Quota Limit */}
            <div style={{ marginTop: '0.75rem', padding: '1rem 1.25rem', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, fontSize: '0.95rem' }}>
                    <Layers size={18} />
                    <span>Class Creation Limit (Lifetime Max Classes)</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    The teacher will create and manage their own classes directly from their Faculty Command desk up to this limit.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {[3, 5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`badge ${maxClasses === num ? 'badge-green' : 'badge-gray'}`}
                      style={{ cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setMaxClasses(num)}
                    >
                      {num}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="form-input font-mono"
                    style={{ width: '75px', height: '34px', textAlign: 'center', fontWeight: 800 }}
                    value={maxClasses}
                    onChange={(e) => setMaxClasses(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}>Classes Max</span>
                </div>
              </div>
            </div>

            {/* Account Validity / Active Days Configuration */}
            <div style={{ marginTop: '0.75rem', padding: '1rem 1.25rem', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e40af', fontWeight: 700, fontSize: '0.95rem' }}>
                    <Clock size={18} />
                    <span>Account Validity & Active Period (Days)</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#1d4ed8', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Set active access duration. Profile and class data are never deleted when expired, prompting for renewal.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[7, 30, 90, 365].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`badge ${validityDays === num ? 'badge-navy' : 'badge-gray'}`}
                      style={{ cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setValidityDays(num)}
                    >
                      {num === 7 ? '7d (Trial)' : num === 30 ? '30d (1Mo)' : num === 90 ? '90d (3Mo)' : '365d (1Yr)'}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={1825}
                    className="form-input font-mono"
                    style={{ width: '80px', height: '34px', textAlign: 'center', fontWeight: 800 }}
                    value={validityDays}
                    onChange={(e) => setValidityDays(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e40af' }}>Days Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTeacher ? 'Save Changes' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
