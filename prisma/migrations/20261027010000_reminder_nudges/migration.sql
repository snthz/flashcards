-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reminderNudges" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reminderStage" INTEGER NOT NULL DEFAULT 0;

