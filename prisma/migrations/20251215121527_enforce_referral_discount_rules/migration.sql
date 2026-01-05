-- AlterTable
ALTER TABLE "SubscriptionPlan" ALTER COLUMN "trialDays" SET DEFAULT 7;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralDiscountUsed" BOOLEAN NOT NULL DEFAULT false;
