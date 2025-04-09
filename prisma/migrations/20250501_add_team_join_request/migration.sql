-- CreateEnum
ALTER TYPE "NotificationType" ADD VALUE 'TEAM_JOIN_REQUEST';

-- CreateTable
CREATE TABLE "TeamJoinRequest" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "TeamJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamJoinRequest_userId_teamId_key" ON "TeamJoinRequest"("userId", "teamId");
