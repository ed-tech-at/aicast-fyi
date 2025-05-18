/*
  Warnings:

  - The primary key for the `ApiKey` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `apiId` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `apiKey` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `apiPlaceholder` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `apiType` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `f_elementId` on the `Audio` table. All the data in the column will be lost.
  - You are about to drop the column `apiKeyAudio` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `apiKeyLLM` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `desc` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `episodeUrl` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `updatedDate` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `developerPrompt` on the `LLMGeneratedText` table. All the data in the column will be lost.
  - You are about to drop the column `f_elementId` on the `LLMGeneratedText` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `LLMGeneratedText` table. All the data in the column will be lost.
  - You are about to drop the `EpisodeElement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `trackId` to the `Episode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segmentId` to the `LLMGeneratedText` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Episode_episodeUrl_key";

-- AlterTable
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_pkey",
DROP COLUMN "apiId",
DROP COLUMN "apiKey",
DROP COLUMN "apiPlaceholder",
DROP COLUMN "apiType",
ADD COLUMN     "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endpoint" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "key" TEXT,
ADD COLUMN     "mailRegex" TEXT,
ADD COLUMN     "shortcode" TEXT,
ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Audio" DROP COLUMN "f_elementId",
ADD COLUMN     "folder" TEXT,
ADD COLUMN     "nextText" TEXT,
ADD COLUMN     "previousText" TEXT,
ADD COLUMN     "segmentId" TEXT,
ALTER COLUMN "voice_id" DROP NOT NULL,
ALTER COLUMN "language_code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Episode" DROP COLUMN "apiKeyAudio",
DROP COLUMN "apiKeyLLM",
DROP COLUMN "desc",
DROP COLUMN "email",
DROP COLUMN "episodeUrl",
DROP COLUMN "title",
DROP COLUMN "updatedDate",
ADD COLUMN     "answers" TEXT,
ADD COLUMN     "studentName" TEXT,
ADD COLUMN     "trackId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LLMGeneratedText" DROP COLUMN "developerPrompt",
DROP COLUMN "f_elementId",
DROP COLUMN "prompt",
ADD COLUMN     "segmentId" TEXT NOT NULL,
ADD COLUMN     "studentAnswer" TEXT;

-- DropTable
DROP TABLE "EpisodeElement";

-- CreateTable
CREATE TABLE "Voice" (
    "voiceInt" SERIAL NOT NULL,
    "apiKeyId" INTEGER,
    "voice_id" TEXT,
    "displayName" TEXT,
    "language_code" TEXT,

    CONSTRAINT "Voice_pkey" PRIMARY KEY ("voiceInt")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "hashedPw" TEXT,
    "URL" TEXT,
    "title" TEXT,
    "desc" TEXT,
    "apiKeyLLMId" INTEGER,
    "apiKeyAudioId" INTEGER,
    "updatedDate" TIMESTAMP(3),
    "visibility" INTEGER NOT NULL DEFAULT 1,
    "accessCode" TEXT,
    "recycleLLM" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT,
    "studentQuestion" TEXT,
    "systemPrompt" TEXT,
    "defaultAnswer" TEXT,
    "position" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Voice" ADD CONSTRAINT "Voice_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_apiKeyLLMId_fkey" FOREIGN KEY ("apiKeyLLMId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_apiKeyAudioId_fkey" FOREIGN KEY ("apiKeyAudioId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audio" ADD CONSTRAINT "Audio_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LLMGeneratedText" ADD CONSTRAINT "LLMGeneratedText_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
