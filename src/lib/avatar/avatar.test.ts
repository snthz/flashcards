import { describe, expect, it } from "vitest";
import { clampView, cropRect, isAvatarFile, parseAvatar } from "./index";

describe("parseAvatar", () => {
  it("reads presets and uploaded files", () => {
    expect(parseAvatar("preset:orbit")).toEqual({ kind: "preset", preset: "orbit" });
    expect(parseAvatar("upload:avatar-0123456789abcdef.webp")).toEqual({ kind: "upload", file: "avatar-0123456789abcdef.webp" });
  });

  it("ignores empty, unknown and unsafe values", () => {
    expect(parseAvatar(null)).toBeNull();
    expect(parseAvatar("")).toBeNull();
    expect(parseAvatar("orbit")).toBeNull();
    expect(parseAvatar("preset:unicorn")).toBeNull();
    expect(parseAvatar("upload:../secret.webp")).toBeNull();
    expect(parseAvatar("upload:avatar-0123456789abcdef.svg")).toBeNull();
  });

  it("only accepts hashed avatar file names", () => {
    expect(isAvatarFile("avatar-0123456789abcdef.jpg")).toBe(true);
    expect(isAvatarFile("avatar-0123456789abcdef.jpg/..")).toBe(false);
    expect(isAvatarFile("image-0123456789abcdef.png")).toBe(false);
  });
});

describe("crop", () => {
  it("covers the frame with the short side at zoom 1", () => {
    expect(cropRect(800, 600, 256, { zoom: 1, x: 0, y: 0 })).toEqual({ x: 100, y: 0, size: 600 });
  });

  it("follows the drag offset and zoom", () => {
    const rect = cropRect(800, 600, 256, { zoom: 2, x: 64, y: -32 });
    expect(rect.size).toBe(300);
    expect(rect.x).toBeCloseTo(175);
    expect(rect.y).toBeCloseTo(187.5);
  });

  it("keeps the image covering the frame", () => {
    const view = clampView(800, 600, 256, { zoom: 1, x: 500, y: 40 });
    expect(view.x).toBeCloseTo(128 / 3);
    expect(view.y).toBe(0);
    const rect = cropRect(800, 600, 256, clampView(800, 600, 256, { zoom: 1, x: -999, y: 0 }));
    expect(rect.x + rect.size).toBeCloseTo(800);
  });
});
