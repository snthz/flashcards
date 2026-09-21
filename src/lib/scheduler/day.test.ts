import { describe, expect, it } from "vitest";
import { dayKey, dayStart, nextDayStart } from "./day";

describe("dayStart", () => {
  it("returns today's boundary after the rollover hour", () => {
    const now = new Date("2026-03-10T15:00:00Z");
    expect(dayStart(now, "UTC", 4).toISOString()).toBe("2026-03-10T04:00:00.000Z");
  });

  it("returns yesterday's boundary before the rollover hour", () => {
    const now = new Date("2026-03-10T02:00:00Z");
    expect(dayStart(now, "UTC", 4).toISOString()).toBe("2026-03-09T04:00:00.000Z");
  });

  it("respects the user's timezone", () => {
    const now = new Date("2026-03-10T08:30:00Z");
    expect(dayStart(now, "America/Mexico_City", 4).toISOString()).toBe("2026-03-09T10:00:00.000Z");
    expect(dayStart(now, "America/Mexico_City", 4).getTime()).toBeLessThanOrEqual(now.getTime());
  });

  it("computes the next boundary one day later", () => {
    const now = new Date("2026-03-10T15:00:00Z");
    expect(nextDayStart(now, "UTC", 4).toISOString()).toBe("2026-03-11T04:00:00.000Z");
  });

  it("keys days by local date", () => {
    expect(dayKey(new Date("2026-03-10T02:00:00Z"), "UTC", 4)).toBe("2026-03-09");
    expect(dayKey(new Date("2026-03-10T12:00:00Z"), "UTC", 4)).toBe("2026-03-10");
  });
});
