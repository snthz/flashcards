import { describe, expect, it } from "vitest";
import { reminders as en } from "@/lib/i18n/messages/en/reminders";
import { reminders as es } from "@/lib/i18n/messages/es/reminders";
import { reminderMessage, shouldNotify } from "./messages";

describe("shouldNotify", () => {
  it("always sends the chosen reminder when cards are due", () => {
    expect(shouldNotify(1, 12, { days: 0, activeToday: true })).toBe(true);
    expect(shouldNotify(1, 0, { days: 5, activeToday: false })).toBe(false);
  });

  it("stops nudging once the user has studied today", () => {
    expect(shouldNotify(2, 12, { days: 5, activeToday: true })).toBe(false);
    expect(shouldNotify(3, 12, { days: 5, activeToday: true })).toBe(false);
  });

  it("only sends the last call when there is a streak to lose", () => {
    expect(shouldNotify(2, 12, { days: 0, activeToday: false })).toBe(true);
    expect(shouldNotify(3, 12, { days: 0, activeToday: false })).toBe(false);
    expect(shouldNotify(3, 12, { days: 4, activeToday: false })).toBe(true);
  });
});

describe("reminderMessage", () => {
  const atRisk = { days: 12, activeToday: false };

  it("mentions the streak once it is at risk", () => {
    const first = reminderMessage(es, 1, 30, atRisk, 4, "2026-10-27:1");
    expect(first.body).toBe("Tienes 30 tarjetas pendientes. Mantén tu racha de 12 días.");
    const nudge = reminderMessage(es, 2, 30, atRisk, 4, "2026-10-27:2");
    expect(nudge.title).toMatch(/racha de 12 días/);
    const last = reminderMessage(es, 3, 30, atRisk, 4, "2026-10-27:3");
    expect(`${last.title} ${last.body}`).toMatch(/12 días/);
  });

  it("speaks about time instead of streaks when there is none", () => {
    const nudge = reminderMessage(en, 2, 20, { days: 0, activeToday: false }, 3, "2026-10-27:2");
    expect(en.nudgeTitles).toContain(nudge.title);
    expect(nudge.body).toMatch(/3 min/);
  });

  it("uses the singular for one card and one day", () => {
    expect(reminderMessage(es, 1, 1, { days: 1, activeToday: false }, 1, "x").body).toBe("Tienes 1 tarjeta pendiente. Mantén tu racha de 1 día.");
    expect(reminderMessage(en, 1, 1, { days: 0, activeToday: false }, 1, "x").body).toBe("You have 1 card waiting today.");
  });
});
