/*
  Warnings:

  - You are about to drop the column `segmentId` on the `Audio` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Audio" DROP CONSTRAINT "Audio_segmentId_fkey";

-- AlterTable
ALTER TABLE "Audio" DROP COLUMN "segmentId",
ADD COLUMN     "segmentCreatedId" TEXT;

-- AlterTable
ALTER TABLE "Segment" ADD COLUMN     "audioId" TEXT;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "Audio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
