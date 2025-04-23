-- This migration fixes the failed 20250501_add_team_join_request migration
-- First, check if the TEAM_JOIN_REQUEST enum value already exists
DO $$
BEGIN
    -- Check if the enum value already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'notificationtype'
        AND pg_enum.enumlabel = 'TEAM_JOIN_REQUEST'
    ) THEN
        -- Add the enum value if it doesn't exist
        ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TEAM_JOIN_REQUEST';
    END IF;
END
$$;

-- Check if TeamJoinRequest table exists before creating it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'TeamJoinRequest') THEN
        -- Create the TeamJoinRequest table if it doesn't exist
        CREATE TABLE "TeamJoinRequest" (
            "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
            "userId" TEXT NOT NULL,
            "teamId" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3),

            CONSTRAINT "TeamJoinRequest_pkey" PRIMARY KEY ("id")
        );

        -- Create the unique index if it doesn't exist
        CREATE UNIQUE INDEX IF NOT EXISTS "TeamJoinRequest_userId_teamId_key" ON "TeamJoinRequest"("userId", "teamId");
    END IF;
END
$$;
