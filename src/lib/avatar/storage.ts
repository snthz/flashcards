import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { mediaRoot } from "@/lib/media";
import { isAvatarFile } from "./index";

function avatarPath(userId: string, file: string) {
  if (!isAvatarFile(file) || !/^[a-f0-9-]{36}$/.test(userId)) return null;
  return path.join(mediaRoot(), userId, file);
}

export async function writeAvatar(userId: string, file: string, data: Uint8Array) {
  const absolute = avatarPath(userId, file);
  if (!absolute) throw new Error("invalid avatar path");
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, data);
}

export async function readAvatar(userId: string, file: string) {
  const absolute = avatarPath(userId, file);
  if (!absolute) return null;
  return readFile(absolute).catch(() => null);
}

export async function removeAvatar(userId: string, file: string) {
  const absolute = avatarPath(userId, file);
  if (absolute) await rm(absolute, { force: true });
}
