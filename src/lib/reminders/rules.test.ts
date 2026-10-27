import { describe, expect, it } from "vitest";
import { dueStage, isPushEndpoint, isReminderHour, localHour, pickVariant, reminderSchedule, studyMinutes } from "./rules";

describe("isPushEndpoint", () => {
  it("accepts the browser push services", () => {
    expect(isPushEndpoint("https://fcm.googleapis.com/fcm/send/abc")).toBe(true);
    expect(isPushEndpoint("https://updates.push.services.mozilla.com/wpush/v2/abc")).toBe(true);
    expect(isPushEndpoint("https://web.push.apple.com/QGv")).toBe(true);
    expect(isPushEndpoint("https://wns2-par02p.notify.windows.com/w/?token=x")).toBe(true);
  });

  it("rejects anything that could reach other hosts", () => {
    expect(isPushEndpoint("http://fcm.googleapis.com/fcm/send/abc")).toBe(false);
    expect(isPushEndpoint("https://localhost:5432/")).toBe(false);
    expect(isPushEndpoint("https://fcm.googleapis.com.evil.test/x")).toBe(false);
    expect(isPushEndpoint("not a url")).toBe(false);
  });
});

describe("reminder hours", () => {
  it("reads the hour in the user's time zone", () => {
    const date = new Date("2026-10-26T01:30:00Z");
    expect(localHour(date, "UTC")).toBe(1);
    expect(localHour(date, "America/Mexico_City")).toBe(19);
    expect(localHour(date, "Asia/Tokyo")).toBe(10);
  });

  it("allows the chosen hour and the next one, wrapping at midnight", () => {
    expect(isReminderHour(19, 19)).toBe(true);
    expect(isReminderHour(20, 19)).toBe(true);
    expect(isReminderHour(21, 19)).toBe(false);
    expect(isReminderHour(0, 23)).toBe(true);
  });
});

describe("reminder schedule", () => {
  it("adds a nudge three hours later and a last call at 21:00", () => {
    expect(reminderSchedule(14, true)).toEqual([
      { stage: 1, hour: 14 },
      { stage: 2, hour: 17 },
      { stage: 3, hour: 21 },
    ]);
  });

  it("drops the nudge when it would collide with the last call and both when it's late", () => {
    expect(reminderSchedule(18, true)).toEqual([
      { stage: 1, hour: 18 },
      { stage: 3, hour: 21 },
    ]);
    expect(reminderSchedule(20, true)).toEqual([{ stage: 1, hour: 20 }]);
  });

  it("sends only the chosen reminder when extra nudges are off", () => {
    expect(reminderSchedule(9, false)).toEqual([{ stage: 1, hour: 9 }]);
  });

  it("finds the stage for the current hour and never nudges in quiet hours", () => {
    expect(dueStage(14, 14, true)).toBe(1);
    expect(dueStage(15, 14, true)).toBe(1);
    expect(dueStage(17, 14, true)).toBe(2);
    expect(dueStage(18, 14, true)).toBe(2);
    expect(dueStage(21, 14, true)).toBe(3);
    expect(dueStage(22, 14, true)).toBeNull();
    expect(dueStage(16, 14, true)).toBeNull();
    expect(dueStage(17, 14, false)).toBeNull();
    expect(dueStage(23, 23, true)).toBe(1);
  });
});

describe("reminder text helpers", () => {
  it("estimates minutes from the user's pace", () => {
    expect(studyMinutes(30, 6000)).toBe(3);
    expect(studyMinutes(30, null)).toBe(4);
    expect(studyMinutes(2, 3000)).toBe(1);
  });

  it("picks the same variant for the same day and stage", () => {
    const variants = ["a", "b", "c"];
    expect(pickVariant(variants, "2026-10-27:2")).toBe(pickVariant(variants, "2026-10-27:2"));
    expect(new Set(["2026-10-25:2", "2026-10-26:2", "2026-10-27:2", "2026-10-28:2"].map((seed) => pickVariant(variants, seed))).size).toBeGreaterThan(1);
  });
});
