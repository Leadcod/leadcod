-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('free', 'paid');

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'free';
