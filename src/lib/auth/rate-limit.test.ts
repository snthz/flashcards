import { describe, expect, it } from "vitest";
import { retryAfterMs } from "./rate-limit";

const limit = { max: 3, windowMs: 60_000 };
const now = 1_000_000;

describe("retryAfterMs", () => {
  it("allows requests while under the limit", () => {
    expect(retryAfterMs([new Date(now - 1000), new Date(now - 2000)], limit, now)).toBe(0);
  });

  it("waits until the oldest attempt that counts leaves the window", () => {
    const attempts = [new Date(now - 50_000), new Date(now - 20_000), new Date(now - 10_000)];
    expect(retryAfterMs(attempts, limit, now)).toBe(10_000);
  });

  it("ignores attempts outside the window", () => {
    const attempts = [new Date(now - 90_000), new Date(now - 70_000), new Date(now - 10_000)];
    expect(retryAfterMs(attempts, limit, now)).toBe(0);
  });
});
