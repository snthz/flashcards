import { describe, expect, it } from "vitest";
import { toWav } from "./wav";
import { naturalVoice } from "./voices";

describe("toWav", () => {
  it("writes a 16-bit mono PCM header and clamps samples", () => {
    const wav = toWav(new Float32Array([0, 1, -1, 2]), 24000);
    const view = new DataView(wav.buffer);
    const text = (start: number, length: number) => String.fromCharCode(...wav.slice(start, start + length));
    expect(text(0, 4)).toBe("RIFF");
    expect(text(8, 4)).toBe("WAVE");
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(24000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(8);
    expect(wav.length).toBe(52);
    expect([view.getInt16(44, true), view.getInt16(46, true), view.getInt16(48, true), view.getInt16(50, true)]).toEqual([0, 32767, -32768, 32767]);
  });
});

describe("naturalVoice", () => {
  it("picks a voice for English variants only", () => {
    expect(naturalVoice("en-US")).toBe("af_heart");
    expect(naturalVoice("en_US")).toBe("af_heart");
    expect(naturalVoice("en")).toBe("af_heart");
    expect(naturalVoice("en-GB")).toBe("bf_emma");
    expect(naturalVoice("en-AU")).toBe("af_heart");
    expect(naturalVoice("es-MX")).toBeNull();
    expect(naturalVoice("fr")).toBeNull();
  });
});
