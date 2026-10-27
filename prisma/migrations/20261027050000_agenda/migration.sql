-- CreateTable
CREATE TABLE "AgendaNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "links" TEXT[],
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "day" TEXT NOT NULL,
    "time" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "remindMinutes" INTEGER,
    "remindAt" TIMESTAMP(3),
    "remindedAt" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgendaNote_userId_day_idx" ON "AgendaNote"("userId", "day");

-- CreateIndex
CREATE INDEX "AgendaTask_userId_day_idx" ON "AgendaTask"("userId", "day");

-- CreateIndex
CREATE INDEX "AgendaTask_remindAt_remindedAt_idx" ON "AgendaTask"("remindAt", "remindedAt");

-- AddForeignKey
ALTER TABLE "AgendaNote" ADD CONSTRAINT "AgendaNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaTask" ADD CONSTRAINT "AgendaTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

