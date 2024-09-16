/*
  Warnings:

  - You are about to drop the `app_user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `follow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AttachmentFormat" AS ENUM ('AUDIO', 'IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('POST', 'COMMENT');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('POST', 'COMMENT');

-- CreateEnum
CREATE TYPE "FollowStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FOLLOW', 'FOLLOW_SUGGEST', 'TAG', 'COMMENT', 'REACT');

-- CreateEnum
CREATE TYPE "PostActionType" AS ENUM ('SAVE', 'IGNORE');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'FOLLOWERS_ONLY', 'MENTIONED_ONLY', 'FANS_ONLY', 'ME_ONLY');

-- CreateEnum
CREATE TYPE "PrivacyMode" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LOVE', 'HATE');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('SPAM', 'HARASSMENT', 'INAPPROPRIATE');

-- DropForeignKey
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_post_id_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_post_id_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "follow" DROP CONSTRAINT "follow_followee_id_fkey";

-- DropForeignKey
ALTER TABLE "follow" DROP CONSTRAINT "follow_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_post_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_reaction_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_userName_fkey";

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reaction" DROP CONSTRAINT "reaction_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "reaction" DROP CONSTRAINT "reaction_post_id_fkey";

-- DropForeignKey
ALTER TABLE "reaction" DROP CONSTRAINT "reaction_user_id_fkey";

-- DropTable
DROP TABLE "app_user";

-- DropTable
DROP TABLE "attachment";

-- DropTable
DROP TABLE "comment";

-- DropTable
DROP TABLE "follow";

-- DropTable
DROP TABLE "notification";

-- DropTable
DROP TABLE "post";

-- DropTable
DROP TABLE "reaction";

-- DropEnum
DROP TYPE "attachment_format";

-- DropEnum
DROP TYPE "attachment_type";

-- DropEnum
DROP TYPE "content_type";

-- DropEnum
DROP TYPE "follow_status";

-- DropEnum
DROP TYPE "notification_type";

-- DropEnum
DROP TYPE "post_action_type";

-- DropEnum
DROP TYPE "post_visibility";

-- DropEnum
DROP TYPE "privacy_mode";

-- DropEnum
DROP TYPE "reaction_type";

-- DropEnum
DROP TYPE "report_type";

-- CreateTable
CREATE TABLE "SavedPost" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "postId" TEXT NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),

    CONSTRAINT "SavedPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostReaction" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "postId" TEXT NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReaction" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "commentId" TEXT NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "isActive" BOOLEAN DEFAULT false,
    "privacyMode" "PrivacyMode" DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedAt" TIMESTAMPTZ(6),
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "userName" TEXT,
    "userAvatarUrl" TEXT,
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "postId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "soundDuration" TEXT,
    "attachmentType" "AttachmentType",
    "format" "AttachmentFormat",
    "isDeleted" BOOLEAN DEFAULT false,
    "contentType" "ContentType",
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "degree" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "userName" TEXT,
    "userAvatarUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" SERIAL NOT NULL,
    "followerId" UUID NOT NULL,
    "followeeId" UUID NOT NULL,
    "requestStatus" "FollowStatus" NOT NULL DEFAULT 'PENDING',
    "followedAt" TIMESTAMPTZ(6) DEFAULT (now() AT TIME ZONE 'utc'::text),
    "acceptedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "blockerId" UUID NOT NULL,
    "blockedId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "taggedId" UUID NOT NULL,
    "taggerId" UUID NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    "commentId" TEXT,
    "postReactionId" INTEGER,
    "commentReactionId" INTEGER,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "senderId" UUID NOT NULL,
    "senderUserName" TEXT,
    "senderAvatarUrl" TEXT,
    "receiverId" UUID NOT NULL,
    "followId" INTEGER,
    "postId" TEXT,
    "commentId" TEXT,
    "postReactionId" INTEGER,
    "commentReactionId" INTEGER,
    "tagId" INTEGER,
    "notificationType" "NotificationType",
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    "isRead" BOOLEAN DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Share" (
    "id" SERIAL NOT NULL,
    "senderId" UUID,
    "receiverId" UUID,
    "postId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "contentType" "ContentType",
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uniquePostReaction" ON "PostReaction"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "uniqueCommentReaction" ON "CommentReaction"("userId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_fullName_key" ON "AppUser"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_userName_key" ON "AppUser"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_avatarUrl_key" ON "AppUser"("avatarUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followeeId_key" ON "Follow"("followerId", "followeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockedId_key" ON "Block"("blockerId", "blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_taggerId_taggedId_postId_key" ON "Tag"("taggerId", "taggedId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_senderId_receiverId_notificationType_key" ON "Notification"("senderId", "receiverId", "notificationType");

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userAvatarUrl_fkey" FOREIGN KEY ("userAvatarUrl") REFERENCES "AppUser"("avatarUrl") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followeeId_fkey" FOREIGN KEY ("followeeId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_taggedId_fkey" FOREIGN KEY ("taggedId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_taggerId_fkey" FOREIGN KEY ("taggerId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postReactionId_fkey" FOREIGN KEY ("postReactionId") REFERENCES "PostReaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_followId_fkey" FOREIGN KEY ("followId") REFERENCES "Follow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentReactionId_fkey" FOREIGN KEY ("commentReactionId") REFERENCES "CommentReaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
