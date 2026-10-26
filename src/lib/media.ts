import { createHash } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".oga": "audio/ogg",
  ".opus": "audio/ogg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".flac": "audio/flac",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".txt": "text/plain",
};

const configuredRoot = process.env.MEDIA_DIR;

export function mediaRoot() {
  if (configuredRoot && configuredRoot.startsWith("/")) return path.normalize(configuredRoot);
  return path.join(process.cwd(), "data", configuredRoot ? path.basename(configuredRoot) : "media");
}

export function mimeTypeFor(name: string) {
  return MIME_TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream";
}

export function safeMediaName(name: string) {
  const base = path.basename(name).replace(/[\u0000-\u001f<>:"\\|?*]/g, "_").trim();
  return base.length > 0 && base !== "." && base !== ".." ? base.slice(0, 200) : "";
}

export function sha1(data: Uint8Array) {
  return createHash("sha1").update(data).digest("hex");
}

function storedFileName(userId: string, name: string) {
  const hash = createHash("sha1").update(name).digest("hex").slice(0, 16);
  const ext = path.extname(name).toLowerCase().slice(0, 10);
  return path.join(userId, `${hash}${ext}`);
}

export async function writeMediaFile(userId: string, name: string, data: Uint8Array) {
  const relative = storedFileName(userId, name);
  const absolute = path.join(mediaRoot(), relative);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, data);
  return relative;
}

export async function readMediaFile(relative: string) {
  const absolute = path.join(mediaRoot(), relative);
  if (!absolute.startsWith(mediaRoot())) return null;
  try {
    const info = await stat(absolute);
    if (!info.isFile()) return null;
    return readFile(absolute);
  } catch {
    return null;
  }
}

export async function removeMediaFile(relative: string) {
  const absolute = path.join(mediaRoot(), relative);
  if (!absolute.startsWith(mediaRoot())) return;
  await rm(absolute, { force: true });
}

export async function removeUserMedia(userId: string) {
  await rm(path.join(mediaRoot(), userId), { recursive: true, force: true });
}

const MB = 1024 * 1024;

export const UPLOAD_TYPES: Record<string, { ext: string; kind: "image" | "audio"; maxBytes: number }> = {
  "image/jpeg": { ext: ".jpg", kind: "image", maxBytes: 10 * MB },
  "image/png": { ext: ".png", kind: "image", maxBytes: 10 * MB },
  "image/gif": { ext: ".gif", kind: "image", maxBytes: 10 * MB },
  "image/webp": { ext: ".webp", kind: "image", maxBytes: 10 * MB },
  "image/avif": { ext: ".avif", kind: "image", maxBytes: 10 * MB },
  "audio/mpeg": { ext: ".mp3", kind: "audio", maxBytes: 20 * MB },
  "audio/mp4": { ext: ".m4a", kind: "audio", maxBytes: 20 * MB },
  "audio/x-m4a": { ext: ".m4a", kind: "audio", maxBytes: 20 * MB },
  "audio/aac": { ext: ".aac", kind: "audio", maxBytes: 20 * MB },
  "audio/ogg": { ext: ".ogg", kind: "audio", maxBytes: 20 * MB },
  "audio/wav": { ext: ".wav", kind: "audio", maxBytes: 20 * MB },
  "audio/x-wav": { ext: ".wav", kind: "audio", maxBytes: 20 * MB },
  "audio/webm": { ext: ".webm", kind: "audio", maxBytes: 20 * MB },
};

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

export function matchesImageType(type: string, bytes: Uint8Array) {
  switch (type) {
    case "image/jpeg":
      return startsWith(bytes, [0xff, 0xd8, 0xff]);
    case "image/png":
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47]);
    case "image/gif":
      return startsWith(bytes, [0x47, 0x49, 0x46, 0x38]);
    case "image/webp":
      return startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8);
    case "image/avif":
      return startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4);
    default:
      return false;
  }
}
