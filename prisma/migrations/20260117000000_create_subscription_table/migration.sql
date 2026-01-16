-- Create Subscription table
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "shopifyChargeId" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "billingCycle" TEXT,
    "price" DOUBLE PRECISION,
    "currencyCode" TEXT DEFAULT 'USD',
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "Subscription_shopId_idx" ON "Subscription"("shopId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_shopifyChargeId_idx" ON "Subscription"("shopifyChargeId");

-- Add foreign key
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing subscription data from Shop to Subscription table
-- Only migrate shops that have subscription data (plan = 'paid' and have subscription info)
INSERT INTO "Subscription" (
    "id",
    "shopId",
    "shopifyChargeId",
    "status",
    "startedAt",
    "expiresAt",
    "billingCycle",
    "price",
    "currencyCode",
    "cancelledAt",
    "createdAt",
    "updatedAt"
)
SELECT 
    gen_random_uuid()::text as "id",
    "id" as "shopId",
    NULL as "shopifyChargeId",
    COALESCE("subscriptionStatus", 'active') as "status",
    COALESCE("subscriptionStartedAt", NOW()) as "startedAt",
    "planExpiresAt" as "expiresAt",
    NULL as "billingCycle",
    NULL as "price",
    'USD' as "currencyCode",
    CASE WHEN "subscriptionStatus" = 'cancelled' THEN NOW() ELSE NULL END as "cancelledAt",
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM "Shop"
WHERE "plan" = 'paid' 
  AND ("subscriptionStartedAt" IS NOT NULL OR "subscriptionStatus" IS NOT NULL OR "planExpiresAt" IS NOT NULL);

-- Drop subscription-related columns from Shop table
ALTER TABLE "Shop" DROP COLUMN IF EXISTS "planExpiresAt";
ALTER TABLE "Shop" DROP COLUMN IF EXISTS "subscriptionStartedAt";
ALTER TABLE "Shop" DROP COLUMN IF EXISTS "subscriptionStatus";
