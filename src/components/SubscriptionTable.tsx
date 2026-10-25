import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  X,
  DollarSign,
  Copy,
  Check,
} from 'lucide-react';
import {
  Student,
  SubscriptionPlanTier,
  PaymentMethod,
} from '../types';
import {
  PLAN_PACKAGES,
  createSubscriptionRecord,
  getDaysRemaining,
} from '../utils/subscription';
import {
  getSubscriptions,
  saveUserSubscription,
  verifyUserSubscription,
  extendUserSubscription,
  cancelUserSubscription,
} from '../utils/storage';

interface SubscriptionTableProps {
  students: Student[];
  onRefreshData: () => void;
  viewerRole: 'admin' | 'developer';
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  students,
  onRefreshData,
  viewerRole,
}) => {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'pending_verification' | 'expired'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [copiedTid, setCopiedTid] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Grant Form State
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [grantTier, setGrantTier] = useState<SubscriptionPlanTier>('monthly');
  const [grantMethod, setGrantMethod] = useState<PaymentMethod>('cash');
  const [grantNotes, setGrantNotes] = useState('');

  const subscriptions = getSubscriptions();

  // Stats
  const activeSubs = subscriptions.filter(
    (s) =>
      (s.status === 'active' || s.status === 'pending_verification') &&
      new Date(s.expiryDate).getTime() > Date.now()
  );
  const pendingSubs = subscriptions.filter((s) => s.status === 'pending_verification');
  const expiredSubs = subscriptions.filter(
    (s) => s.status === 'expired' || new Date(s.expiryDate).getTime() <= Date.now()
  );

  // Filtered List
  const filteredSubs = subscriptions.filter((s) => {
    const isNowExpired = new Date(s.expiryDate).getTime() <= Date.now();
    const computedStatus = isNowExpired ? 'expired' : s.status;

    if (filterStatus === 'active' && (computedStatus !== 'active' || isNowExpired)) return false;
    if (filterStatus === 'pending_verification' && s.status !== 'pending_verification') return false;
    if (filterStatus === 'expired' && !isNowExpired && s.status !== 'expired') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.userName?.toLowerCase().includes(q);
      const matchEmail = s.userEmail?.toLowerCase().includes(q);
      const matchLogin = s.loginId?.toLowerCase().includes(q);
      const matchTid = s.transactionRef?.toLowerCase().includes(q);
      const matchPlan = s.planName?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchLogin && !matchTid && !matchPlan) return false;
    }
    return true;
  });

  const showNotification = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleCopyTid = (tid: string) => {
    navigator.clipboard.writeText(tid);
    setCopiedTid(tid);
    setTimeout(() => setCopiedTid(null), 2000);
  };

  const handleVerify = (subId: string, cadetName: string) => {
    verifyUserSubscription(subId, viewerRole.toUpperCase());
    showNotification(`Payment TID verified & activated for ${cadetName}`);
    onRefreshData();
  };

  const handleExtend = (subId: string, days: number, cadetName: string) => {
    extendUserSubscription(subId, days, viewerRole.toUpperCase());
    showNotification(`Extended membership for ${cadetName} by +${days} days`);
    onRefreshData();
  };

  const handleCancel = (subId: string, cadetName: string) => {
    if (confirm(`Are you sure you want to cancel subscription for ${cadetName}?`)) {
      cancelUserSubscription(subId);
      showNotification(`Subscription canceled for ${cadetName}`);
      onRefreshData();
    }
  };

  const handleGrantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    const sub = createSubscriptionRecord(
      student,
      grantTier,
      grantMethod,
      `GRANT-${viewerRole.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      grantNotes.trim() || `Granted directly by ${viewerRole.toUpperCase()}`
    );

    // If granted by admin/dev, auto-verify immediately
    sub.status = 'active';
    sub.verifiedAt = new Date().toISOString();
    sub.verifiedBy = viewerRole.toUpperCase();

    saveUserSubscription(sub);
    setGrantModalOpen(false);
    setGrantNotes('');
    showNotification(`Membership successfully granted & activated for ${student.name}`);
    onRefreshData();
  };

  return (
    <div className="subscription-management-card">
      {/* Top Banner & Stats */}
      <div className="sub-mgmt-header">
        <div>
          <div className="section-eyebrow">Academic Commercial Desk</div>
          <h2 className="section-title">Cadet Membership & Subscriptions</h2>
          <p className="section-subtitle">
            Monitor real-time Google account subscriptions, verify JazzCash/EasyPaisa receipts, and grant memberships.
          </p>
        </div>

        <button
          type="button"
          className="btn-grant-subscription"
          onClick={() => setGrantModalOpen(true)}
        >
          <Plus size={16} />
          <span>Grant / Renew Membership</span>
        </button>
      </div>

      {/* Action Notification Toast Banner */}
      <AnimatePresence>
        {feedbackNotice && (
          <motion.div
            className="sub-action-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} color="#10b981" />
              <span>{feedbackNotice}</span>
            </div>
            <button
              onClick={() => setFeedbackNotice(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#065f46' }}
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Row */}
      <div className="sub-metrics-grid">
        <div className="sub-stat-card stat-active">
          <div className="stat-icon-wrapper">
            <CheckCircle size={22} color="#10b981" />
          </div>
          <div>
            <div className="stat-number">{activeSubs.length}</div>
            <div className="stat-label">Active Subscribers</div>
          </div>
        </div>

        <div className="sub-stat-card stat-pending">
          <div className="stat-icon-wrapper">
            <Clock size={22} color="#f59e0b" />
          </div>
          <div>
            <div className="stat-number">{pendingSubs.length}</div>
            <div className="stat-label">Pending Verification (TID)</div>
          </div>
        </div>

        <div className="sub-stat-card stat-expired">
          <div className="stat-icon-wrapper">
            <AlertCircle size={22} color="#ef4444" />
          </div>
          <div>
            <div className="stat-number">{expiredSubs.length}</div>
            <div className="stat-label">Expired / Needs Renewal</div>
          </div>
        </div>

        <div className="sub-stat-card stat-revenue">
          <div className="stat-icon-wrapper">
            <DollarSign size={22} color="#b45309" />
          </div>
          <div>
            <div className="stat-number">
              PKR{' '}
              {subscriptions
                .reduce((acc, s) => {
                  const plan = PLAN_PACKAGES.find((p) => p.tier === s.tier);
                  return acc + (plan?.priceAmount || 0);
                }, 0)
                .toLocaleString()}
            </div>
            <div className="stat-label">Cumulative Portal Volume</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="sub-filter-bar">
        <div className="sub-status-tabs">
          <button
            type="button"
            className={`sub-tab-btn ${filterStatus === 'all' ? 'active-tab' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Records ({subscriptions.length})
          </button>
          <button
            type="button"
            className={`sub-tab-btn ${filterStatus === 'pending_verification' ? 'active-tab' : ''}`}
            onClick={() => setFilterStatus('pending_verification')}
          >
            {pendingSubs.length > 0 && <span className="sub-pulse-dot" />}
            <span>Pending TID ({pendingSubs.length})</span>
          </button>
          <button
            type="button"
            className={`sub-tab-btn ${filterStatus === 'active' ? 'active-tab' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Active Passes ({activeSubs.length})
          </button>
          <button
            type="button"
            className={`sub-tab-btn ${filterStatus === 'expired' ? 'active-tab' : ''}`}
            onClick={() => setFilterStatus('expired')}
          >
            Expired ({expiredSubs.length})
          </button>
        </div>

        <div className="sub-search-box">
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by cadet, login ID, email, or TID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sub-search-input"
          />
        </div>
      </div>

      {/* Subscriptions Ledger Table - Desktop Table View */}
      <div className="table-responsive desktop-table-view">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cadet Student</th>
              <th>Package Tier</th>
              <th>Fee & Channel</th>
              <th>Transaction ID (TID)</th>
              <th>Validity & Days</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table-state">
                  <Shield size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem auto' }} />
                  <p>No cadet subscriptions match the selected criteria.</p>
                </td>
              </tr>
            ) : (
              filteredSubs.map((sub) => {
                const daysRemaining = getDaysRemaining(sub);
                const isExpired = new Date(sub.expiryDate).getTime() <= Date.now();
                const matchedStudent = students.find(
                  (s) => s.id === sub.userId || s.loginId === sub.loginId
                );

                return (
                  <tr key={sub.id} className="sub-table-row">
                    <td>
                      <div className="cadet-identity-cell">
                        <div className="cadet-avatar-circle">
                          {matchedStudent?.googlePicture ? (
                            <img
                              src={matchedStudent.googlePicture}
                              alt={sub.userName}
                              className="cadet-avatar-img"
                            />
                          ) : (
                            sub.userName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="cadet-info-text">
                          <strong className="cadet-name">{sub.userName}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <span className="cadet-class-badge">
                              {matchedStudent?.className || 'Cadet Aspirant'}
                            </span>
                            <span className="cadet-login font-mono">
                              ID: {sub.loginId}
                            </span>
                          </div>
                          {sub.userEmail && (
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {sub.userEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span className={`sub-tier-pill tier-${sub.tier}`}>
                          {sub.planName}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Quota: <strong>{sub.maxClasses ?? (sub.tier === 'trial' ? 1 : sub.tier === 'monthly' ? 3 : 5)} { (sub.maxClasses ?? (sub.tier === 'trial' ? 1 : 5)) === 1 ? 'Class' : 'Classes'}</strong>
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="fee-cell">
                        <strong className="fee-amount">{sub.price}</strong>
                        <span className={`method-label method-${sub.paymentMethod}`}>
                          {sub.paymentMethod.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>

                    <td>
                      {sub.transactionRef ? (
                        <div className="tid-cell">
                          <code className="tid-badge">{sub.transactionRef}</code>
                          <button
                            type="button"
                            className={`copy-tid-btn ${copiedTid === sub.transactionRef ? 'copied' : ''}`}
                            onClick={() => handleCopyTid(sub.transactionRef!)}
                            title="Copy TID to clipboard"
                          >
                            {copiedTid === sub.transactionRef ? (
                              <>
                                <Check size={12} color="#10b981" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.78rem' }}>
                          Free Pass / None
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="validity-cell">
                        <span className="validity-date">
                          Until {new Date(sub.expiryDate).toLocaleDateString()}
                        </span>
                        <span
                          className={`days-pill ${
                            daysRemaining > 7
                              ? 'days-safe'
                              : daysRemaining > 0
                              ? 'days-warn'
                              : 'days-expired'
                          }`}
                        >
                          {daysRemaining > 0 ? `${daysRemaining}d left` : 'Expired'}
                        </span>
                      </div>
                    </td>

                    <td>
                      {isExpired ? (
                        <span className="status-badge badge-expired">
                          <AlertCircle size={13} />
                          <span>Expired</span>
                        </span>
                      ) : sub.status === 'pending_verification' ? (
                        <span className="status-badge badge-pending">
                          <Clock size={13} />
                          <span>Pending TID</span>
                        </span>
                      ) : sub.status === 'active' ? (
                        <span className="status-badge badge-active">
                          <CheckCircle size={13} />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="status-badge badge-canceled">
                          <X size={13} />
                          <span>Canceled</span>
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="action-button-group">
                        {sub.status === 'pending_verification' && (
                          <button
                            type="button"
                            className="btn-action btn-verify"
                            title="Verify and Approve TID"
                            onClick={() => handleVerify(sub.id, sub.userName)}
                          >
                            <CheckCircle size={14} />
                            <span>Verify</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn-action btn-extend"
                          title="Extend +30 Days"
                          onClick={() => handleExtend(sub.id, 30, sub.userName)}
                        >
                          <span>+30d</span>
                        </button>

                        <button
                          type="button"
                          className="btn-action btn-extend"
                          title="Extend +90 Days"
                          onClick={() => handleExtend(sub.id, 90, sub.userName)}
                        >
                          <span>+90d</span>
                        </button>

                        {sub.status !== 'canceled' && (
                          <button
                            type="button"
                            className="btn-action btn-revoke"
                            title="Cancel Subscription"
                            onClick={() => handleCancel(sub.id, sub.userName)}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Subscriptions Ledger - Mobile Native Cards View */}
      <div className="mobile-card-list">
        {filteredSubs.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <Shield size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem auto' }} />
            <p>No cadet subscriptions match the selected criteria.</p>
          </div>
        ) : (
          filteredSubs.map((sub) => {
            const daysRemaining = getDaysRemaining(sub);
            const isExpired = new Date(sub.expiryDate).getTime() <= Date.now();
            const matchedStudent = students.find(
              (s) => s.id === sub.userId || s.loginId === sub.loginId
            );

            return (
              <div key={sub.id} className="mobile-record-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {/* Header: Cadet identity & status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="cadet-avatar-circle" style={{ width: '34px', height: '34px', fontSize: '0.8rem' }}>
                      {matchedStudent?.googlePicture ? (
                        <img
                          src={matchedStudent.googlePicture}
                          alt={sub.userName}
                          className="cadet-avatar-img"
                        />
                      ) : (
                        sub.userName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a' }}>
                        {sub.userName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span className="cadet-class-badge" style={{ fontSize: '0.64rem' }}>
                          {matchedStudent?.className || 'Cadet Aspirant'}
                        </span>
                        <span className="cadet-login font-mono" style={{ fontSize: '0.7rem' }}>
                          ID: {sub.loginId}
                        </span>
                      </div>
                      {sub.userEmail && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                          {sub.userEmail}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isExpired ? (
                      <span className="status-badge badge-expired" style={{ fontSize: '0.72rem' }}>
                        <AlertCircle size={12} />
                        <span>Expired</span>
                      </span>
                    ) : sub.status === 'pending_verification' ? (
                      <span className="status-badge badge-pending" style={{ fontSize: '0.72rem' }}>
                        <Clock size={12} />
                        <span>Pending</span>
                      </span>
                    ) : sub.status === 'active' ? (
                      <span className="status-badge badge-active" style={{ fontSize: '0.72rem' }}>
                        <CheckCircle size={12} />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="status-badge badge-canceled" style={{ fontSize: '0.72rem' }}>
                        <X size={12} />
                        <span>Canceled</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Plan Tier & Fee Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.65rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                  <div>
                    <span className={`sub-tier-pill tier-${sub.tier}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}>
                      {sub.planName}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '0.35rem' }}>
                      ({sub.maxClasses ?? (sub.tier === 'trial' ? 1 : sub.tier === 'monthly' ? 3 : 5)} Classes)
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#0f172a' }}>{sub.price}</strong>
                    <span className={`method-label method-${sub.paymentMethod}`} style={{ marginLeft: '0.35rem', fontSize: '0.64rem' }}>
                      {sub.paymentMethod.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* TID & Validity info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#475569' }}>
                  <div>
                    {sub.transactionRef ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>TID:</span>
                        <code className="tid-badge" style={{ fontSize: '0.72rem' }}>{sub.transactionRef}</code>
                        <button
                          type="button"
                          onClick={() => handleCopyTid(sub.transactionRef!)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b' }}
                          title="Copy TID"
                        >
                          {copiedTid === sub.transactionRef ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        </button>
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pass / None</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Until {new Date(sub.expiryDate).toLocaleDateString()}</span>
                    <span
                      className={`days-pill ${
                        daysRemaining > 7
                          ? 'days-safe'
                          : daysRemaining > 0
                          ? 'days-warn'
                          : 'days-expired'
                      }`}
                      style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}
                    >
                      {daysRemaining > 0 ? `${daysRemaining}d` : '0d'}
                    </span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem', paddingTop: '0.45rem', borderTop: '1px solid #f1f5f9' }}>
                  {sub.status === 'pending_verification' && (
                    <button
                      type="button"
                      className="btn-action btn-verify"
                      style={{ flex: 1, padding: '0.45rem', justifyContent: 'center' }}
                      onClick={() => handleVerify(sub.id, sub.userName)}
                    >
                      <CheckCircle size={14} />
                      <span>Verify & Activate</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-action btn-extend"
                    style={{ flex: 1, padding: '0.45rem', justifyContent: 'center' }}
                    onClick={() => handleExtend(sub.id, 30, sub.userName)}
                  >
                    <span>+30 Days</span>
                  </button>

                  <button
                    type="button"
                    className="btn-action btn-extend"
                    style={{ flex: 1, padding: '0.45rem', justifyContent: 'center' }}
                    onClick={() => handleExtend(sub.id, 90, sub.userName)}
                  >
                    <span>+90 Days</span>
                  </button>

                  {sub.status !== 'canceled' && (
                    <button
                      type="button"
                      className="btn-action btn-revoke"
                      style={{ padding: '0.45rem 0.75rem', justifyContent: 'center' }}
                      title="Cancel Subscription"
                      onClick={() => handleCancel(sub.id, sub.userName)}
                    >
                      <X size={14} />
                      <span style={{ fontSize: '0.72rem' }}>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Grant Subscription Modal */}
      <AnimatePresence>
        {grantModalOpen && (
          <div
            className="checkout-modal-overlay"
            data-lenis-prevent="true"
            onClick={() => setGrantModalOpen(false)}
          >
            <motion.div
              className="checkout-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="checkout-modal-header">
                <div>
                  <div className="checkout-modal-step">Direct Administrative Action</div>
                  <h3 className="checkout-modal-title">Grant Academy Membership</h3>
                </div>
                <button
                  onClick={() => setGrantModalOpen(false)}
                  className="checkout-modal-close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleGrantSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Select Cadet Student *</label>
                  <select
                    className="form-select"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.loginId}) • {s.className}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Membership Package *</label>
                  <select
                    className="form-select"
                    value={grantTier}
                    onChange={(e) => setGrantTier(e.target.value as SubscriptionPlanTier)}
                  >
                    {PLAN_PACKAGES.map((p) => (
                      <option key={p.tier} value={p.tier}>
                        {p.name} ({p.price} • {p.durationLabel} • {p.maxClasses} {p.maxClasses === 1 ? 'Class' : 'Classes'} Limit)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Collection Channel</label>
                  <select
                    className="form-select"
                    value={grantMethod}
                    onChange={(e) => setGrantMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="cash">Cash Paid at Academy Reception Desk</option>
                    <option value="bank_transfer">Bank Transfer / Raast</option>
                    <option value="jazzcash">JazzCash Direct Transfer</option>
                    <option value="easypaisa">EasyPaisa Direct Transfer</option>
                    <option value="free_trial">Complimentary / Scholarship Pass</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Administrative Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Paid in cash receipt #4421, or Staff Child scholarship"
                    value={grantNotes}
                    onChange={(e) => setGrantNotes(e.target.value)}
                  />
                </div>

                <div className="checkout-action-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setGrantModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm-pay">
                    <span>Activate Membership</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

