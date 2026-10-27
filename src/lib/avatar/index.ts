export const AVATAR_PRESETS = ["horizon", "orbit", "slope", "crescent", "tide", "dots", "bloom", "peaks", "rings", "arch", "spark", "tiles"] as const;
export type AvatarPreset = (typeof AVATAR_PRESETS)[number];

export type Avatar = { kind: "preset"; preset: AvatarPreset } | { kind: "upload"; file: string };

export const AVATAR_PIXELS = 256;
export const AVATAR_MAX_BYTES = 512 * 1024;
export const AVATAR_SOURCE_MAX_BYTES = 25 * 1024 * 1024;
export const AVATAR_TYPES: Record<string, string> = { "image/webp": ".webp", "image/jpeg": ".jpg", "image/png": ".png" };

const FILE = /^avatar-[a-f0-9]{16}\.(?:webp|jpg|png)$/;

export function isAvatarFile(name: string) {
  return FILE.test(name);
}

export function isPreset(value: string): value is AvatarPreset {
  return (AVATAR_PRESETS as readonly string[]).includes(value);
}

export function parseAvatar(value: string | null | undefined): Avatar | null {
  const separator = value?.indexOf(":") ?? -1;
  if (!value || separator < 0) return null;
  const kind = value.slice(0, separator);
  const rest = value.slice(separator + 1);
  if (kind === "preset" && isPreset(rest)) return { kind: "preset", preset: rest };
  if (kind === "upload" && isAvatarFile(rest)) return { kind: "upload", file: rest };
  return null;
}

export function avatarUrl(file: string) {
  return `/api/avatar/${file}`;
}

export interface CropView {
  zoom: number;
  x: number;
  y: number;
}

export interface CropRect {
  x: number;
  y: number;
  size: number;
}

export function coverScale(width: number, height: number, viewport: number) {
  return viewport / Math.min(width, height);
}

export function clampView(width: number, height: number, viewport: number, view: CropView): CropView {
  const scale = coverScale(width, height, viewport) * view.zoom;
  const limitX = Math.max(0, (width * scale - viewport) / 2);
  const limitY = Math.max(0, (height * scale - viewport) / 2);
  return { zoom: view.zoom, x: Math.min(limitX, Math.max(-limitX, view.x)), y: Math.min(limitY, Math.max(-limitY, view.y)) };
}

export function cropRect(width: number, height: number, viewport: number, view: CropView): CropRect {
  const scale = coverScale(width, height, viewport) * view.zoom;
  const size = Math.min(width, height, viewport / scale);
  const x = width / 2 - view.x / scale - size / 2;
  const y = height / 2 - view.y / scale - size / 2;
  return { x: Math.min(width - size, Math.max(0, x)), y: Math.min(height - size, Math.max(0, y)), size };
}
