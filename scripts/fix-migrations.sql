-- SQL script to fix the failed migration issue
-- This can be run directly against the database if the Node.js script doesn't work

-- 1. Check if the migration exists and is marked as failed
DO $$
DECLARE
    migration_exists BOOLEAN;
    migration_failed BOOLEAN;
BEGIN
    -- Check if the migration exists
    SELECT EXISTS (
        SELECT 1 FROM _prisma_migrations 
        WHERE migration_name = '20250501_add_team_join_request'
    ) INTO migration_exists;
    
    -- If it exists, check if it's failed (finished_at is NULL)
    IF migration_exists THEN
        SELECT (finished_at IS NULL) 
        FROM _prisma_migrations 
        WHERE migration_name = '20250501_add_team_join_request'
        INTO migration_failed;
        
        -- If it's failed, mark it as completed
        IF migration_failed THEN
            UPDATE _prisma_migrations 
            SET finished_at = NOW() 
            WHERE migration_name = '20250501_add_team_join_request';
            
            RAISE NOTICE 'Fixed failed migration: 20250501_add_team_join_request';
        ELSE
            RAISE NOTICE 'Migration exists but is not marked as failed.';
        END IF;
    ELSE
        -- If it doesn't exist, add it as completed
        INSERT INTO _prisma_migrations (
            id, 
            migration_name, 
            started_at, 
            finished_at
        ) VALUES (
            gen_random_uuid(), 
            '20250501_add_team_join_request', 
            NOW(), 
            NOW()
        );
        
        RAISE NOTICE 'Added missing migration as completed.';
    END IF;
END $$;

-- 2. Check if the NotificationType enum exists and add the value if needed
DO $$
BEGIN
    -- Check if the enum type exists
    IF EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'notificationtype'
    ) THEN
        -- Check if the enum value exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
            WHERE pg_type.typname = 'notificationtype' 
            AND pg_enum.enumlabel = 'TEAM_JOIN_REQUEST'
        ) THEN
            -- Add the enum value
            ALTER TYPE "NotificationType" ADD VALUE 'TEAM_JOIN_REQUEST';
            RAISE NOTICE 'Added TEAM_JOIN_REQUEST enum value.';
        ELSE
            RAISE NOTICE 'TEAM_JOIN_REQUEST enum value already exists.';
        END IF;
    ELSE
        RAISE NOTICE 'NotificationType enum does not exist.';
    END IF;
END $$;

-- 3. Create the TeamJoinRequest table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'TeamJoinRequest'
    ) THEN
        CREATE TABLE "TeamJoinRequest" (
            "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
            "userId" TEXT NOT NULL,
            "teamId" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3),
            CONSTRAINT "TeamJoinRequest_pkey" PRIMARY KEY ("id")
        );
        
        CREATE UNIQUE INDEX "TeamJoinRequest_userId_teamId_key" 
        ON "TeamJoinRequest"("userId", "teamId");
        
        RAISE NOTICE 'Created TeamJoinRequest table.';
    ELSE
        RAISE NOTICE 'TeamJoinRequest table already exists.';
    END IF;
END $$;

-- 4. Register the fix migration if it's not already registered
DO $$
DECLARE
    fix_migration_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM _prisma_migrations 
        WHERE migration_name = '20250502_fix_team_join_request'
    ) INTO fix_migration_exists;
    
    IF NOT fix_migration_exists THEN
        INSERT INTO _prisma_migrations (
            id, 
            migration_name, 
            started_at, 
            finished_at
        ) VALUES (
            gen_random_uuid(), 
            '20250502_fix_team_join_request', 
            NOW(), 
            NOW()
        );
        
        RAISE NOTICE 'Registered fix migration in _prisma_migrations table.';
    ELSE
        RAISE NOTICE 'Fix migration already registered in _prisma_migrations table.';
    END IF;
END $$;

-- 5. Show the current migration state
SELECT migration_name, started_at, finished_at
FROM _prisma_migrations 
ORDER BY started_at;
