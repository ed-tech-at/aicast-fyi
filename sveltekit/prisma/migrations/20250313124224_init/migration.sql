-- CreateTable
CREATE TABLE "ApiKeys" (
    "apiId" SERIAL NOT NULL,
    "apiType" TEXT,
    "apiKey" VARCHAR(255),
    "apiPlaceholder" VARCHAR(255),

    CONSTRAINT "ApiKeys_pkey" PRIMARY KEY ("apiId")
);
