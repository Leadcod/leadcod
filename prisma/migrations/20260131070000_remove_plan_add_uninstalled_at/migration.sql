-- AlterTable
ALTER TABLE "Shop" ADD COLUMN "uninstalledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "plan";

-- DropEnum
DROP TYPE "PlanType";
