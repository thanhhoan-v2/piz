# Migration Reset Process

This document explains how we've reset the Prisma migrations to fix issues with the database schema.

## What We've Done

1. **Created a Reset Migration**: We've created a single migration file that captures the entire database schema in its current state.

2. **Removed Problematic Migrations**: We've removed the problematic migrations that were causing issues.

3. **Updated the Fix Script**: We've updated the `fix-migrations.js` script to handle the reset process.

4. **Added a Reset Command**: We've added a `db:reset-migrations` command to the package.json scripts.

## How It Works

The reset process works by:

1. **Checking the Migration State**: The script checks if the reset migration is already applied.

2. **Clearing Migration History**: If needed, it clears the `_prisma_migrations` table.

3. **Registering the Reset Migration**: It registers a single "reset_migrations" entry in the `_prisma_migrations` table.

4. **Verifying Schema Integrity**: It checks that all required tables and enum values exist.

5. **Applying the Reset Migration**: If any required tables are missing, it applies the reset migration SQL.

## How to Use

### In Development

To reset the migrations in your development environment:

```bash
npm run db:reset-migrations
```

This will apply the reset migration and ensure your database schema is correct.

### In Production (Vercel)

The reset process is automatically applied during the build process. The `vercel-build` script in `package.json` runs the fix script:

```json
"vercel-build": "prisma generate && node scripts/fix-migrations.js && next build"
```

## Preventing Future Issues

To prevent similar issues in the future:

1. **Use Conditional Migrations**: Always use conditional logic in migrations (IF NOT EXISTS) for operations that might fail.

2. **Test Migrations Thoroughly**: Test migrations in development before deploying.

3. **Use Schema Versioning**: Consider adding a version table to track schema versions.

4. **Regular Backups**: Ensure you have regular database backups.

## Troubleshooting

If you encounter issues with the reset process:

1. **Check the Logs**: Look for error messages in the console output.

2. **Verify Database Access**: Ensure the script has proper access to the database.

3. **Manual Reset**: If needed, you can manually execute the SQL in the reset migration file.

4. **Contact Support**: If problems persist, contact the development team for assistance.

## References

- [Prisma Migration Troubleshooting Guide](https://pris.ly/d/migrate-resolve)
- [Prisma Migration Engine Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL DDL Commands](https://www.postgresql.org/docs/current/ddl.html)
