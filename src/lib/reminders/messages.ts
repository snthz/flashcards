import type { Messages } from "@/lib/i18n/messages";
import { pickVariant, type ReminderStage } from "./rules";

export interface StreakState {
  days: number;
  activeToday: boolean;
}

export function shouldNotify(stage: ReminderStage, due: number, streak: StreakState) {
  if (due === 0) return false;
  if (stage === 1) return true;
  if (streak.activeToday) return false;
  return stage === 2 || streak.days > 0;
}

export function reminderMessage(t: Messages["reminders"], stage: ReminderStage, due: number, streak: StreakState, minutes: number, seed: string) {
  const atRisk = streak.days > 0 && !streak.activeToday;
  if (stage === 1) {
    return { title: pickVariant(t.firstTitles, seed), body: atRisk ? t.bodyStreak(due, streak.days) : t.body(due) };
  }
  if (stage === 2) {
    return {
      title: pickVariant(atRisk ? t.nudgeStreakTitles(streak.days) : t.nudgeTitles, seed),
      body: pickVariant(t.nudgeBodies(due, minutes), seed),
    };
  }
  return { title: pickVariant(t.lastCallTitles(streak.days), seed), body: pickVariant(t.lastCallBodies(streak.days, due), seed) };
}
