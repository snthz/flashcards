export type ProtoField = { varint?: bigint; bytes?: Uint8Array; fixed32?: number; fixed64?: bigint };

export type ProtoMessage = Map<number, ProtoField[]>;

const decoder = new TextDecoder();

function readVarint(buf: Uint8Array, pos: number): [bigint, number] {
  let result = 0n;
  let shift = 0n;
  while (pos < buf.length) {
    const byte = buf[pos++];
    result |= BigInt(byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return [result, pos];
    shift += 7n;
    if (shift > 70n) break;
  }
  throw new Error("Malformed varint");
}

export function decodeMessage(buf: Uint8Array): ProtoMessage {
  const fields: ProtoMessage = new Map();
  let pos = 0;
  while (pos < buf.length) {
    const [tag, next] = readVarint(buf, pos);
    pos = next;
    const fieldNumber = Number(tag >> 3n);
    const wireType = Number(tag & 7n);
    let field: ProtoField;
    if (wireType === 0) {
      const [value, after] = readVarint(buf, pos);
      pos = after;
      field = { varint: value };
    } else if (wireType === 1) {
      const view = new DataView(buf.buffer, buf.byteOffset + pos, 8);
      field = { fixed64: view.getBigUint64(0, true) };
      pos += 8;
    } else if (wireType === 2) {
      const [length, after] = readVarint(buf, pos);
      pos = after;
      const len = Number(length);
      field = { bytes: buf.subarray(pos, pos + len) };
      pos += len;
    } else if (wireType === 5) {
      const view = new DataView(buf.buffer, buf.byteOffset + pos, 4);
      field = { fixed32: view.getUint32(0, true) };
      pos += 4;
    } else {
      throw new Error(`Unsupported wire type ${wireType}`);
    }
    const list = fields.get(fieldNumber);
    if (list) list.push(field);
    else fields.set(fieldNumber, [field]);
  }
  return fields;
}

export function getString(message: ProtoMessage, field: number, fallback = "") {
  const entry = message.get(field)?.[0];
  return entry?.bytes ? decoder.decode(entry.bytes) : fallback;
}

export function getVarint(message: ProtoMessage, field: number, fallback = 0) {
  const entry = message.get(field)?.[0];
  return entry?.varint != null ? Number(entry.varint) : fallback;
}

export function getBytes(message: ProtoMessage, field: number) {
  return message.get(field)?.[0]?.bytes ?? null;
}

export function getRepeatedMessages(message: ProtoMessage, field: number) {
  return (message.get(field) ?? []).filter((f) => f.bytes).map((f) => decodeMessage(f.bytes!));
}

export function getMessage(message: ProtoMessage, field: number) {
  const bytes = getBytes(message, field);
  return bytes ? decodeMessage(bytes) : null;
}
