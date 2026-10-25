import React, { useState, useEffect, useRef } from 'react';
import { UserRole, Teacher, Student, AdminUser, DeveloperUser, CLASS_OPTIONS } from '../types';
import { useModalScrollLock } from '../utils/lenis';
import { X, Shield, UserCheck, Layers, AlertCircle, Clock } from 'lucide-react';
import { checkLoginIdConflictAcrossAll } from '../utils/storage';

interface ManageProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAdmin: (data: Omit<AdminUser, 'id' | 'createdAt' | 'role'>, editId?: string) => void;
  onSaveDeveloper: (data: Omit<DeveloperUser, 'id' | 'createdAt' | 'role'>, editId?: string) => void;
  onSaveTeacher: (data: Omit<Teacher, 'id' | 'recruitedAt'>, editId?: string) => void;
  onSaveStudent: (data: Omit<Student, 'id' | 'enrolledAt'>, editId?: string) => void;
  editingProfile?: {
    role: UserRole;
    data: any;
  } | null;
}

export const ManageProfileModal: React.FC<ManageProfileModalProps> = ({
  isOpen,
  onClose,
  onSaveAdmin,
  onSaveDeveloper,
  onSaveTeacher,
  onSaveStudent,
  editingProfile,
}) => {
  useModalScrollLock(isOpen);
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginIdError, setLoginIdError] = useState<string | null>(null);

  // Student specific
  const [className, setClassName] = useState(CLASS_OPTIONS[0]);

  // Teacher specific
  const [maxClasses, setMaxClasses] = useState<number>(5);
  const [validityDays, setValidityDays] = useState<number>(30);

  const prevIsOpenRef = useRef(false);
  const prevEditingProfileIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      return;
    }

    const justOpened = isOpen && !prevIsOpenRef.current;
    const currentEditId = editingProfile ? `${editingProfile.role}-${editingProfile.data?.id || ''}` : '';
    const editingProfileChanged = currentEditId !== (prevEditingProfileIdRef.current || '');

    if (justOpened || editingProfileChanged) {
      if (editingProfile) {
        setSelectedRole(editingProfile.role);
        setName(editingProfile.data.name || '');
        setLoginId(editingProfile.data.loginId || '');
        setPassword(editingProfile.data.password || '');
        setEmail(editingProfile.data.email || '');
        setPhone(editingProfile.data.phone || '');
        setLoginIdError(null);

        if (editingProfile.role === 'student') {
          setClassName(editingProfile.data.className || CLASS_OPTIONS[0]);
        } else if (editingProfile.role === 'teacher') {
          setMaxClasses(editingProfile.data.maxClasses ?? 5);
          setValidityDays(editingProfile.data.validityDays ?? editingProfile.data.subscription?.durationDays ?? 30);
        }
      } else {
        setSelectedRole('teacher');
        setName('');
        setLoginId('');
        setPassword('');
        setEmail('');
        setPhone('');
        setClassName(CLASS_OPTIONS[0]);
        setMaxClasses(5);
        setValidityDays(30);
        setLoginIdError(null);
      }
    }

    prevIsOpenRef.current = true;
    prevEditingProfileIdRef.current = currentEditId;
  }, [isOpen, editingProfile?.role, editingProfile?.data?.id]);

  if (!isOpen) return null;

  const handleLoginIdChange = (val: string) => {
    setLoginId(val);
    const clean = val.trim().toLowerCase();
    if (!clean) {
      setLoginIdError(null);
      return;
    }
    const conflict = checkLoginIdConflictAcrossAll(clean, editingProfile?.data?.id);
    if (conflict.isTaken) {
      setLoginIdError(`Username already taken (${conflict.roleName}: ${conflict.existingName}). Please choose a unique Login ID.`);
    } else {
      setLoginIdError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !loginId.trim()) {
      alert('Please provide Name and Login ID.');
      return;
    }

    const cleanLogin = loginId.trim().toLowerCase();
    const editId = editingProfile?.data?.id;

    const conflict = checkLoginIdConflictAcrossAll(cleanLogin, editId);
    if (conflict.isTaken) {
      setLoginIdError(`Username already taken (${conflict.roleName}: ${conflict.existingName}). Please choose a unique Login ID.`);
      alert(`Username already taken. The Login ID "${loginId}" is already taken by ${conflict.roleName} (${conflict.existingName}). Please choose a unique Login ID.`);
      return;
    }

    const isAfzal = cleanLogin === 'afzal@ccap.com' || email.trim().toLowerCase() === 'afzal@ccap.com';
    let finalPassword = password.trim() || editingProfile?.data?.password || '';
    if (isAfzal && (!finalPassword || finalPassword === 'password123')) {
      finalPassword = 'Afzal123/';
    }
    if (!finalPassword && !editingProfile) {
      alert('Please provide a password for this new account.');
      return;
    }

    if (selectedRole === 'admin') {
      onSaveAdmin(
        {
          name: name.trim(),
          loginId: cleanLogin,
          password: finalPassword,
          email: email.trim() || `${cleanLogin}@cadetsacademy.com`,
          phone: phone.trim(),
        },
        editId
      );
    } else if (selectedRole === 'developer') {
      onSaveDeveloper(
        {
          name: name.trim(),
          loginId: cleanLogin,
          password: finalPassword,
          email: email.trim() || `${cleanLogin}@cadetsacademy.com`,
          phone: phone.trim(),
        },
        editId
      );
    } else if (selectedRole === 'teacher') {
      onSaveTeacher(
        {
          name: name.trim(),
          loginId: cleanLogin,
          password: finalPassword,
          email: email.trim() || `${cleanLogin}@cadetsacademy.com`,
          phone: phone.trim(),
          maxClasses: Number(maxClasses) > 0 ? Number(maxClasses) : 5,
          validityDays: Number(validityDays) > 0 ? Number(validityDays) : 30,
          lifetimeClassesCreated:
            editingProfile?.data?.lifetimeClassesCreated !== undefined
              ? editingProfile.data.lifetimeClassesCreated
              : (editingProfile?.data?.assignments
                ? new Set(editingProfile.data.assignments.map((a: any) => a.className)).size
                : 0),
          assignments: editingProfile?.data?.assignments || [],
        },
        editId
      );
    } else if (selectedRole === 'student') {
      onSaveStudent(
        {
          name: name.trim(),
          loginId: cleanLogin,
          password: finalPassword,
          email: email.trim().toLowerCase() || undefined,
          phone: phone.trim(),
          className,
          enrolledClasses: editingProfile?.data?.enrolledClasses,
        },
        editId
      );
    }

    onClose();
  };

  return (
    <div className="modal-overlay" data-lenis-prevent="true" onClick={onClose}>
      <div className="modal-container large" data-lenis-prevent="true" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={22} color="var(--accent-gold)" />
            <div>
              <h3 style={{ margin: 0 }}>
                {editingProfile
                  ? `Edit ${editingProfile.role.toUpperCase()} Profile`
                  : 'Master Account Provisioning Desk'}
              </h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                Developer Authority: Full Read/Write control across any account in the academy
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="modal-body" data-lenis-prevent="true">
            {/* Role Switcher */}
            {!editingProfile && (
              <div className="form-group">
                <label className="form-label">Select Profile Type to Create *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { id: 'admin', label: 'Administrator', color: 'badge-navy' },
                    { id: 'teacher', label: 'Faculty Instructor', color: 'badge-purple' },
                    { id: 'student', label: 'Cadet Student', color: 'badge-green' },
                    { id: 'developer', label: 'Master Developer', color: 'badge-gold' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`badge ${selectedRole === r.id ? 'badge-timer-active' : 'badge-gray'}`}
                      style={{
                        padding: '0.6rem 0.5rem',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        justifyContent: 'center',
                        border: selectedRole === r.id ? '2px solid var(--ccap-gold-500)' : '1px solid var(--border-light)',
                      }}
                      onClick={() => setSelectedRole(r.id as UserRole)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Core Identity Fields */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name / Display Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Commander Tariq Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Login ID *</label>
                <input
                  type="text"
                  className={`form-input font-mono ${loginIdError ? 'border-red-500' : ''}`}
                  style={loginIdError ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                  placeholder="e.g. tariq_hq"
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{editingProfile ? 'Account Password (leave blank to keep current)' : 'Account Password *'}</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder={editingProfile ? 'Leave blank to preserve current password' : 'Enter account password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingProfile}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. tariq@cadetsacademy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone / WhatsApp Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Student Specific: Class Input */}
            {selectedRole === 'student' && (
              <div className="form-group" style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <label className="form-label">Assigned Class / Cadet Batch *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Class 7 Cadet Prep, 9th Class Alpha"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Teacher Specific: Class Creation Quota */}
            {selectedRole === 'teacher' && (
              <div style={{ background: '#f0fdf4', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, fontSize: '0.92rem' }}>
                      <Layers size={18} />
                      <span>Class Creation Limit (Lifetime Max Classes)</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.2rem' }}>
                      Set how many total classes this instructor can create independently from their dashboard.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {[3, 5, 10, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`badge ${maxClasses === num ? 'badge-green' : 'badge-gray'}`}
                        style={{ cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '0.74rem' }}
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
                      style={{ width: '70px', height: '32px', textAlign: 'center', fontWeight: 800 }}
                      value={maxClasses}
                      onChange={(e) => setMaxClasses(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Teacher Specific: Account Validity Days */}
            {selectedRole === 'teacher' && (
              <div style={{ background: '#eff6ff', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #bfdbfe', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e40af', fontWeight: 700, fontSize: '0.92rem' }}>
                      <Clock size={18} />
                      <span>Account Validity & Active Period (Days)</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: '0.2rem' }}>
                      Configure active access duration. Profile and assignments remain preserved after expiration.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[7, 30, 90, 365].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`badge ${validityDays === num ? 'badge-navy' : 'badge-gray'}`}
                        style={{ cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '0.74rem' }}
                        onClick={() => setValidityDays(num)}
                      >
                        {num === 7 ? '7d' : num === 30 ? '30d' : num === 90 ? '90d' : '365d'}
                      </button>
                    ))}
                    <input
                      type="number"
                      min={1}
                      max={1825}
                      className="form-input font-mono"
                      style={{ width: '70px', height: '32px', textAlign: 'center', fontWeight: 800 }}
                      value={validityDays}
                      onChange={(e) => setValidityDays(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e40af' }}>Days</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <UserCheck size={16} />
              <span>{editingProfile ? 'Save Profile Changes' : 'Create Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
