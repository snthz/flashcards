import { describe, expect, it } from "vitest";
import { decodeMessage, getRepeatedMessages, getString, getVarint } from "./protobuf";

function encodeVarint(value: number) {
  const bytes: number[] = [];
  let v = value;
  while (v > 0x7f) {
    bytes.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  bytes.push(v);
  return bytes;
}

function encodeString(field: number, value: string) {
  const data = new TextEncoder().encode(value);
  return [...encodeVarint((field << 3) | 2), ...encodeVarint(data.length), ...data];
}

function encodeInt(field: number, value: number) {
  return [...encodeVarint(field << 3), ...encodeVarint(value)];
}

describe("decodeMessage", () => {
  it("decodes strings and varints", () => {
    const bytes = new Uint8Array([...encodeInt(1, 300), ...encodeString(3, "hola")]);
    const message = decodeMessage(bytes);
    expect(getVarint(message, 1)).toBe(300);
    expect(getString(message, 3)).toBe("hola");
    expect(getString(message, 9, "x")).toBe("x");
  });

  it("decodes repeated embedded messages", () => {
    const entry = encodeString(1, "file.jpg");
    const outer = new Uint8Array([
      ...encodeVarint((1 << 3) | 2),
      ...encodeVarint(entry.length),
      ...entry,
      ...encodeVarint((1 << 3) | 2),
      ...encodeVarint(entry.length),
      ...entry,
    ]);
    const entries = getRepeatedMessages(decodeMessage(outer), 1);
    expect(entries).toHaveLength(2);
    expect(getString(entries[1], 1)).toBe("file.jpg");
  });
});
