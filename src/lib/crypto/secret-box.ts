import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

const VERSION = "v1";
const INFO = "flashcards:user-secrets";

function key(secret: string) {
  if (!secret) throw new Error("SESSION_SECRET is required to store API keys");
  return Buffer.from(hkdfSync("sha256", secret, Buffer.alloc(0), INFO, 32));
}

export function seal(plain: string, secret = process.env.SESSION_SECRET ?? "") {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [VERSION, iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(":");
}

export function open(sealed: string, secret = process.env.SESSION_SECRET ?? "") {
  const [version, iv, tag, data] = sealed.split(":");
  if (version !== VERSION || !iv || !tag || !data) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key(secret), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
