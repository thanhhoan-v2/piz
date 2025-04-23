// This script fixes the failed migration in the _prisma_migrations table
// Run this script with: node scripts/fix-migrations.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMigrations() {
  try {
    console.log('Starting migration fix script...');
    
    // Check if the failed migration exists in the _prisma_migrations table
    const failedMigration = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations 
      WHERE migration_name = '20250501_add_team_join_request' 
      AND applied_steps_count < migration_steps_count
    `;
    
    console.log('Failed migration status:', failedMigration);
    
    if (failedMigration && failedMigration.length > 0) {
      // Mark the failed migration as applied
      await prisma.$executeRaw`
        UPDATE _prisma_migrations 
        SET applied_steps_count = migration_steps_count, 
            finished_at = NOW() 
        WHERE migration_name = '20250501_add_team_join_request'
      `;
      
      console.log('Fixed failed migration: 20250501_add_team_join_request');
    } else {
      console.log('No failed migration found or it has already been fixed.');
    }
    
    // Apply the new fix migration if needed
    const fixMigration = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations 
      WHERE migration_name = '20250502_fix_team_join_request'
    `;
    
    if (!fixMigration || fixMigration.length === 0) {
      console.log('Adding fix migration to _prisma_migrations table...');
      
      await prisma.$executeRaw`
        INSERT INTO _prisma_migrations (
          id, 
          migration_name, 
          started_at, 
          applied_steps_count, 
          migration_steps_count, 
          finished_at
        ) VALUES (
          gen_random_uuid(), 
          '20250502_fix_team_join_request', 
          NOW(), 
          1, 
          1, 
          NOW()
        )
      `;
      
      console.log('Added fix migration to _prisma_migrations table.');
    } else {
      console.log('Fix migration already exists in _prisma_migrations table.');
    }
    
    console.log('Migration fix completed successfully!');
  } catch (error) {
    console.error('Error fixing migrations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigrations();
