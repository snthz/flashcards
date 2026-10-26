import { describe, expect, it } from "vitest";
import { isPushEndpoint, isReminderHour, localHour } from "./rules";

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
