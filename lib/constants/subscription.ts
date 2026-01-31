/**
 * Subscription status enum (uppercase, matches DB values)
 */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  ACCEPTED = 'ACCEPTED',
  CANCELLED = 'CANCELLED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  FROZEN = 'FROZEN',
  PENDING = 'PENDING',
}

/** Statuses that mean the subscription is no longer active */
export const CANCELLED_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.CANCELLED,
  SubscriptionStatus.DECLINED,
  SubscriptionStatus.EXPIRED,
  SubscriptionStatus.FROZEN,
]

/** Statuses that mean the subscription is active (confirmed and billing) */
export const ACTIVE_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.ACCEPTED,
]
