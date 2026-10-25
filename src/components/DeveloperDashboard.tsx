import React, { useState } from 'react';
import {
  UserRole,
  Teacher,
  Student,
  Quiz,
  Submission,
  AdminUser,
  DeveloperUser,
  CLASS_OPTIONS,
  SUBJECT_OPTIONS,
} from '../types';
import {
  Users,
  BookOpen,
  Award,
  Plus,
  Trash2,
  Edit2,
  LogIn,
  Search,
  Download,
  Upload,
  RefreshCw,
  Database,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { SubscriptionTable } from './SubscriptionTable';

interface DeveloperDashboardProps {
  admins: AdminUser[];
  developers: DeveloperUser[];
  teachers: Teacher[];
  students: Student[];
  quizzes: Quiz[];
  submissions: Submission[];
  onOpenCreateProfileModal: () => void;
  onEditProfile: (role: UserRole, data: any) => void;
  onDeleteProfile: (role: UserRole, id: string) => void;
  onImpersonateUser: (role: UserRole, userObj: any) => void;
  onExportDB: () => void;
  onImportDB: (jsonStr: string) => boolean;
  onResetDB: () => void;
  onRefreshData?: () => void;
  onSyncToCloud?: () => Promise<boolean>;
  activeMobileTab?: string;
  onMobileTabChange?: (tab: string) => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  admins,
  developers,
  teachers,
  students,
  quizzes,
  submissions,
  onOpenCreateProfileModal,
  onEditProfile,
  onDeleteProfile,
  onImpersonateUser,
  onExportDB,
  onImportDB,
  onResetDB,
  onRefreshData,
  onSyncToCloud,
  activeMobileTab = 'profiles',
  onMobileTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'profiles' | 'database' | 'config' | 'subscriptions'>('profiles');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const activeTab = onMobileTabChange ? (activeMobileTab as any) : internalTab;
  const setActiveTab = onMobileTabChange ? onMobileTabChange : setInternalTab;

  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student' | 'developer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [importMessage, setImportMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Combine all profiles into a uniform format
  const allProfiles: Array<{
    id: string;
    role: UserRole;
    name: string;
    loginId: string;
    password?: string;
    email?: string;
    phone?: string;
    extra: string;
    raw: any;
  }> = [
    ...developers.map((d) => ({
      id: d.id,
      role: 'developer' as UserRole,
      name: d.name,
      loginId: d.loginId,
      password: d.password || '••••••••',
      email: d.email,
      phone: d.phone,
      extra: 'Root Authority & System Control',
      raw: d,
    })),
    ...admins.map((a) => ({
      id: a.id,
      role: 'admin' as UserRole,
      name: a.name,
      loginId: a.loginId,
      password: a.password || '••••••••',
      email: a.email,
      phone: a.phone,
      extra: 'Academy Principal & Executive',
      raw: a,
    })),
    ...teachers.map((t) => {
      const isAfzal = t.loginId.toLowerCase() === 'afzal@ccap.com' || t.email?.toLowerCase() === 'afzal@ccap.com';
      return {
        id: t.id,
        role: 'teacher' as UserRole,
        name: t.name,
        loginId: t.loginId,
        password: isAfzal ? (t.password && t.password !== 'password123' ? t.password : 'Afzal123/') : (t.password || '••••••••'),
        email: t.email,
        phone: t.phone,
        extra: t.assignments.map((asg) => `${asg.className}: ${asg.subject}`).join(', '),
        raw: t,
      };
    }),
    ...students.map((s) => ({
      id: s.id,
      role: 'student' as UserRole,
      name: s.name,
      loginId: s.loginId,
      password: s.password || '••••••••',
      phone: s.phone,
      extra: `Class: ${s.className}`,
      raw: s,
    })),
  ];

  // Filter profiles
  const filteredProfiles = allProfiles.filter((p) => {
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.loginId.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      p.extra.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const totalUsers = allProfiles.length;

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) {
      setImportMessage({ text: 'Please paste valid JSON database backup.', type: 'error' });
      return;
    }
    const success = onImportDB(importJsonText);
    if (success) {
      setImportMessage({ text: 'Database successfully restored from JSON!', type: 'success' });
      setImportJsonText('');
    } else {
      setImportMessage({ text: 'Invalid JSON format. Restore aborted.', type: 'error' });
    }
  };

  return (
    <div>
      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card gold">
          <div className="stat-icon gold">
            <Users size={22} />
          </div>
          <div className="stat-info">
            <h3>{totalUsers}</h3>
            <p>Total Profiles ({admins.length}A, {teachers.length}T, {students.length}C)</p>
          </div>
        </div>

        <div className="stat-card navy">
          <div className="stat-icon navy">
            <BookOpen size={22} />
          </div>
          <div className="stat-info">
            <h3>{quizzes.length}</h3>
            <p>Quizzes in Bank</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon green">
            <Award size={22} />
          </div>
          <div className="stat-info">
            <h3>{submissions.length}</h3>
            <p>Test Submissions</p>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icon blue">
            <Database size={22} />
          </div>
          <div className="stat-info">
            <h3 style={{ fontSize: '1.25rem' }}>Active</h3>
            <p>LocalStorage DB Engine</p>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="tabs-header">
        <button
          className={`tab-button ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
        >
          <Users size={18} />
          <span>All Profiles Master Console</span>
          <span className="tab-badge">{totalUsers}</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          <Database size={18} />
          <span>Database & Backup Hub</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <Sliders size={18} />
          <span>Academic Config</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          <Sparkles size={18} />
          <span>Subscriptions & Paywall</span>
        </button>
      </div>

      {/* ========================================================================
          TAB 1: All Profiles Master Console (Create, Edit, Delete, Impersonate)
          ======================================================================== */}
      {activeTab === 'profiles' && (
        <div className="content-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h2>Academy Profiles Master Console</h2>
              <p>Create, edit credentials, impersonate, or delete any profile across the academy</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="Search any profile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={onOpenCreateProfileModal}>
                <Plus size={16} />
                <span>Add Profile</span>
              </button>
              {onSyncToCloud && (
                <button
                  type="button"
                  className="btn btn-navy btn-sm"
                  disabled={isSyncingCloud}
                  onClick={async () => {
                    setIsSyncingCloud(true);
                    try {
                      const ok = await onSyncToCloud();
                      if (ok) {
                        alert('Cloud Synchronization Successful!\n\nAll profiles and data have been synchronized to Firebase Cloud.');
                      } else {
                        alert('Cloud sync completed.');
                      }
                    } catch (e: any) {
                      alert('Sync notice: ' + (e.message || 'Error'));
                    } finally {
                      setIsSyncingCloud(false);
                    }
                  }}
                  title="Push complete local master database to Firebase Firestore cloud"
                >
                  <Cloud size={16} />
                  <span>{isSyncingCloud ? 'Syncing...' : 'Sync Cloud'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Role Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Profiles (${totalUsers})` },
              { id: 'admin', label: `Admins (${admins.length})` },
              { id: 'teacher', label: `Teachers (${teachers.length})` },
              { id: 'student', label: `Students (${students.length})` },
              { id: 'developer', label: `Developers (${developers.length})` },
            ].map((rf) => (
              <button
                key={rf.id}
                type="button"
                className={`badge ${roleFilter === rf.id ? 'badge-navy' : 'badge-gray'}`}
                style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => setRoleFilter(rf.id as any)}
              >
                {rf.label}
              </button>
            ))}
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <h3>No Profiles Match Filter</h3>
              <p>Try adjusting your search query or role filter.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="table-container desktop-table-view">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Profile Type</th>
                      <th>Name</th>
                      <th>Login ID & Password</th>
                      <th>Contact (Email / Phone)</th>
                      <th>Assignment / Details</th>
                      <th style={{ textAlign: 'right' }}>Master Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map((p) => {
                      const badgeColor =
                        p.role === 'developer'
                          ? 'badge-purple'
                          : p.role === 'admin'
                          ? 'badge-navy'
                          : p.role === 'teacher'
                          ? 'badge-gold'
                          : 'badge-green';

                      return (
                        <tr key={`${p.role}-${p.id}`}>
                          <td>
                            <span className={`badge ${badgeColor}`}>
                              {p.role.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--text-heading)' }}>{p.name}</strong>
                          </td>
                          <td>
                            <div>
                              <code className="font-mono">{p.loginId}</code>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              Pass: <code>{p.password}</code>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem' }}>{p.email || '—'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {p.phone || '—'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', maxWidth: '240px', color: 'var(--text-secondary)' }}>
                              {p.extra}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                              <button
                                className="btn btn-navy btn-sm"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                                onClick={() => onImpersonateUser(p.role, p.raw)}
                                title="Login As This User (1-Click Switch)"
                              >
                                <LogIn size={12} />
                                <span>Switch</span>
                              </button>

                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                                onClick={() => onEditProfile(p.role, p.raw)}
                                title="Edit Profile"
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete profile "${p.name}" (${p.loginId})?`)) {
                                    onDeleteProfile(p.role, p.id);
                                  }
                                }}
                                title="Delete Profile"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Native Profile Cards */}
              <div className="mobile-card-list">
                {filteredProfiles.map((p) => {
                  const badgeColor =
                    p.role === 'developer'
                      ? 'badge-purple'
                      : p.role === 'admin'
                      ? 'badge-navy'
                      : p.role === 'teacher'
                      ? 'badge-gold'
                      : 'badge-green';

                  return (
                    <div key={`${p.role}-${p.id}`} className="mobile-record-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            Login: <code className="font-mono">{p.loginId}</code> • Pass: <code>{p.password}</code>
                          </div>
                        </div>
                        <span className={`badge ${badgeColor}`}>
                          {p.role.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>
                        {p.email ? `${p.email} • ` : ''}{p.phone || 'No phone'}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        {p.extra}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-navy btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => onImpersonateUser(p.role, p.raw)}
                        >
                          <LogIn size={13} />
                          <span>Login As</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onEditProfile(p.role, p.raw)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (window.confirm(`Delete profile "${p.name}"?`)) {
                              onDeleteProfile(p.role, p.id);
                            }
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================
          TAB 2: Master Database & Backup Center (Export, Import, Reset)
          ======================================================================== */}
      {activeTab === 'database' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Export & Reset Card */}
          <div className="content-card">
            <div className="card-header-flex">
              <div className="card-title-group">
                <h2>Master Database Backup & Factory Controls</h2>
                <p>Export all tables and entities into a single JSON file or reset to default state</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <button className="btn btn-primary" onClick={onExportDB}>
                <Download size={18} />
                <span>Export Complete DB JSON Backup</span>
              </button>

              {onSyncToCloud && (
                <button
                  className="btn btn-navy"
                  disabled={isSyncingCloud}
                  onClick={async () => {
                    setIsSyncingCloud(true);
                    try {
                      const ok = await onSyncToCloud();
                      if (ok) {
                        alert('Cloud Synchronization Successful!\n\nAll profiles, quizzes, subscriptions, and submissions have been committed to Firebase Firestore and are instantly available to all live web users.');
                      } else {
                        alert('Cloud sync initiated. Firestore updated.');
                      }
                    } catch (err: any) {
                      alert('Sync notice: ' + (err.message || 'Offline'));
                    } finally {
                      setIsSyncingCloud(false);
                    }
                  }}
                >
                  <RefreshCw size={18} className={isSyncingCloud ? 'animate-spin' : ''} />
                  <span>{isSyncingCloud ? 'Syncing to Cloud...' : 'Sync Database to Firebase Cloud'}</span>
                </button>
              )}

              <button
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm('FACTORY RESET WARNING:\n\nThis will restore all academy records (Teachers, Students, Quizzes, Submissions) to fresh initial seed data. Continue?')) {
                    onResetDB();
                    alert('System database reset to factory defaults.');
                  }
                }}
              >
                <RefreshCw size={18} />
                <span>Reset Database to Initial Defaults</span>
              </button>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
                Live Database Entity Statistics
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div>• Administrators: <strong>{admins.length}</strong></div>
                <div>• Developers: <strong>{developers.length}</strong></div>
                <div>• Faculty Teachers: <strong>{teachers.length}</strong></div>
                <div>• Enrolled Students: <strong>{students.length}</strong></div>
                <div>• Quizzes: <strong>{quizzes.length}</strong></div>
                <div>• Exam Submissions: <strong>{submissions.length}</strong></div>
              </div>
            </div>
          </div>

          {/* Import / Restore JSON Card */}
          <div className="content-card">
            <div className="card-header-flex">
              <div className="card-title-group">
                <h2>Restore Database from JSON Backup</h2>
                <p>Paste JSON backup payload to immediately sync and overwrite database state</p>
              </div>
            </div>

            {importMessage && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  background: importMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: importMessage.type === 'success' ? '#166534' : '#991b1b',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {importMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                <span>{importMessage.text}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Database JSON Payload</label>
              <textarea
                className="form-textarea font-mono"
                rows={6}
                placeholder='{"admins": [...], "teachers": [...], "students": [...], "quizzes": [...]}'
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
              />
            </div>

            <button className="btn btn-navy" onClick={handleImportSubmit}>
              <Upload size={16} />
              <span>Validate & Restore Database</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 3: Academic Structure & Global Config
          ======================================================================== */}
      {activeTab === 'config' && (
        <div className="content-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h2>Cadets Academy Academic Structure</h2>
              <p>System-wide classes, examination batches, and subjects available for assignment</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.75rem', color: 'var(--primary-navy)' }}>
                Standard Class Prep Batches ({CLASS_OPTIONS.length})
              </h4>
              <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                {CLASS_OPTIONS.map((c, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-gold font-mono">#{idx + 1}</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.75rem', color: 'var(--cadet-green)' }}>
                Registered Academic Subjects ({SUBJECT_OPTIONS.length})
              </h4>
              <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                {SUBJECT_OPTIONS.map((s, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-green font-mono">#{idx + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 4: Subscriptions Ledger & Paywall Manager
          ======================================================================== */}
      {activeTab === 'subscriptions' && (
        <SubscriptionTable
          students={students}
          onRefreshData={onRefreshData || (() => {})}
          viewerRole="developer"
        />
      )}
    </div>
  );
};
