/**
 * Per-device play-mode lock.
 *
 * When a parent launches their kid into play mode (via /play/[childId]),
 * we set a signed cookie on THIS device. The proxy middleware reads it
 * on every request and blocks navigation to adult routes (/classroom,
 * /admin, /dashboard, /account, /upgrade, /dashboard/ask-readee), so
 * the kid can read/practice/play but cannot accidentally drive into
 * teacher or admin surfaces.
 *
 * Multi-device: cookie is per-device, so the SAME Supabase account can
 * be in play-mode on the iPad AND in teacher-mode on the laptop at the
 * same time — no need for two logins.
 *
 * Exit requires either the parent PIN (if set) or the account password.
 *
 * The cookie carries: the child id (so the proxy knows where to redirect
 * if a kid finds an adult URL) + the parent profile id (so server code
 * can verify the right adult is locking the device).
 */

import crypto from "node:crypto";

const COOKIE_NAME = "readee_play_lock";
const TTL_DAYS = 30;

function secret(): string {
  const s = process.env.PLAY_MODE_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "readee-dev-secret";
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export type PlayModePayload = {
  parentId: string;
  childId: string;
  /** Issued-at, ms epoch. */
  iat: number;
};

/** Build a signed cookie value from a payload. */
export function encodePlayCookie(payload: PlayModePayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Verify and decode the cookie value, or null if tampered/invalid. */
export function decodePlayCookie(value: string | undefined | null): PlayModePayload | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (sign(body) !== sig) return null;
  try {
    const json = Buffer.from(body, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as PlayModePayload;
    if (!parsed.parentId || !parsed.childId || !parsed.iat) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const PLAY_COOKIE_NAME = COOKIE_NAME;
export const PLAY_COOKIE_MAX_AGE_SECONDS = TTL_DAYS * 24 * 60 * 60;

/* ── PIN hashing ────────────────────────────────────────────────── */

export function hashPin(pin: string, salt: string): string {
  return crypto.createHash("sha256").update(`${salt}:${pin}`).digest("hex");
}

export function newSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function verifyPin(pin: string, hash: string, salt: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(hashPin(pin, salt), "hex"),
    Buffer.from(hash, "hex"),
  );
}
