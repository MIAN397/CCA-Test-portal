import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  CheckCircle,
  Zap,
  Star,
  Award,
  ArrowRight,
  LogOut,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  X,
  MessageCircle,
  ExternalLink,
  Camera,
  Clock,
} from 'lucide-react';
import {
  UserSubscription,
  PlanPackage,
  PaymentMethod,
  SubscriptionPlanTier,
} from '../types';
import {
  PLAN_PACKAGES,
  ACADEMY_PAYMENT_CHANNELS,
  createSubscriptionRecord,
  isSubscriptionActive,
  getDaysRemaining,
} from '../utils/subscription';
import { syncSubscriptionToFirestore } from '../services/firebaseSync';

interface PlanPortalProps {
  user: {
    id: string;
    name: string;
    email?: string;
    loginId: string;
    googlePicture?: string;
  };
  currentSubscription?: UserSubscription | null;
  onActivatePlan: (sub: UserSubscription) => void;
  onLogout?: () => void;
  isModal?: boolean;
  onClose?: () => void;
  initialTier?: SubscriptionPlanTier;
  autoOpenCheckout?: boolean;
  hideFreeTier?: boolean;
}

export const PlanPortal: React.FC<PlanPortalProps> = ({
  user,
  currentSubscription,
  onActivatePlan,
  onLogout,
  isModal = false,
  onClose,
  initialTier,
  autoOpenCheckout = false,
  hideFreeTier = false,
}) => {
  const isExpired = !!currentSubscription && !isSubscriptionActive(currentSubscription);
  const shouldHideFreeTier = hideFreeTier || isExpired;

  const [selectedPlan, setSelectedPlan] = useState<PlanPackage>(() => {
    if (initialTier && (!shouldHideFreeTier || initialTier !== 'trial')) {
      const match = PLAN_PACKAGES.find((p) => p.tier === initialTier);
      if (match) return match;
    }
    return PLAN_PACKAGES.find((p) => p.tier === 'quarterly') || PLAN_PACKAGES[1];
  });
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(autoOpenCheckout);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('easypaisa');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [isManualSent, setIsManualSent] = useState(false);

  const hasActive = isSubscriptionActive(currentSubscription);
  const daysLeft = getDaysRemaining(currentSubscription);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenCheckout = (plan: PlanPackage) => {
    setSelectedPlan(plan);
    if (plan.tier === 'trial') {
      // Instant trial activation for Free Starter Trial
      handleDirectActivate(plan, 'free_trial', 'TRIAL-INSTANT');
    } else {
      setPaymentMethod('easypaisa');
      setIsManualSent(false);
      setCheckoutModalOpen(true);
    }
  };

  const handleDirectActivate = (
    plan: PlanPackage,
    method: PaymentMethod,
    refCode?: string
  ) => {
    setTimeout(async () => {
      try {
        const sub = createSubscriptionRecord(user, plan.tier, method, refCode);

        // Persist active subscription to Cloud Firestore (best-effort)
        try {
          await syncSubscriptionToFirestore(sub);
        } catch (err) {
          console.warn('Subscription Firestore sync note:', err);
        }

        setSuccessAnimation(true);
        setTimeout(() => {
          onActivatePlan(sub);
          if (onClose) onClose();
        }, 900);
      } catch (err: any) {
        console.warn('Direct activate note:', err);
      }
    }, 400);
  };

  return (
    <div className={`plan-portal-container ${isModal ? 'plan-portal-modal-mode' : ''}`}>
      {/* Background Ambience */}
      <div className="plan-portal-bg-decor" />

      {/* Top Navigation Bar */}
      <header className="plan-portal-header">
        <div className="plan-portal-header-brand">
          <img
            src="/logo.png"
            alt="Cadets Coaching Academy Crest"
            className="plan-portal-crest"
          />
          <div>
            <div className="plan-portal-brand-sub">Cadets Coaching Academy</div>
            <h1 className="plan-portal-brand-title">Official Cadet Membership Portal</h1>
          </div>
        </div>

        {/* User Pill & Sign Out */}
        <div className="plan-portal-header-actions">
          <div className="plan-portal-user-pill">
            {user.googlePicture ? (
              <img
                src={user.googlePicture}
                alt={user.name}
                className="plan-portal-avatar"
              />
            ) : (
              <div className="plan-portal-avatar-fallback">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="plan-portal-user-meta">
              <span className="plan-portal-user-name">{user.name}</span>
              <span className="plan-portal-user-email font-mono">
                {user.email || user.loginId}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="plan-portal-logout-btn"
              title="Sign Out of Google Account"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}

          {isModal && onClose && (
            <button onClick={onClose} className="plan-portal-close-btn" title="Close">
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="plan-portal-main">
        {/* Active Subscription Banner if renewing */}
        {hasActive && currentSubscription && (
          <div className="plan-portal-active-alert">
            <div className="plan-portal-active-badge">
              <Sparkles size={16} />
              <span>Active Plan: {currentSubscription.planName}</span>
            </div>
            <div className="plan-portal-active-info">
              You currently have <strong>{daysLeft} days remaining</strong> (valid until{' '}
              {new Date(currentSubscription.expiryDate).toLocaleDateString()}). Choosing a plan
              now will extend your membership.
            </div>
          </div>
        )}

        {/* Hero Notice */}
        <div className="plan-portal-hero">
          <div className="plan-portal-hero-tag">
            <Shield size={14} />
            <span>Official Academy Enrollment</span>
          </div>
          <h2 className="plan-portal-hero-title">
            Select Your Academy Membership Plan
          </h2>
          <p className="plan-portal-hero-desc">
            To access proctored cadet mock exams, military intelligence tests, and
            cumulative report cards, please select an ongoing membership pass.
          </p>
        </div>

        {/* Expired / Terminated Alert Banner if free tier is hidden */}
        {shouldHideFreeTier && (
          <div
            className="plan-portal-expired-alert"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(185, 28, 28, 0.08) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
            }}
          >
            <div style={{ background: '#ef4444', borderRadius: '50%', padding: '6px', color: '#fff', display: 'flex' }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                Account Validity Expired / Terminated
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.45 }}>
                Your trial or faculty membership period has concluded. All your classes, student records, and quizzes have been <strong>safely preserved</strong>. Select an authorized membership pass below and complete payment via Easypaisa or JazzCash to reactivate your command desk.
              </div>
            </div>
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="plan-portal-grid">
          {PLAN_PACKAGES.filter((p) => !(shouldHideFreeTier && p.tier === 'trial')).map((plan) => {
            const isPopular = plan.popular;
            const isSelected = selectedPlan.id === plan.id;

            return (
              <motion.div
                key={plan.id}
                className={`plan-card ${isPopular ? 'plan-card-popular' : ''} ${
                  isSelected ? 'plan-card-selected' : ''
                }`}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedPlan(plan)}
              >
                {/* Popular / Best Value Badge */}
                {plan.badge && (
                  <div
                    className={`plan-card-badge ${
                      isPopular ? 'badge-popular' : 'badge-value'
                    }`}
                  >
                    {isPopular ? <Star size={13} fill="currentColor" /> : <Award size={13} />}
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div className="plan-card-header">
                  <h3 className="plan-card-title">{plan.name}</h3>
                  <p className="plan-card-tagline">{plan.tagline}</p>
                </div>

                <div className="plan-card-price-box">
                  <div className="plan-card-price">{plan.price}</div>
                  <div className="plan-card-duration">/ {plan.durationLabel}</div>
                </div>

                <div className="plan-card-quota-pill">
                  <span>Class Creation Limit:</span>
                  <strong>{plan.maxClasses} {plan.maxClasses === 1 ? 'Class' : 'Classes'}</strong>
                </div>

                {/* Features List */}
                <ul className="plan-card-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="plan-card-feature-item">
                      <CheckCircle size={16} className="feature-check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`plan-card-cta-btn ${
                    isPopular ? 'btn-gold' : 'btn-outline'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCheckout(plan);
                  }}
                >
                  <span>
                    {plan.tier === 'trial'
                      ? 'Start 7-Day Free Trial'
                      : `Select ${plan.name.split(' ')[1] || 'Pass'}`}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Academy Trust & Guarantees */}
        <div className="plan-portal-trust-strip">
          <div className="trust-item">
            <Shield size={18} color="var(--ccap-gold-500)" />
            <span>Official Cadets Coaching Academy Curriculum</span>
          </div>
          <div className="trust-item">
            <Zap size={18} color="var(--ccap-gold-500)" />
            <span>Instant Cloud Verification Across Laptop & Phone</span>
          </div>
          <div className="trust-item">
            <Award size={18} color="var(--ccap-gold-500)" />
            <span>Rank Placement & Verified Score Certificates</span>
          </div>
        </div>
      </main>

      {/* Checkout & Payment Modal */}
      <AnimatePresence>
        {checkoutModalOpen && (
          <div
            className="checkout-modal-overlay"
            data-lenis-prevent="true"
            onClick={() => setCheckoutModalOpen(false)}
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
                  <div className="checkout-modal-step">Academy Fee Checkout</div>
                  <h3 className="checkout-modal-title">{selectedPlan.name}</h3>
                </div>
                <button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="checkout-modal-close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="checkout-summary-box">
                <div className="checkout-summary-row">
                  <span>Selected Package</span>
                  <strong>{selectedPlan.name}</strong>
                </div>
                <div className="checkout-summary-row">
                  <span>Validity Period</span>
                  <span>{selectedPlan.durationLabel}</span>
                </div>
                <div className="checkout-summary-row checkout-total-row">
                  <span>Payable Fee</span>
                  <span className="checkout-total-price">{selectedPlan.price}</span>
                </div>
              </div>

              {isManualSent ? (
                <div style={{ textAlign: 'center', padding: '1rem 0.25rem' }}>
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: '#ecfdf5',
                      border: '2px solid #10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.15rem auto',
                    }}
                  >
                    <CheckCircle size={38} color="#059669" />
                  </div>

                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                    Payment Details Submitted for Manual Verification
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '440px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
                    Thank you, <strong>{user.name}</strong>! Your payment screenshot and details for <strong>{selectedPlan.name}</strong> ({selectedPlan.price}) have been submitted for manual examination.
                  </p>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Shield size={16} color="#059669" />
                      <span>Account Creation & Credentials Dispatch:</span>
                    </div>
                    <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#475569', lineHeight: 1.6 }}>
                      <li>
                        Ensure you have messaged your payment receipt screenshot to WhatsApp: <strong className="font-mono" style={{ color: '#0f172a' }}>03709993993</strong>.
                      </li>
                      <li>
                        Include your details: <strong>Name ({user.name})</strong>, <strong>Gmail ({user.email || user.loginId})</strong>, and <strong>Plan ({selectedPlan.name})</strong>.
                      </li>
                      <li>
                        After examining the payment manually, our administration will create your <strong>Teacher Account</strong> and deliver your login credentials directly to your WhatsApp and Gmail.
                      </li>
                    </ul>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {(() => {
                      const whatsappChannel = paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash';
                      const candidateEmail = user.email || user.loginId;
                      const whatsappMessage = encodeURIComponent(
                        `Assalam-o-Alaikum,\n\nI have sent the fee payment for Cadets Coaching Academy subscription.\n\n📋 *Payment & Account Details*:\n• *Name*: ${user.name}\n• *Gmail*: ${candidateEmail}\n• *Selected Plan*: ${selectedPlan.name} (${selectedPlan.price})\n• *Payment Channel*: ${whatsappChannel}\n• *Transferred To*: 03006565438 (Muhammad Afzal)\n\nI have attached my payment receipt screenshot with this message. Kindly examine and create my Teacher account with login credentials.\n\nThank you!`
                      );
                      const whatsappUrl = `https://wa.me/923709993993?text=${whatsappMessage}`;
                      return (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.55rem',
                            padding: '0.8rem 1rem',
                            background: '#25D366',
                            color: '#ffffff',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                          }}
                        >
                          <MessageCircle size={18} />
                          <span>Open WhatsApp Chat (03709993993)</span>
                          <ExternalLink size={15} />
                        </a>
                      );
                    })()}

                    <button
                      type="button"
                      className="btn-cancel"
                      style={{ width: '100%', padding: '0.75rem' }}
                      onClick={() => {
                        setCheckoutModalOpen(false);
                        setIsManualSent(false);
                      }}
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Payment Method Selector: ONLY 2 tabs (EasyPaisa & JazzCash) */}
                  <div className="payment-method-tabs" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <button
                      type="button"
                      className={`pm-tab-btn ${paymentMethod === 'easypaisa' ? 'pm-tab-active' : ''}`}
                      onClick={() => setPaymentMethod('easypaisa')}
                      style={
                        paymentMethod === 'easypaisa'
                          ? { borderColor: '#10b981', background: '#ecfdf5', color: '#047857' }
                          : {}
                      }
                    >
                      <Smartphone size={18} color={paymentMethod === 'easypaisa' ? '#059669' : '#64748b'} />
                      <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>EasyPaisa</span>
                    </button>

                    <button
                      type="button"
                      className={`pm-tab-btn ${paymentMethod === 'jazzcash' ? 'pm-tab-active' : ''}`}
                      onClick={() => setPaymentMethod('jazzcash')}
                      style={
                        paymentMethod === 'jazzcash'
                          ? { borderColor: '#ef4444', background: '#fef2f2', color: '#b91c1c' }
                          : {}
                      }
                    >
                      <Smartphone size={18} color={paymentMethod === 'jazzcash' ? '#dc2626' : '#64748b'} />
                      <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>JazzCash</span>
                    </button>
                  </div>

                  {/* Payment Details Drawer based on chosen method */}
                  <div className="pm-details-container">
                    <div
                      className="pm-instruction-card"
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.65rem',
                        }}
                      >
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                          Selected Account:
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: paymentMethod === 'easypaisa' ? '#dcfce7' : '#fee2e2',
                            color: paymentMethod === 'easypaisa' ? '#15803d' : '#b91c1c',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                          }}
                        >
                          {paymentMethod === 'easypaisa' ? 'EasyPaisa Wallet' : 'JazzCash Wallet'}
                        </span>
                      </div>

                      <div
                        className="pm-field-row"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span style={{ color: '#475569', fontSize: '0.85rem' }}>Account Holder Name:</span>
                        <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                          {paymentMethod === 'easypaisa'
                            ? ACADEMY_PAYMENT_CHANNELS.easypaisa.accountTitle
                            : ACADEMY_PAYMENT_CHANNELS.jazzcash.accountTitle}
                        </strong>
                      </div>

                      <div
                        className="pm-field-row"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <span style={{ color: '#475569', fontSize: '0.85rem' }}>Account Number:</span>
                        <div
                          className="copy-badge-wrapper"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <strong
                            className="font-mono"
                            style={{ fontSize: '1.05rem', color: '#0f172a', letterSpacing: '0.5px' }}
                          >
                            {paymentMethod === 'easypaisa'
                              ? ACADEMY_PAYMENT_CHANNELS.easypaisa.accountNumber
                              : ACADEMY_PAYMENT_CHANNELS.jazzcash.accountNumber}
                          </strong>
                          <button
                            type="button"
                            className="copy-btn"
                            title="Copy Account Number"
                            onClick={() =>
                              handleCopy(
                                paymentMethod === 'easypaisa'
                                  ? ACADEMY_PAYMENT_CHANNELS.easypaisa.accountNumber
                                  : ACADEMY_PAYMENT_CHANNELS.jazzcash.accountNumber,
                                'accNum'
                              )
                            }
                          >
                            {copiedKey === 'accNum' ? (
                              <Check size={14} color="#059669" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Manual Verification Protocol */}
                    <div
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '0.9rem 1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#1e40af',
                          marginBottom: '0.45rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Camera size={15} />
                        <span>Manual Payment & Verification Protocol:</span>
                      </div>

                      <ol
                        style={{
                          fontSize: '0.78rem',
                          color: '#1e3a8a',
                          paddingLeft: '1.2rem',
                          margin: 0,
                          lineHeight: 1.55,
                        }}
                      >
                        <li>
                          Transfer <strong>{selectedPlan.price}</strong> via{' '}
                          {paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} to{' '}
                          <strong>03006565438</strong> (Muhammad Afzal).
                        </li>
                        <li>
                          Take a clear <strong>screenshot</strong> of the completed payment receipt.
                        </li>
                        <li>
                          Send the screenshot via WhatsApp to{' '}
                          <strong className="font-mono">03709993993</strong> along with your{' '}
                          <strong>Name ({user.name})</strong>, <strong>Gmail ({user.email || user.loginId})</strong>, and{' '}
                          <strong>Plan ({selectedPlan.name})</strong>.
                        </li>
                        <li>
                          After examining the payment manually, administration will create your Teacher account and dispatch your login credentials.
                        </li>
                      </ol>
                    </div>

                    {/* Prominent WhatsApp Dispatch Button */}
                    {(() => {
                      const whatsappChannel = paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash';
                      const candidateEmail = user.email || user.loginId;
                      const whatsappMessage = encodeURIComponent(
                        `Assalam-o-Alaikum,\n\nI have sent the fee payment for Cadets Coaching Academy subscription.\n\n📋 *Payment & Account Details*:\n• *Name*: ${user.name}\n• *Gmail*: ${candidateEmail}\n• *Selected Plan*: ${selectedPlan.name} (${selectedPlan.price})\n• *Payment Channel*: ${whatsappChannel}\n• *Transferred To*: 03006565438 (Muhammad Afzal)\n\nI have attached my payment receipt screenshot with this message. Kindly examine and create my Teacher account with login credentials.\n\nThank you!`
                      );
                      const whatsappUrl = `https://wa.me/923709993993?text=${whatsappMessage}`;
                      return (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.55rem',
                            width: '100%',
                            padding: '0.85rem 1rem',
                            background: '#25D366',
                            color: '#ffffff',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                            marginBottom: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <MessageCircle size={19} />
                          <span>Send Screenshot on WhatsApp (03709993993)</span>
                          <ExternalLink size={15} />
                        </a>
                      );
                    })()}
                  </div>

                  {/* Form Submission for manual confirmation */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsManualSent(true);
                    }}
                  >
                    <div className="checkout-action-footer">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setCheckoutModalOpen(false)}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn-confirm-pay"
                        style={{
                          background: 'linear-gradient(135deg, #0a192f 0%, #1e3a5f 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle size={16} />
                        <span>I Have Sent Screenshot & Details</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {successAnimation && (
          <motion.div
            className="activation-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="activation-success-card"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="success-icon-ring">
                <Check size={36} color="#10b981" />
              </div>
              <h3 className="success-title">Membership Activated!</h3>
              <p className="success-desc">
                Welcome to the Cadet Command Desk. Preparing your examinations...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
