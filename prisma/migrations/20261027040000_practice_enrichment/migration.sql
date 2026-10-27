-- CreateTable
CREATE TABLE "PracticeEnrichment" (
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeEnrichment_pkey" PRIMARY KEY ("noteId")
);

-- CreateIndex
CREATE INDEX "PracticeEnrichment_userId_idx" ON "PracticeEnrichment"("userId");

-- AddForeignKey
ALTER TABLE "PracticeEnrichment" ADD CONSTRAINT "PracticeEnrichment_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

