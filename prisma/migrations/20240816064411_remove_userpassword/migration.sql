/*
  Warnings:

  - You are about to drop the column `user_password` on the `app_user` table. All the data in the column will be lost.
  - Added the required column `password` to the `app_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "app_user" DROP COLUMN "user_password",
ADD COLUMN     "password" TEXT NOT NULL;
