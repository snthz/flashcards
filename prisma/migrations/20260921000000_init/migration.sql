-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "flashcards";

-- CreateEnum
CREATE TYPE "Algorithm" AS ENUM ('SM2', 'FSRS');

-- CreateEnum
CREATE TYPE "LeechAction" AS ENUM ('SUSPEND', 'TAG');

-- CreateEnum
CREATE TYPE "NewCardOrder" AS ENUM ('SEQUENTIAL', 'RANDOM');

-- CreateEnum
CREATE TYPE "NoteTypeKind" AS ENUM ('STANDARD', 'CLOZE');

-- CreateEnum
CREATE TYPE "CardState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "dayStartHour" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "algorithm" "Algorithm" NOT NULL DEFAULT 'SM2',
    "newPerDay" INTEGER NOT NULL DEFAULT 20,
    "reviewsPerDay" INTEGER NOT NULL DEFAULT 200,
    "learningSteps" DOUBLE PRECISION[] DEFAULT ARRAY[1, 10]::DOUBLE PRECISION[],
    "relearningSteps" DOUBLE PRECISION[] DEFAULT ARRAY[10]::DOUBLE PRECISION[],
    "graduatingInterval" INTEGER NOT NULL DEFAULT 1,
    "easyInterval" INTEGER NOT NULL DEFAULT 4,
    "startingEase" INTEGER NOT NULL DEFAULT 2500,
    "easyBonus" DOUBLE PRECISION NOT NULL DEFAULT 1.3,
    "hardMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.2,
    "intervalModifier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "lapseMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "minLapseInterval" INTEGER NOT NULL DEFAULT 1,
    "maxInterval" INTEGER NOT NULL DEFAULT 36500,
    "leechThreshold" INTEGER NOT NULL DEFAULT 8,
    "leechAction" "LeechAction" NOT NULL DEFAULT 'TAG',
    "newCardOrder" "NewCardOrder" NOT NULL DEFAULT 'SEQUENTIAL',
    "desiredRetention" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "fsrsWeights" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeckConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "parentId" TEXT,
    "configId" TEXT NOT NULL,
    "ankiId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteType" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "NoteTypeKind" NOT NULL DEFAULT 'STANDARD',
    "css" TEXT NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL,
    "templates" JSONB NOT NULL,
    "sortFieldIdx" INTEGER NOT NULL DEFAULT 0,
    "latexPre" TEXT NOT NULL DEFAULT '',
    "latexPost" TEXT NOT NULL DEFAULT '',
    "ankiId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noteTypeId" TEXT NOT NULL,
    "fields" TEXT[],
    "tags" TEXT[],
    "sortField" TEXT NOT NULL DEFAULT '',
    "ankiGuid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "ord" INTEGER NOT NULL DEFAULT 0,
    "state" "CardState" NOT NULL DEFAULT 'NEW',
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newPosition" INTEGER NOT NULL DEFAULT 0,
    "interval" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ease" INTEGER NOT NULL DEFAULT 2500,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "step" INTEGER NOT NULL DEFAULT 0,
    "stability" DOUBLE PRECISION,
    "difficulty" DOUBLE PRECISION,
    "lastReview" TIMESTAMP(3),
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "buriedUntil" TIMESTAMP(3),
    "flag" INTEGER NOT NULL DEFAULT 0,
    "ankiId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "prevState" "CardState" NOT NULL,
    "newState" "CardState" NOT NULL,
    "prevInterval" DOUBLE PRECISION NOT NULL,
    "newInterval" DOUBLE PRECISION NOT NULL,
    "elapsedDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "snapshot" JSONB NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "sha1" TEXT,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "DeckConfig_userId_idx" ON "DeckConfig"("userId");

-- CreateIndex
CREATE INDEX "Deck_userId_parentId_idx" ON "Deck"("userId", "parentId");

-- CreateIndex
CREATE INDEX "Deck_userId_ankiId_idx" ON "Deck"("userId", "ankiId");

-- CreateIndex
CREATE INDEX "NoteType_userId_idx" ON "NoteType"("userId");

-- CreateIndex
CREATE INDEX "Note_userId_noteTypeId_idx" ON "Note"("userId", "noteTypeId");

-- CreateIndex
CREATE INDEX "Note_userId_ankiGuid_idx" ON "Note"("userId", "ankiGuid");

-- CreateIndex
CREATE INDEX "Card_userId_deckId_state_due_idx" ON "Card"("userId", "deckId", "state", "due");

-- CreateIndex
CREATE INDEX "Card_userId_deckId_newPosition_idx" ON "Card"("userId", "deckId", "newPosition");

-- CreateIndex
CREATE INDEX "Card_noteId_idx" ON "Card"("noteId");

-- CreateIndex
CREATE INDEX "ReviewLog_userId_reviewedAt_idx" ON "ReviewLog"("userId", "reviewedAt");

-- CreateIndex
CREATE INDEX "ReviewLog_cardId_reviewedAt_idx" ON "ReviewLog"("cardId", "reviewedAt");

-- CreateIndex
CREATE INDEX "ReviewLog_deckId_reviewedAt_idx" ON "ReviewLog"("deckId", "reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Media_userId_name_key" ON "Media"("userId", "name");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckConfig" ADD CONSTRAINT "DeckConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_configId_fkey" FOREIGN KEY ("configId") REFERENCES "DeckConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteType" ADD CONSTRAINT "NoteType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_noteTypeId_fkey" FOREIGN KEY ("noteTypeId") REFERENCES "NoteType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

