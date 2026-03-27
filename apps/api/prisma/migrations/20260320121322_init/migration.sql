-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "role" "AccountRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Haiku" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "titleSuffix" INTEGER NOT NULL DEFAULT 0,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" UUID NOT NULL,
    "createdById" UUID NOT NULL,

    CONSTRAINT "Haiku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" UUID NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HaikuToLabel" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_HaikuToLabel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_accountId_idx" ON "Membership"("accountId");

-- CreateIndex
CREATE INDEX "Membership_accountId_role_idx" ON "Membership"("accountId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_accountId_key" ON "Membership"("userId", "accountId");

-- CreateIndex
CREATE INDEX "Haiku_accountId_idx" ON "Haiku"("accountId");

-- CreateIndex
CREATE INDEX "Haiku_createdById_idx" ON "Haiku"("createdById");

-- CreateIndex
CREATE INDEX "Haiku_accountId_createdAt_idx" ON "Haiku"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "Haiku_accountId_title_titleSuffix_idx" ON "Haiku"("accountId", "title", "titleSuffix" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Haiku_accountId_title_titleSuffix_key" ON "Haiku"("accountId", "title", "titleSuffix");

-- CreateIndex
CREATE INDEX "Label_accountId_idx" ON "Label"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Label_accountId_name_key" ON "Label"("accountId", "name");

-- CreateIndex
CREATE INDEX "_HaikuToLabel_B_index" ON "_HaikuToLabel"("B");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Haiku" ADD CONSTRAINT "Haiku_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Haiku" ADD CONSTRAINT "Haiku_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HaikuToLabel" ADD CONSTRAINT "_HaikuToLabel_A_fkey" FOREIGN KEY ("A") REFERENCES "Haiku"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HaikuToLabel" ADD CONSTRAINT "_HaikuToLabel_B_fkey" FOREIGN KEY ("B") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
