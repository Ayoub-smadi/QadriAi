import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;

export function normalizePhone(value: string) {
  return value.replace(/[\s().-]/g, "").trim();
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const storedKey = Buffer.from(key, "hex");
  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

export function createLocalOpenId() {
  return `local_${randomBytes(18).toString("hex")}`;
}

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "Ayoub";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
export const ADMIN_PHONE = process.env.ADMIN_PHONE ?? null;
