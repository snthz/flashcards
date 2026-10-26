const MAX_DIMENSION = 1600;
const SHRINK_ABOVE_BYTES = 1.5 * 1024 * 1024;
const RESIZABLE = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMG_RE = /<img\b[^>]*?\ssrc=(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi;
const SOUND_RE = /\[sound:([^\]]+)\]/g;

export type UploadError = "too_large" | "unsupported" | "failed";

export interface FieldMedia {
  kind: "image" | "audio";
  name: string;
  tag: string;
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function shrinkImage(file: File) {
  if (!RESIZABLE.has(file.type) || typeof createImageBitmap !== "function") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const largest = Math.max(bitmap.width, bitmap.height);
  if (largest <= MAX_DIMENSION && file.size <= SHRINK_ABOVE_BYTES) {
    bitmap.close();
    return file;
  }
  const scale = Math.min(1, MAX_DIMENSION / largest);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const webp = await canvasBlob(canvas, "image/webp", 0.85);
  const blob = webp?.type === "image/webp" ? webp : await canvasBlob(canvas, "image/jpeg", 0.85);
  if (!blob || blob.size >= file.size) return file;
  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "image"}.${extension}`, { type: blob.type });
}

export async function uploadMedia(file: File): Promise<{ name: string; kind: "image" | "audio" } | { error: UploadError }> {
  const prepared = file.type.startsWith("image/") ? await shrinkImage(file) : file;
  const form = new FormData();
  form.append("file", prepared, prepared.name);
  try {
    const response = await fetch("/api/media", { method: "POST", body: form, credentials: "same-origin" });
    if (response.status === 413) return { error: "too_large" };
    if (response.status === 415) return { error: "unsupported" };
    if (!response.ok) return { error: "failed" };
    return (await response.json()) as { name: string; kind: "image" | "audio" };
  } catch {
    return { error: "failed" };
  }
}

export function mediaSnippet(kind: "image" | "audio", name: string) {
  return kind === "image" ? `<img src="${name.replace(/"/g, "&quot;")}">` : `[sound:${name}]`;
}

export function fieldMedia(value: string): FieldMedia[] {
  const items: FieldMedia[] = [];
  for (const match of value.matchAll(IMG_RE)) {
    const name = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (name) items.push({ kind: "image", name, tag: match[0] });
  }
  for (const match of value.matchAll(SOUND_RE)) items.push({ kind: "audio", name: match[1], tag: match[0] });
  return items;
}

export function mediaUrl(name: string) {
  if (/^(?:https?:|data:|blob:|\/)/i.test(name)) return name;
  let decoded = name;
  try {
    decoded = decodeURIComponent(name);
  } catch {
    decoded = name;
  }
  return `/api/media/${encodeURIComponent(decoded)}`;
}
