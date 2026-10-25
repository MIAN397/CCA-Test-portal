/**
 * Cadets Coaching Academy - Membership & Subscription System
 * Manages plan tiers, pricing, payment channels, and active access verification.
 */

import {
  UserSubscription,
  PlanPackage,
  SubscriptionPlanTier,
  PaymentMethod,
} from '../types';

export const PLAN_PACKAGES: PlanPackage[] = [
  {
    id: 'plan-trial',
    tier: 'trial',
    name: 'Cadet 1-Week Starter Trial',
    price: 'Free',
    priceAmount: 0,
    durationDays: 7,
    durationLabel: '7 Days (1 Week)',
    maxClasses: 1,
    badge: 'Instant Access',
    tagline: 'Experience full academy mock exams and classroom creation with zero commitment.',
    features: [
      'Create up to 1 Class (Lifetime)',
      'Access to active Cadet Prep quizzes',
      'Instant AI-evaluated scorecard',
      'Detailed answer explanations & tips',
      'Mobile & desktop test taking',
      'No credit card required',
    ],
  },
  {
    id: 'plan-monthly',
    tier: 'monthly',
    name: 'Cadet Monthly Prep Pass',
    price: 'PKR 1,000',
    priceAmount: 1000,
    durationDays: 30,
    durationLabel: '30 Days',
    maxClasses: 3,
    tagline: 'Standard monthly membership for focused weekly exam prep and classes.',
    features: [
      'Create up to 3 Classes (Lifetime)',
      'Unlimited access to all enrolled class tests',
      'Real-time timer & proctored anti-cheat engine',
      'Subject-wise performance breakdown',
      'Academy leaderboard ranking',
      'Cumulative score certificate',
    ],
  },
  {
    id: 'plan-quarterly',
    tier: 'quarterly',
    name: 'Cadet 3-Month Term Prep Pass',
    price: 'PKR 2,500',
    priceAmount: 2500,
    durationDays: 90,
    durationLabel: '90 Days (3 Months)',
    maxClasses: 5,
    popular: true,
    badge: 'Most Popular',
    tagline: 'Comprehensive 3-month preparation for Cadet College entrance exams.',
    features: [
      'Create up to 5 Classes (Lifetime)',
      'All Monthly Pass benefits included',
      'Special military college preparation modules',
      'Verbal & Non-Verbal Intelligence test series',
      'Parent Progress Summary Card export',
      'Priority academic support & feedback',
      'Saves over 16% compared to monthly',
    ],
  },
  {
    id: 'plan-annual',
    tier: 'annual',
    name: 'Annual Commission & Cadet Pass',
    price: 'PKR 7,500',
    priceAmount: 7500,
    durationDays: 365,
    durationLabel: '365 Days (Full Year)',
    maxClasses: 5,
    badge: 'Best Value',
    tagline: 'Complete 1-year unlimited access across all cadet & military batches.',
    features: [
      'Create up to 5 Classes (Lifetime)',
      'Full 12 months uninterrupted academy access',
      'All class tiers (Class 6, 7, 8, Grade 9/10, PMA Prep)',
      'Unlimited retake practice on Quiz Bank archives',
      'Verified Academy Cadet Certificate',
      'Direct faculty performance reviews',
      'Saves over 37% annually',
    ],
  },
];

export const ACADEMY_PAYMENT_CHANNELS = {
  easypaisa: {
    name: 'EasyPaisa',
    accountTitle: 'Muhammad Afzal',
    accountNumber: '03006565438',
    whatsappNumber: '03709993993',
    instructions:
      'Transfer fee via EasyPaisa to 03006565438 (Account Holder: Muhammad Afzal). Take a screenshot of the payment receipt and send it to 03709993993 via WhatsApp along with your Name, Gmail, and Selected Plan.',
  },
  jazzcash: {
    name: 'JazzCash',
    accountTitle: 'Muhammad Afzal',
    accountNumber: '03006565438',
    whatsappNumber: '03709993993',
    instructions:
      'Transfer fee via JazzCash to 03006565438 (Account Holder: Muhammad Afzal). Take a screenshot of the payment receipt and send it to 03709993993 via WhatsApp along with your Name, Gmail, and Selected Plan.',
  },
  bankTransfer: {
    name: 'Bank Transfer / Raast',
    bankName: 'Meezan Bank Limited',
    accountTitle: 'Muhammad Afzal',
    accountNumber: '03006565438',
    iban: 'PK64MEZN0001010102030405',
    instructions:
      'Transfer to Meezan Bank IBAN. Send payment receipt to 03709993993 on WhatsApp.',
  },
  safepay: {
    name: 'Online Gateway (Safepay)',
    accountTitle: 'Muhammad Afzal',
    accountNumber: '03006565438',
    instructions:
      'Transfer fee to 03006565438 and send screenshot to 03709993993 on WhatsApp.',
  },
};

/**
 * Checks if a subscription is currently active and within its valid date window
 */
export function isSubscriptionActive(sub?: UserSubscription | null): boolean {
  if (!sub) return false;
  if (sub.status !== 'active' && sub.status !== 'pending_verification') return false;

  const expiryTime = new Date(sub.expiryDate).getTime();
  if (isNaN(expiryTime)) return false;

  return expiryTime > Date.now();
}

/**
 * Computes remaining days until subscription expiry
 */
export function getDaysRemaining(sub?: UserSubscription | null): number {
  if (!sub || !isSubscriptionActive(sub)) return 0;
  const diff = new Date(sub.expiryDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Generates a structured UserSubscription object for a given plan and user
 */
export function createSubscriptionRecord(
  user: { id: string; name: string; email?: string; loginId: string },
  tier: SubscriptionPlanTier,
  paymentMethod: PaymentMethod,
  transactionRef?: string,
  notes?: string
): UserSubscription {
  const plan = PLAN_PACKAGES.find((p) => p.tier === tier) || PLAN_PACKAGES[0];
  const now = new Date();
  const expiry = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  // Free trial, Safepay, or card simulation gets instant active status; bank/mobile wallets get pending_verification
  const isInstant =
    paymentMethod === 'free_trial' ||
    paymentMethod === 'credit_card' ||
    paymentMethod === 'cash' ||
    paymentMethod === 'safepay';


  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    loginId: user.loginId,
    planId: plan.id,
    planName: plan.name,
    tier: plan.tier,
    price: plan.price,
    durationDays: plan.durationDays,
    maxClasses: plan.maxClasses,
    status: isInstant ? 'active' : 'pending_verification',
    startDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    paymentMethod,
    transactionRef: transactionRef?.trim() || (isInstant ? 'INSTANT-APPROVED' : undefined),
    activatedAt: now.toISOString(),
    verifiedAt: isInstant ? now.toISOString() : undefined,
    verifiedBy: isInstant ? 'SYSTEM' : undefined,
    notes,
  };
}

/**
 * Extends an existing subscription by a specified number of days
 */
export function extendSubscriptionRecord(
  sub: UserSubscription,
  additionalDays: number,
  extendedBy: string = 'Admin'
): UserSubscription {
  const currentExpiry = new Date(sub.expiryDate).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiry = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000);

  return {
    ...sub,
    status: 'active',
    durationDays: sub.durationDays + additionalDays,
    expiryDate: newExpiry.toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: extendedBy,
    notes: `${sub.notes || ''} [Extended ${additionalDays} days by ${extendedBy} on ${new Date().toLocaleDateString()}]`.trim(),
  };
}
