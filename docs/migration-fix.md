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

We've implemented a two-part solution:

1. **Fix Migration Script**: A JavaScript script (`scripts/fix-migrations.js`) that:
   - Marks the failed migration as completed in the `_prisma_migrations` table
   - Registers our new fix migration

2. **Recovery Migration**: A new migration (`20250502_fix_team_join_request`) that:
   - Safely checks if the enum value already exists before adding it
   - Checks if the table exists before creating it
   - Uses SQL's `IF NOT EXISTS` clauses to prevent errors

## How to Apply the Fix

### In Development

Run:

```bash
npm run db:fix-migrations
```

This will execute the fix script to repair the migration state.

### In Production (Vercel)

The fix is automatically applied during the build process. We've updated the `vercel-build` script in `package.json` to run the fix script before attempting to apply migrations:

```json
"vercel-build": "prisma generate && node scripts/fix-migrations.js && prisma migrate deploy && next build"
```

## Preventing Future Issues

To prevent similar issues in the future:

1. Always use idempotent migrations that can be safely re-run
2. Use conditional logic in migrations for operations that might fail
3. Test migrations thoroughly in development before deploying
4. Consider using Prisma's shadow database feature during development

## References

- [Prisma Migration Troubleshooting Guide](https://pris.ly/d/migrate-resolve)
- [Prisma Migration Engine Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
