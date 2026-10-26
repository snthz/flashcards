import { randomBytes } from "node:crypto";

const GUID_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~";

export function ankiGuid() {
  let value = randomBytes(8).readBigUInt64BE();
  let guid = "";
  const base = BigInt(GUID_ALPHABET.length);
  while (value > 0n) {
    guid = GUID_ALPHABET[Number(value % base)] + guid;
    value /= base;
  }
  return guid || GUID_ALPHABET[0];
}
