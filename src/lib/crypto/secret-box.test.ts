import { describe, expect, it } from "vitest";
import { open, seal } from "./secret-box";

describe("secret box", () => {
  it("round-trips a value and never stores it in the clear", () => {
    const sealed = seal("sk-ant-api03-secret", "server-secret");
    expect(sealed).not.toContain("secret");
    expect(open(sealed, "server-secret")).toBe("sk-ant-api03-secret");
    expect(seal("same", "server-secret")).not.toBe(seal("same", "server-secret"));
  });

  it("refuses tampered values and other secrets", () => {
    const sealed = seal("value", "server-secret");
    expect(open(sealed, "another-secret")).toBeNull();
    const parts = sealed.split(":");
    parts[3] = Buffer.from("other").toString("base64url");
    expect(open(parts.join(":"), "server-secret")).toBeNull();
    expect(open("garbage", "server-secret")).toBeNull();
  });
});
