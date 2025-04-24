-- This migration resets all migrations and creates the schema from scratch

-- First, check if we need to drop the existing tables
DO $$
BEGIN
    -- Drop existing tables if they exist
    DROP TABLE IF EXISTS "TeamJoinRequest" CASCADE;
    DROP TABLE IF EXISTS "CollabChat" CASCADE;
    DROP TABLE IF EXISTS "Collab" CASCADE;
    DROP TABLE IF EXISTS "Notification" CASCADE;
    DROP TABLE IF EXISTS "CommentReaction" CASCADE;
    DROP TABLE IF EXISTS "Comment" CASCADE;
    DROP TABLE IF EXISTS "PostReaction" CASCADE;
    DROP TABLE IF EXISTS "Post" CASCADE;
    DROP TABLE IF EXISTS "Snippet" CASCADE;
    DROP TABLE IF EXISTS "Follow" CASCADE;
    DROP TABLE IF EXISTS "User" CASCADE;
    
    -- Drop existing enums if they exist
    DROP TYPE IF EXISTS "ContentType" CASCADE;
    DROP TYPE IF EXISTS "NotificationType" CASCADE;
    DROP TYPE IF EXISTS "Privacy" CASCADE;
    DROP TYPE IF EXISTS "MediaFormat" CASCADE;
    DROP TYPE IF EXISTS "PostActionType" CASCADE;
    
    RAISE NOTICE 'Dropped existing tables and enums.';
END $$;

-- Create enums
CREATE TYPE "ContentType" AS ENUM ('POST', 'COMMENT');
CREATE TYPE "NotificationType" AS ENUM (
    'FOLLOW', 
    'COMMENT', 
    'COMMENT_REACTION', 
    'POST', 
    'POST_REACTION', 
    'TEAM_JOIN_REQUEST',
    'TEAM_JOINED',
    'TEAM_CREATED',
    'TEAM_INVITED',
    'COLLAB_ROOM_JOINED',
    'COLLAB_ROOM_CREATED',
    'COLLAB_ROOM_INVITED'
);
CREATE TYPE "Privacy" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "MediaFormat" AS ENUM ('AUDIO', 'IMAGE', 'VIDEO');
CREATE TYPE "PostActionType" AS ENUM ('SAVE', 'IGNORE');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userName" TEXT,
    "userAvatarUrl" TEXT,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- Create Snippet table
CREATE TABLE "Snippet" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" TEXT,
    "lang" TEXT DEFAULT '"plain"',
    "userId" TEXT,
    "theme" TEXT,
    CONSTRAINT "Snippet_pkey" PRIMARY KEY ("id")
);

-- Create Post table
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "userAvatarUrl" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "postImageUrl" TEXT,
    "postVideoUrl" TEXT,
    "snippetId" TEXT,
    "teamId" TEXT,
    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- Create Comment table
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "degree" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- Create CommentReaction table
CREATE TABLE "CommentReaction" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "contentType" "ContentType",
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- Create Follow table
CREATE TABLE "Follow" (
    "id" SERIAL NOT NULL,
    "followerId" TEXT NOT NULL,
    "followeeId" TEXT NOT NULL,
    "followedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- Create Notification table
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "teamId" TEXT,
    "roomId" TEXT,
    "notificationType" "NotificationType",
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "metadata" JSONB,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Create PostReaction table
CREATE TABLE "PostReaction" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- Create Collab table
CREATE TABLE "Collab" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by_userId" TEXT,
    "version" TEXT,
    "room_id" TEXT,
    CONSTRAINT "Collab_pkey" PRIMARY KEY ("id")
);

-- Create CollabChat table
CREATE TABLE "CollabChat" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "roomId" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollabChat_pkey" PRIMARY KEY ("id")
);

-- Create TeamJoinRequest table
CREATE TABLE "TeamJoinRequest" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    CONSTRAINT "TeamJoinRequest_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "Comment_parentId_fkey_unique" ON "Comment"("parentId");
CREATE INDEX "CommentReaction_commentId_fkey_unique" ON "CommentReaction"("commentId");
CREATE UNIQUE INDEX "CommentReaction_userId_commentId_key" ON "CommentReaction"("userId", "commentId");
CREATE INDEX "Follow_followeeId_fkey_unique" ON "Follow"("followeeId");
CREATE UNIQUE INDEX "Follow_followerId_followeeId_key" ON "Follow"("followerId", "followeeId");
CREATE INDEX "PostReaction_postId_fkey" ON "PostReaction"("postId");
CREATE UNIQUE INDEX "PostReaction_userId_postId_key" ON "PostReaction"("userId", "postId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");
CREATE INDEX "CollabChat_roomId_idx" ON "CollabChat"("roomId");
CREATE UNIQUE INDEX "TeamJoinRequest_userId_teamId_key" ON "TeamJoinRequest"("userId", "teamId");

-- Add foreign key constraints
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "Snippet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_userName_fkey" FOREIGN KEY ("userName") REFERENCES "User"("userName") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey_unique" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Snippet" ADD CONSTRAINT "Snippet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollabChat" ADD CONSTRAINT "CollabChat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Collab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Reset the _prisma_migrations table
DO $$
BEGIN
    -- Delete all existing migration records
    DELETE FROM _prisma_migrations;
    
    -- Insert a single migration record for this reset migration
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
    );
    
    RAISE NOTICE 'Reset _prisma_migrations table.';
END $$;
