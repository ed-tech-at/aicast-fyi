/*
  Warnings:

  - You are about to drop the `Element` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Element";

-- CreateTable
CREATE TABLE "EpisodeElement" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "text" TEXT,
    "userQuestion" TEXT,
    "f_episodeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "EpisodeElement_pkey" PRIMARY KEY ("id")
);
