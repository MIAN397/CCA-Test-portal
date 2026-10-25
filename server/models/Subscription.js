import mongoose from 'mongoose';

/**
 * Decoupled Subscription & Plan Document
 * Tracks payment tiers, duration, quotas, and ledger states independently from the User profile.
 */
const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: String,
      enum: ['plan-trial', 'plan-monthly', 'plan-quarterly', 'plan-annual', 'plan-institutional'],
      default: 'plan-institutional',
      required: true,
    },
    planName: {
      type: String,
      default: 'Institutional Enrolled Pass',
    },
    tier: {
      type: String,
      enum: ['trial', 'monthly', 'quarterly', 'annual'],
      default: 'annual',
    },
    price: {
      type: String,
      default: 'Complimentary (Faculty Enrolled)',
    },
    durationDays: {
      type: Number,
      default: 365,
    },
    maxClassesQuota: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: ['active', 'pending_verification', 'expired', 'canceled'],
      default: 'active',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['free_trial', 'jazzcash', 'easypaisa', 'bank_transfer', 'credit_card', 'cash', 'safepay', 'institutional_voucher'],
      default: 'cash',
    },
    transactionRef: {
      type: String,
    },
    activatedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ userId: 1, status: 1, expiryDate: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
