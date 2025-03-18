-- Create CollabChat table for storing collaboration room messages
CREATE TABLE IF NOT EXISTS "public"."CollabChat" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "roomId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Add indexes for faster querying
  CONSTRAINT "CollabChat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Collab"("id") ON DELETE CASCADE,
  
  -- Add index on roomId for frequent queries
  CREATE INDEX IF NOT EXISTS "CollabChat_roomId_idx" ON "public"."CollabChat" ("roomId")
);

-- Enable row level security
ALTER TABLE "public"."CollabChat" ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting messages (anyone can read)
CREATE POLICY "Anyone can read collaboration messages"
  ON "public"."CollabChat"
  FOR SELECT
  USING (true);

-- Create policy for inserting messages (authenticated users only)
CREATE POLICY "Authenticated users can insert messages"
  ON "public"."CollabChat"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Set up realtime subscriptions for this table
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."CollabChat";
