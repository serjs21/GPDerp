-- CreateEnum
CREATE TYPE "ShareLinkDeactivationReason" AS ENUM ('manual', 'timeout', 'limit_reached');

-- AlterTable
ALTER TABLE "ShareLink" ADD COLUMN "deactivationReason" "ShareLinkDeactivationReason";
