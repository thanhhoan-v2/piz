/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."attachment_format" AS ENUM ('AUDIO', 'IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "public"."attachment_type" AS ENUM ('POST', 'COMMENT');

-- CreateEnum
CREATE TYPE "public"."content_type" AS ENUM ('POST', 'COMMENT');

-- CreateEnum
CREATE TYPE "public"."follow_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."notification_type" AS ENUM ('FOLLOW', 'FOLLOW_SUGGEST', 'TAG', 'COMMENT', 'REACT');

-- CreateEnum
CREATE TYPE "public"."post_action_type" AS ENUM ('SAVE', 'IGNORE');

-- CreateEnum
CREATE TYPE "public"."post_visibility" AS ENUM ('PUBLIC', 'FRIENDS_ONLY', 'JUST_ME');

-- CreateEnum
CREATE TYPE "public"."privacy_mode" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."reaction_type" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "public"."report_type" AS ENUM ('SPAM', 'HARASSMENT', 'INAPPROPRIATE');

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."app_user" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT,
    "is_active" BOOLEAN DEFAULT false,
    "privacy_mode" "public"."privacy_mode" DEFAULT 'PUBLIC',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "is_deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attachment" (
    "id" SERIAL NOT NULL,
    "post_id" SERIAL NOT NULL,
    "comment_id" SERIAL NOT NULL,
    "storage_url" TEXT NOT NULL,
    "sound_duration" TEXT,
    "attachment_type" "public"."attachment_type",
    "format" "public"."attachment_format",
    "is_deleted" BOOLEAN DEFAULT false,
    "content_type" "public"."content_type",
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."block" (
    "id" SERIAL NOT NULL,
    "blocker_id" UUID,
    "blocked_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comment" (
    "id" SERIAL NOT NULL,
    "user_id" UUID,
    "post_id" SERIAL NOT NULL,
    "parent_id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "degree" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "is_deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."follow" (
    "id" SERIAL NOT NULL,
    "follower_id" UUID,
    "followee_id" UUID,
    "request_status" "public"."follow_status" DEFAULT 'PENDING',
    "followed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMPTZ(6),

    CONSTRAINT "follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
    "id" SERIAL NOT NULL,
    "sender_id" UUID,
    "receiver_id" UUID,
    "post_id" SERIAL NOT NULL,
    "comment_id" SERIAL NOT NULL,
    "reaction_id" SERIAL NOT NULL,
    "tag_id" SERIAL NOT NULL,
    "notification_type" "public"."notification_type",
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN DEFAULT false,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post" (
    "id" SERIAL NOT NULL,
    "user_id" UUID,
    "content" TEXT NOT NULL,
    "no_shares" INTEGER DEFAULT 0,
    "visibility" "public"."post_visibility" DEFAULT 'PUBLIC',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "is_deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_action" (
    "id" SERIAL NOT NULL,
    "user_id" UUID,
    "receiver_id" UUID,
    "post_id" SERIAL NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "action" "public"."post_action_type",
    "appUserId" UUID,

    CONSTRAINT "post_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reaction" (
    "id" SERIAL NOT NULL,
    "user_id" UUID,
    "post_id" SERIAL NOT NULL,
    "comment_id" SERIAL NOT NULL,
    "reaction_type" "public"."reaction_type",
    "is_deleted" BOOLEAN DEFAULT false,
    "content_type" "public"."content_type",
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report" (
    "id" SERIAL NOT NULL,
    "reporter_id" UUID,
    "post_id" SERIAL NOT NULL,
    "comment_id" SERIAL NOT NULL,
    "report_type" "public"."report_type",
    "content" TEXT,
    "content_type" "public"."content_type",
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shared_post" (
    "id" SERIAL NOT NULL,
    "sender_id" UUID,
    "receiver_id" UUID,
    "post_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "shared_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tag" (
    "id" SERIAL NOT NULL,
    "tagger_id" UUID,
    "tagged_id" UUID,
    "post_id" SERIAL NOT NULL,
    "comment_id" SERIAL NOT NULL,
    "content_type" "public"."content_type",
    "id_deleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "public"."app_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_full_name_key" ON "public"."app_user"("full_name");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_user_name_key" ON "public"."app_user"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "follow_follower_id_followee_id_key" ON "public"."follow"("follower_id", "followee_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_comment_reaction" ON "public"."reaction"("user_id", "comment_id", "content_type");

-- CreateIndex
CREATE UNIQUE INDEX "unique_post_reaction" ON "public"."reaction"("user_id", "post_id", "content_type");

-- AddForeignKey
ALTER TABLE "public"."attachment" ADD CONSTRAINT "attachment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."attachment" ADD CONSTRAINT "attachment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."block" ADD CONSTRAINT "block_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."block" ADD CONSTRAINT "block_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."follow" ADD CONSTRAINT "follow_followee_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."follow" ADD CONSTRAINT "follow_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_reaction_id_fkey" FOREIGN KEY ("reaction_id") REFERENCES "public"."reaction"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."post_action" ADD CONSTRAINT "post_action_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."post_action" ADD CONSTRAINT "post_action_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."post_action" ADD CONSTRAINT "post_action_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."post_action" ADD CONSTRAINT "post_action_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "public"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reaction" ADD CONSTRAINT "reaction_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reaction" ADD CONSTRAINT "reaction_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reaction" ADD CONSTRAINT "reaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."report" ADD CONSTRAINT "report_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."report" ADD CONSTRAINT "report_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."report" ADD CONSTRAINT "report_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."shared_post" ADD CONSTRAINT "shared_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."shared_post" ADD CONSTRAINT "shared_post_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."shared_post" ADD CONSTRAINT "shared_post_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tag" ADD CONSTRAINT "tag_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tag" ADD CONSTRAINT "tag_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tag" ADD CONSTRAINT "tag_tagged_id_fkey" FOREIGN KEY ("tagged_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tag" ADD CONSTRAINT "tag_tagger_id_fkey" FOREIGN KEY ("tagger_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
