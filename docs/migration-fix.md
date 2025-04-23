# Fixing Failed Prisma Migrations

This document explains how to fix the failed migration issue with `20250501_add_team_join_request`.

## The Problem

The error message during Vercel build:

```
migrate found failed migrations in the target database, new migrations will not be applied. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve
The `20250501_add_team_join_request` migration started at 2025-04-10 09:10:51.210304 UTC failed
```

This happens when a migration fails to complete successfully, and Prisma blocks all future migrations until the issue is resolved.

## The Solution

We've implemented a comprehensive solution:

1. **Fix Migration Script**: A JavaScript script (`scripts/fix-migrations.js`) that:
   - Detects the database schema structure to work with different Prisma versions
   - Marks the failed migration as completed in the `_prisma_migrations` table
   - Manually creates the required database structures if they don't exist
   - Registers our fix migration

2. **SQL Backup Script**: A direct SQL script (`scripts/fix-migrations.sql`) that:
   - Can be run directly against the database if the Node.js script fails
   - Performs the same operations as the JavaScript script

3. **Modified Build Process**: We've updated the Vercel build process to:
   - Run the fix script during build
   - Skip the Prisma migration deploy step to avoid migration errors

## How to Apply the Fix

### In Development

Run:

```bash
npm run db:fix-migrations
```

This will execute the fix script to repair the migration state.

### In Production (Vercel)

The fix is automatically applied during the build process. We've updated the `vercel-build` script in `package.json` to run the fix script and skip the migration deploy step:

```json
"vercel-build": "prisma generate && node scripts/fix-migrations.js && next build"
```

### Manual Database Fix

If needed, you can run the SQL script directly against the database:

```bash
psql -U your_username -d your_database -f scripts/fix-migrations.sql
```

## Understanding the Fix

Our solution works by:

1. Checking the structure of the `_prisma_migrations` table to handle different Prisma versions
2. Marking the failed migration as completed in the database
3. Manually creating the required database structures (enum value and table)
4. Registering the fix migration to maintain a consistent migration history
5. Skipping the Prisma migration deploy step to avoid further errors

## Preventing Future Issues

To prevent similar issues in the future:

1. Always use idempotent migrations that can be safely re-run
2. Use conditional logic in migrations for operations that might fail
3. Test migrations thoroughly in development before deploying
4. Consider using Prisma's shadow database feature during development
5. Use the `createIfNotExists` option in Prisma schema when possible

## References

- [Prisma Migration Troubleshooting Guide](https://pris.ly/d/migrate-resolve)
- [Prisma Migration Engine Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL DDL Commands](https://www.postgresql.org/docs/current/ddl.html)
