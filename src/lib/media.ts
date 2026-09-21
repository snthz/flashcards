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

export function mediaRoot() {
  return path.resolve(process.env.MEDIA_DIR ?? "./data/media");
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
