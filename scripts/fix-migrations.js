// Script to reset migrations and ensure the database schema is correct
// Run this script with: node scripts/fix-migrations.js

const { PrismaClient } = require("@prisma/client")
const fs = require("node:fs")
const path = require("node:path")

// Create a Prisma client instance
const prisma = new PrismaClient()

async function fixMigrations() {
	try {
		console.log("Starting migration reset script...")

		// Step 1: Get the schema of _prisma_migrations table to understand its structure
		console.log("Checking _prisma_migrations table structure...")
		const tableInfo = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '_prisma_migrations'
    `

		console.log(
			"_prisma_migrations columns:",
			tableInfo.map((col) => col.column_name)
		)

		// Step 2: Check if the reset migration exists
		const resetMigration = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations
      WHERE migration_name = 'reset_migrations'
    `

		// Step 3: If the reset migration doesn't exist, apply it
		if (!resetMigration || resetMigration.length === 0) {
			console.log("Reset migration not found. Applying reset migration...")

			// Check which columns are required (not nullable)
			const requiredColumns = await prisma.$queryRaw`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_name = '_prisma_migrations'
        AND is_nullable = 'NO'
      `

			console.log(
				"Required columns:",
				requiredColumns.map((col) => col.column_name)
			)

			// Delete all existing migration records
			await prisma.$executeRaw`DELETE FROM _prisma_migrations`
			console.log("Deleted all existing migration records.")

			// Build a dynamic query with all required columns
			const hasChecksum = requiredColumns.some((col) => col.column_name === "checksum")

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
            'reset_migrations',
            NOW(),
            NOW(),
            'reset_migrations_checksum'
          )
        `
			} else {
				await prisma.$executeRaw`
          INSERT INTO _prisma_migrations (
            id,
            migration_name,
            started_at,
            finished_at
          ) VALUES (
            gen_random_uuid(),
            'reset_migrations',
            NOW(),
            NOW()
          )
        `
			}

			console.log("Added reset migration as completed.")
		} else {
			console.log("Reset migration already exists.")
		}

		// Step 4: Verify that all required tables exist
		console.log("Verifying database schema...")

		// Check if the TeamJoinRequest table exists
		console.log("Checking if TeamJoinRequest table exists...")
		const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'TeamJoinRequest'
      ) as exists
    `

		const teamJoinRequestExists = tableExists[0].exists
		console.log(`TeamJoinRequest table ${teamJoinRequestExists ? "exists" : "does not exist"}.`)

		// Check if the NotificationType enum exists with all required values
		console.log("Checking NotificationType enum...")
		try {
			const enumExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM pg_type
          WHERE typname = 'notificationtype'
        ) as exists
      `

			if (enumExists[0].exists) {
				console.log("NotificationType enum exists. Checking for required enum values...")

				// Check for all required enum values
				const requiredEnumValues = [
					"FOLLOW",
					"COMMENT",
					"COMMENT_REACTION",
					"POST",
					"POST_REACTION",
					"TEAM_JOIN_REQUEST",
					"TEAM_JOINED",
					"TEAM_CREATED",
					"TEAM_INVITED",
					"COLLAB_ROOM_JOINED",
					"COLLAB_ROOM_CREATED",
					"COLLAB_ROOM_INVITED",
				]

				for (const enumValue of requiredEnumValues) {
					try {
						await prisma.$executeRaw`
              DO $$
              BEGIN
                IF NOT EXISTS (
                  SELECT 1 FROM pg_enum
                  JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
                  WHERE pg_type.typname = 'notificationtype'
                  AND pg_enum.enumlabel = ${enumValue}
                ) THEN
                  ALTER TYPE "NotificationType" ADD VALUE ${enumValue};
                  RAISE NOTICE 'Added ${enumValue} enum value.';
                END IF;
              END
              $$;
            `
					} catch (error) {
						console.error(`Error checking/adding enum value ${enumValue}:`, error)
					}
				}

				console.log("Enum values check/add completed successfully.")
			} else {
				console.log(
					"NotificationType enum does not exist in the database. The reset migration should create it."
				)
			}
		} catch (error) {
			console.error("Error checking NotificationType enum:", error)
		}

		// Step 5: Apply the reset migration SQL if needed
		if (!teamJoinRequestExists) {
			console.log("TeamJoinRequest table does not exist. Applying reset migration SQL...")
			try {
				// Read and execute the reset migration SQL
				const migrationSql = fs.readFileSync(
					path.join(__dirname, "../prisma/migrations/reset_migrations/migration.sql"),
					"utf8"
				)

				// Execute the SQL
				await prisma.$executeRawUnsafe(migrationSql)
				console.log("Successfully applied reset migration SQL.")
			} catch (error) {
				console.error("Error applying reset migration SQL:", error)
			}
		}

		console.log("Migration reset completed successfully!")
	} catch (error) {
		console.error("Error resetting migrations:", error)
	} finally {
		await prisma.$disconnect()
	}
}

fixMigrations()
