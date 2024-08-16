/*
  Warnings:

  - You are about to drop the column `content_type` on the `reaction` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `reaction` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `reaction` table. All the data in the column will be lost.
  - You are about to drop the column `comment_id` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `content_type` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `post_id` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `reporter_id` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `shared_post` table. All the data in the column will be lost.
  - You are about to drop the column `content_type` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the column `id_deleted` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the `post_action` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `report_reason` to the `report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reported_item_id` to the `report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "post_action" DROP CONSTRAINT "post_action_appUserId_fkey";

-- DropForeignKey
ALTER TABLE "post_action" DROP CONSTRAINT "post_action_post_id_fkey";

-- DropForeignKey
ALTER TABLE "post_action" DROP CONSTRAINT "post_action_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "post_action" DROP CONSTRAINT "post_action_user_id_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_post_id_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_reporter_id_fkey";

-- DropIndex
DROP INDEX "unique_comment_reaction";

-- DropIndex
DROP INDEX "unique_post_reaction";

-- AlterTable
ALTER TABLE "attachment" ALTER COLUMN "post_id" DROP DEFAULT,
ALTER COLUMN "comment_id" DROP DEFAULT;
DROP SEQUENCE "attachment_post_id_seq";
DROP SEQUENCE "attachment_comment_id_seq";

-- AlterTable
ALTER TABLE "comment" ALTER COLUMN "post_id" DROP DEFAULT,
ALTER COLUMN "parent_id" DROP DEFAULT;
DROP SEQUENCE "comment_post_id_seq";
DROP SEQUENCE "comment_parent_id_seq";

-- AlterTable
ALTER TABLE "notification" ALTER COLUMN "post_id" DROP DEFAULT,
ALTER COLUMN "comment_id" DROP DEFAULT,
ALTER COLUMN "reaction_id" DROP DEFAULT,
ALTER COLUMN "tag_id" DROP DEFAULT;
DROP SEQUENCE "notification_post_id_seq";
DROP SEQUENCE "notification_comment_id_seq";
DROP SEQUENCE "notification_reaction_id_seq";
DROP SEQUENCE "notification_tag_id_seq";

-- AlterTable
ALTER TABLE "reaction" DROP COLUMN "content_type",
DROP COLUMN "is_deleted",
DROP COLUMN "updated_at",
ALTER COLUMN "post_id" DROP DEFAULT,
ALTER COLUMN "comment_id" DROP DEFAULT;
DROP SEQUENCE "reaction_post_id_seq";
DROP SEQUENCE "reaction_comment_id_seq";

-- AlterTable
ALTER TABLE "report" DROP COLUMN "comment_id",
DROP COLUMN "content",
DROP COLUMN "content_type",
DROP COLUMN "post_id",
DROP COLUMN "reporter_id",
ADD COLUMN     "commentId" INTEGER,
ADD COLUMN     "postId" INTEGER,
ADD COLUMN     "report_reason" TEXT NOT NULL,
ADD COLUMN     "reported_by_id" UUID,
ADD COLUMN     "reported_item_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "shared_post" DROP COLUMN "is_deleted",
ADD COLUMN     "updated_at" TIMESTAMPTZ(6),
ALTER COLUMN "post_id" DROP DEFAULT;
DROP SEQUENCE "shared_post_post_id_seq";

-- AlterTable
ALTER TABLE "tag" DROP COLUMN "content_type",
DROP COLUMN "id_deleted",
ADD COLUMN     "updated_at" TIMESTAMPTZ(6),
ALTER COLUMN "post_id" DROP DEFAULT,
ALTER COLUMN "comment_id" DROP DEFAULT;
DROP SEQUENCE "tag_post_id_seq";
DROP SEQUENCE "tag_comment_id_seq";

-- DropTable
DROP TABLE "post_action";

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
