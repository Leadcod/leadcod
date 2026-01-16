/**
 * Plan types enum
 * Matches the PlanType enum in Prisma schema
 */
export enum PlanType {
  FREE = 'free',
  PAID = 'paid'
}

/**
 * Type for plan type values
 */
export type PlanTypeValue = PlanType.FREE | PlanType.PAID;
