import bcrypt from "bcryptjs";

const ROUNDS = 12;

export function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

let placeholder: Promise<string> | null = null;

export async function verifyMissingUser(password: string) {
  placeholder ??= bcrypt.hash(crypto.randomUUID(), ROUNDS);
  await bcrypt.compare(password, await placeholder);
  return false;
}
