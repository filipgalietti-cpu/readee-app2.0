import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify a Resend webhook, which is signed with the Svix scheme.
 *
 * Written against node:crypto rather than pulling in the `svix` package,
 * because the stack is deliberately locked (app CLAUDE.md: "Do not add new
 * dependencies without asking"). The scheme is small and stable:
 *
 *   signed payload  `${svix-id}.${svix-timestamp}.${raw body}`
 *   key             base64 decode of the secret after its `whsec_` prefix
 *   signature       base64 HMAC-SHA256, sent as `v1,<sig>` and possibly
 *                   several space-separated entries during a secret rotation
 *
 * ‼️ The raw request body must be used, byte for byte. Parsing the JSON and
 * re-stringifying it changes key order and whitespace, and the signature will
 * never match again.
 */

/** Replay window. Svix's own default. */
const TOLERANCE_SECONDS = 5 * 60;

export function verifySvixSignature(opts: {
  body: string;
  id: string | null;
  timestamp: string | null;
  signature: string | null;
  secret: string;
  now?: number;
}): boolean {
  const { body, id, timestamp, signature, secret } = opts;
  if (!id || !timestamp || !signature || !secret) return false;

  // An old capture must not be replayable, and a clock far in the future is
  // not a message we sent.
  const sent = Number(timestamp);
  if (!Number.isFinite(sent)) return false;
  const now = Math.floor((opts.now ?? Date.now()) / 1000);
  if (Math.abs(now - sent) > TOLERANCE_SECONDS) return false;

  let key: Buffer;
  try {
    key = Buffer.from(secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret, "base64");
  } catch {
    return false;
  }
  if (!key.length) return false;

  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();

  // Several signatures can be present while a secret is being rotated; any
  // valid one is enough.
  for (const part of signature.split(" ")) {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) continue;
    let given: Buffer;
    try {
      given = Buffer.from(value, "base64");
    } catch {
      continue;
    }
    if (given.length === expected.length && timingSafeEqual(given, expected)) return true;
  }
  return false;
}
