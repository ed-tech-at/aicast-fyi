/*
  Warnings:

  - You are about to drop the `ApiKeys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ApiKeys";

-- CreateTable
CREATE TABLE "ApiKey" (
    "apiId" SERIAL NOT NULL,
    "apiType" TEXT,
    "apiKey" VARCHAR(255),
    "apiPlaceholder" VARCHAR(255),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("apiId")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "episodeUrl" VARCHAR(255),
    "email" TEXT NOT NULL,
    "title" TEXT,
    "desc" TEXT,
    "apiKeyLLM" TEXT,
    "apiKeyAudio" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3),

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Element" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "text" TEXT,
    "userQuestion" TEXT,
    "f_episodeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Element_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audio" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "f_elementId" TEXT NOT NULL,
    "voice_id" TEXT NOT NULL,
    "text" TEXT,
    "language_code" TEXT NOT NULL,

    CONSTRAINT "Audio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LLMGeneratedText" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "f_elementId" TEXT NOT NULL,
    "developerPrompt" TEXT,
    "prompt" TEXT,
    "result" TEXT,

    CONSTRAINT "LLMGeneratedText_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Episode_episodeUrl_key" ON "Episode"("episodeUrl");
