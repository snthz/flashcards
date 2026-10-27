import { describe, expect, it } from "vitest";
import { addDays, dueInstant, localDay, monthGrid, reminderInstant, shiftMonth, zonedToUtc } from "./time";
import { normalizeLink, youtubeId, youtubeStart } from "./media";

describe("zoned time", () => {
  it("converts local times to UTC across time zones and DST", () => {
    expect(zonedToUtc("2026-10-27", "09:00", "America/Mexico_City").toISOString()).toBe("2026-10-27T15:00:00.000Z");
    expect(zonedToUtc("2026-07-01", "09:00", "America/New_York").toISOString()).toBe("2026-07-01T13:00:00.000Z");
    expect(zonedToUtc("2026-12-01", "09:00", "America/New_York").toISOString()).toBe("2026-12-01T14:00:00.000Z");
    expect(zonedToUtc("2026-03-29", "00:30", "Europe/Madrid").toISOString()).toBe("2026-03-28T23:30:00.000Z");
    expect(zonedToUtc("2026-06-15", "23:45", "Asia/Kolkata").toISOString()).toBe("2026-06-15T18:15:00.000Z");
  });

  it("reads the local day of an instant", () => {
    expect(localDay(new Date("2026-10-28T03:00:00Z"), "America/Mexico_City")).toBe("2026-10-27");
    expect(localDay(new Date("2026-10-28T03:00:00Z"), "UTC")).toBe("2026-10-28");
  });

  it("computes due and reminder instants", () => {
    expect(dueInstant("2026-11-02", null, "UTC").toISOString()).toBe("2026-11-02T09:00:00.000Z");
    expect(reminderInstant("2026-11-02", "18:30", 24 * 60, "UTC")?.toISOString()).toBe("2026-11-01T18:30:00.000Z");
    expect(reminderInstant("2026-11-02", null, null, "UTC")).toBeNull();
  });
});

describe("calendar grid", () => {
  it("lays out six weeks starting on the chosen weekday", () => {
    const monday = monthGrid("2026-10", 1);
    expect(monday).toHaveLength(42);
    expect(monday[0]).toEqual({ day: "2026-09-28", inMonth: false });
    expect(monday[3]).toEqual({ day: "2026-10-01", inMonth: true });
    const sunday = monthGrid("2026-10", 0);
    expect(sunday[0].day).toBe("2026-09-27");
    expect(sunday.filter((cell) => cell.inMonth)).toHaveLength(31);
  });

  it("moves across months and years", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("links", () => {
  it("normalizes links and rejects other schemes", () => {
    expect(normalizeLink("youtube.com/watch?v=dQw4w9WgXcQ")).toBe("https://youtube.com/watch?v=dQw4w9WgXcQ");
    expect(normalizeLink("javascript:alert(1)")).toBeNull();
    expect(normalizeLink("not a link")).toBeNull();
  });

  it("finds YouTube video ids and start times", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://vimeo.com/123")).toBeNull();
    expect(youtubeStart("https://youtu.be/dQw4w9WgXcQ?t=1m30s")).toBe(90);
    expect(youtubeStart("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42")).toBe(42);
  });
});

describe("reminder text", async () => {
  const { dueLabel } = await import("./reminders");
  const { dictionaries } = await import("@/lib/i18n/messages");

  it("says when the task is due", () => {
    const es = dictionaries.es.agenda;
    expect(dueLabel(es, "2026-10-27", "18:30", "2026-10-27", "es")).toBe("Vence hoy a las 18:30.");
    expect(dueLabel(es, "2026-10-28", null, "2026-10-27", "es")).toBe("Vence mañana.");
    expect(dueLabel(dictionaries.en.agenda, "2026-11-02", "09:00", "2026-10-27", "en")).toBe("Due Monday, November 2 at 09:00.");
  });
});
