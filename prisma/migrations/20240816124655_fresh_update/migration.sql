/*
  Warnings:

  - You are about to drop the `block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shared_post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tag` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userName]` on the table `post` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "block" DROP CONSTRAINT "block_blocked_id_fkey";

-- DropForeignKey
ALTER TABLE "block" DROP CONSTRAINT "block_blocker_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_commentId_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_postId_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_reported_by_id_fkey";

-- DropForeignKey
ALTER TABLE "shared_post" DROP CONSTRAINT "shared_post_post_id_fkey";

-- DropForeignKey
ALTER TABLE "shared_post" DROP CONSTRAINT "shared_post_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "shared_post" DROP CONSTRAINT "shared_post_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_post_id_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_tagged_id_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_tagger_id_fkey";

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "userName" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "block";

-- DropTable
DROP TABLE "report";

-- DropTable
DROP TABLE "shared_post";

-- DropTable
DROP TABLE "tag";

-- CreateIndex
CREATE UNIQUE INDEX "user_name" ON "post"("userName");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_userName_fkey" FOREIGN KEY ("userName") REFERENCES "app_user"("user_name") ON DELETE CASCADE ON UPDATE CASCADE;
