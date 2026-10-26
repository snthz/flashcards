import { describe, expect, it } from "vitest";
import { fieldMedia, mediaSnippet, mediaUrl } from "./media-client";
import { matchesImageType } from "@/lib/media";

describe("field media", () => {
  it("finds images and sounds with the exact tag to remove", () => {
    const value = `Dog <img src="dog 1.jpg" width=200> and <img src='cat.png'> [sound:bark.mp3]`;
    expect(fieldMedia(value)).toEqual([
      { kind: "image", name: "dog 1.jpg", tag: '<img src="dog 1.jpg" width=200>' },
      { kind: "image", name: "cat.png", tag: "<img src='cat.png'>" },
      { kind: "audio", name: "bark.mp3", tag: "[sound:bark.mp3]" },
    ]);
  });

  it("builds the snippets Anki uses", () => {
    expect(mediaSnippet("image", "image-abc.webp")).toBe('<img src="image-abc.webp">');
    expect(mediaSnippet("audio", "audio-abc.mp3")).toBe("[sound:audio-abc.mp3]");
  });

  it("points local names at the media route and leaves urls alone", () => {
    expect(mediaUrl("dog 1.jpg")).toBe("/api/media/dog%201.jpg");
    expect(mediaUrl("dog%201.jpg")).toBe("/api/media/dog%201.jpg");
    expect(mediaUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
  });
});

describe("matchesImageType", () => {
  it("checks the file signature against the declared type", () => {
    expect(matchesImageType("image/png", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]))).toBe(true);
    expect(matchesImageType("image/jpeg", new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(true);
    expect(matchesImageType("image/webp", new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))).toBe(true);
    expect(matchesImageType("image/png", new TextEncoder().encode("<html><script>"))).toBe(false);
    expect(matchesImageType("image/svg+xml", new TextEncoder().encode("<svg"))).toBe(false);
  });
});
