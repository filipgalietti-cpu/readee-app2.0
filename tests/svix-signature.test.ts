import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifySvixSignature } from "@/lib/email/svix-signature";

/**
 * This is the only thing standing between a stranger and a command that spends
 * AI credits and replaces a live day's content, so it is tested as security
 * code rather than as a helper.
 */

const SECRET = `whsec_${Buffer.from("a-test-signing-key-of-some-length").toString("base64")}`;
const NOW = 1_758_200_000_000; // fixed clock, seconds below

function sign(body: string, id: string, ts: string, secret = SECRET): string {
  const key = Buffer.from(secret.slice("whsec_".length), "base64");
  return `v1,${createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64")}`;
}

const body = JSON.stringify({ type: "email.received", data: { email_id: "abc" } });
const id = "msg_2abc";
const ts = String(Math.floor(NOW / 1000));

describe("verifySvixSignature", () => {
  it("accepts a correctly signed request", () => {
    expect(
      verifySvixSignature({ body, id, timestamp: ts, signature: sign(body, id, ts), secret: SECRET, now: NOW }),
    ).toBe(true);
  });

  it("rejects a body that changed by one character", () => {
    const tampered = body.replace("abc", "abd");
    expect(
      verifySvixSignature({ body: tampered, id, timestamp: ts, signature: sign(body, id, ts), secret: SECRET, now: NOW }),
    ).toBe(false);
  });

  it("rejects a signature made with a different secret", () => {
    const other = `whsec_${Buffer.from("a-different-key-entirely-here").toString("base64")}`;
    expect(
      verifySvixSignature({ body, id, timestamp: ts, signature: sign(body, id, ts, other), secret: SECRET, now: NOW }),
    ).toBe(false);
  });

  it("rejects a replay from outside the tolerance window", () => {
    const old = String(Math.floor(NOW / 1000) - 6 * 60);
    expect(
      verifySvixSignature({ body, id, timestamp: old, signature: sign(body, id, old), secret: SECRET, now: NOW }),
    ).toBe(false);
  });

  it("accepts one inside the window", () => {
    const recent = String(Math.floor(NOW / 1000) - 60);
    expect(
      verifySvixSignature({ body, id, timestamp: recent, signature: sign(body, id, recent), secret: SECRET, now: NOW }),
    ).toBe(true);
  });

  it("accepts any one of several signatures during a secret rotation", () => {
    const other = `whsec_${Buffer.from("rotating-secret-value-here").toString("base64")}`;
    const both = `${sign(body, id, ts, other)} ${sign(body, id, ts)}`;
    expect(verifySvixSignature({ body, id, timestamp: ts, signature: both, secret: SECRET, now: NOW })).toBe(true);
  });

  it("rejects missing headers rather than throwing", () => {
    for (const missing of [{ id: null }, { timestamp: null }, { signature: null }]) {
      expect(
        verifySvixSignature({ body, id, timestamp: ts, signature: sign(body, id, ts), secret: SECRET, now: NOW, ...missing }),
      ).toBe(false);
    }
  });

  it("rejects an unsigned request and an empty secret", () => {
    expect(verifySvixSignature({ body, id, timestamp: ts, signature: "v1,", secret: SECRET, now: NOW })).toBe(false);
    expect(verifySvixSignature({ body, id, timestamp: ts, signature: sign(body, id, ts), secret: "", now: NOW })).toBe(false);
  });

  it("ignores signature versions it does not understand", () => {
    const future = `v2,${Buffer.from("whatever").toString("base64")}`;
    expect(verifySvixSignature({ body, id, timestamp: ts, signature: future, secret: SECRET, now: NOW })).toBe(false);
  });

  it("rejects a non-numeric timestamp", () => {
    expect(
      verifySvixSignature({ body, id, timestamp: "not-a-time", signature: sign(body, id, ts), secret: SECRET, now: NOW }),
    ).toBe(false);
  });
});
