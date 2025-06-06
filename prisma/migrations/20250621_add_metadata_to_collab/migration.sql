-- Add metadata column to Collab table for storing source information
ALTER TABLE "Collab" ADD COLUMN "metadata" JSONB; 