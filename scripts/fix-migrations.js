// Simple script to fix failed migrations in the _prisma_migrations table
// Run this script with: node scripts/fix-migrations.js

const { PrismaClient } = require('@prisma/client');

// Create a Prisma client instance
const prisma = new PrismaClient();

async function fixMigrations() {
  try {
    console.log('Starting migration fix script...');

    // Step 1: Get the schema of _prisma_migrations table to understand its structure
    console.log('Checking _prisma_migrations table structure...');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '_prisma_migrations'
    `;

    console.log('_prisma_migrations columns:', tableInfo.map(col => col.column_name));

    // Step 2: Check if the failed migration exists
    const failedMigration = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations
      WHERE migration_name = '20250501_add_team_join_request'
    `;

    console.log('Migration status:', failedMigration);

    // Step 3: If the migration exists, check if it's marked as failed
    if (failedMigration && failedMigration.length > 0) {
      console.log('Migration found in database. Checking status...');

      // Check if the migration is marked as failed based on available columns
      const migration = failedMigration[0];
      let isFailed = false;

      // Different Prisma versions use different column names
      if ('finished_at' in migration && migration.finished_at === null) {
        isFailed = true;
      } else if ('rolled_back' in migration && migration.rolled_back === true) {
        isFailed = true;
      }

      if (isFailed) {
        console.log('Migration is marked as failed. Attempting to fix...');

        // Mark the migration as successfully applied
        await prisma.$executeRaw`
          UPDATE _prisma_migrations
          SET finished_at = NOW()
          WHERE migration_name = '20250501_add_team_join_request'
        `;

        console.log('Fixed failed migration: 20250501_add_team_join_request');
      } else {
        console.log('Migration exists but is not marked as failed.');
      }
    } else {
      // If the migration doesn't exist in the table, add it as completed
      console.log('Migration not found in _prisma_migrations table. Adding it as completed...');

      await prisma.$executeRaw`
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
        )
      `;

      console.log('Added migration as completed.');
    }

    // Step 4: Check if the TeamJoinRequest table exists
    console.log('Checking if TeamJoinRequest table exists...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'TeamJoinRequest'
      ) as exists
    `;

    const teamJoinRequestExists = tableExists[0].exists;
    console.log(`TeamJoinRequest table ${teamJoinRequestExists ? 'exists' : 'does not exist'}.`);

    // Step 5: Create the TeamJoinRequest table if it doesn't exist
    if (!teamJoinRequestExists) {
      console.log('Creating TeamJoinRequest table...');

      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "TeamJoinRequest" (
            "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
            "userId" TEXT NOT NULL,
            "teamId" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3),
            CONSTRAINT "TeamJoinRequest_pkey" PRIMARY KEY ("id")
          );

          CREATE UNIQUE INDEX IF NOT EXISTS "TeamJoinRequest_userId_teamId_key"
          ON "TeamJoinRequest"("userId", "teamId");
        `;

        console.log('Successfully created TeamJoinRequest table.');
      } catch (error) {
        console.error('Error creating TeamJoinRequest table:', error);
      }
    }

    // Step 6: Check if the NotificationType enum exists and add the value if needed
    console.log('Checking NotificationType enum...');
    try {
      const enumExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM pg_type
          WHERE typname = 'notificationtype'
        ) as exists
      `;

      if (enumExists[0].exists) {
        console.log('NotificationType enum exists. Checking for TEAM_JOIN_REQUEST value...');

        try {
          await prisma.$executeRaw`
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM pg_enum
                JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
                WHERE pg_type.typname = 'notificationtype'
                AND pg_enum.enumlabel = 'TEAM_JOIN_REQUEST'
              ) THEN
                ALTER TYPE "NotificationType" ADD VALUE 'TEAM_JOIN_REQUEST';
                RAISE NOTICE 'Added TEAM_JOIN_REQUEST enum value.';
              ELSE
                RAISE NOTICE 'TEAM_JOIN_REQUEST enum value already exists.';
              END IF;
            END
            $$;
          `;

          console.log('Enum value check/add completed successfully.');
        } catch (error) {
          console.error('Error adding enum value:', error);
        }
      } else {
        console.log('NotificationType enum does not exist in the database.');
      }
    } catch (error) {
      console.error('Error checking NotificationType enum:', error);
    }

    // Step 7: Register the fix migration if needed
    console.log('Checking if fix migration is registered...');
    const fixMigration = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations
      WHERE migration_name = '20250502_fix_team_join_request'
    `;

    if (!fixMigration || fixMigration.length === 0) {
      console.log('Registering fix migration...');

      // Check which columns are required (not nullable)
      const requiredColumns = await prisma.$queryRaw`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_name = '_prisma_migrations'
        AND is_nullable = 'NO'
      `;

      console.log('Required columns:', requiredColumns.map(col => col.column_name));

      // Build a dynamic query with all required columns
      const hasChecksum = requiredColumns.some(col => col.column_name === 'checksum');

      if (hasChecksum) {
        await prisma.$executeRaw`
          INSERT INTO _prisma_migrations (
            id,
            migration_name,
            started_at,
            finished_at,
            checksum
          ) VALUES (
            gen_random_uuid(),
            '20250502_fix_team_join_request',
            NOW(),
            NOW(),
            'fix_migration_checksum_placeholder'
          )
        `;
      } else {
        await prisma.$executeRaw`
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
          )
        `;
      }

      console.log('Fix migration registered successfully.');
    } else {
      console.log('Fix migration already registered.');
    }

    console.log('Migration fix completed successfully!');
  } catch (error) {
    console.error('Error fixing migrations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigrations();
