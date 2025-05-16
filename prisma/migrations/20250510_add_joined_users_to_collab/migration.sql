-- Add joined_users column to Collab table
ALTER TABLE "Collab" ADD COLUMN "joined_users" JSONB;

-- Update existing records to have an empty array
UPDATE "Collab" SET "joined_users" = '[]'::jsonb WHERE "joined_users" IS NULL; 