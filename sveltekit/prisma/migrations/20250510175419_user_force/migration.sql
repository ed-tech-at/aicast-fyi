/*
  Warnings:

  - Made the column `userId` on table `ApiKey` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ApiKey" ALTER COLUMN "userId" SET NOT NULL;
