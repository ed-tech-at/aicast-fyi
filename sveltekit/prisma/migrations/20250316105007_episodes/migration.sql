-- CreateTable
CREATE TABLE "Episodes" (
    "id" TEXT NOT NULL,
    "episodeUrl" VARCHAR(255),
    "email" TEXT NOT NULL,
    "title" TEXT,
    "desc" TEXT,
    "apiKeyLLM" TEXT,
    "apiKeyAudio" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3),

    CONSTRAINT "Episodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Episodes_episodeUrl_key" ON "Episodes"("episodeUrl");
