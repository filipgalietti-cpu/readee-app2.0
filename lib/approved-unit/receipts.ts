import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
function signature(text: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw Error("Signing unavailable");
  return createHmac("sha256", key)
    .update("readee-unit-response-v1\0" + text)
    .digest("base64url");
}
export function responseReceipt(child: string, lesson: string, rubric: string, correct: boolean) {
  const body = Buffer.from(JSON.stringify({ child, lesson, rubric, correct })).toString(
    "base64url",
  );
  return body + "." + signature(body);
}
export function receiptVerdict(
  receipt: unknown,
  child: string,
  lesson: string,
  rubric: string,
): boolean | null {
  if (typeof receipt !== "string" || receipt.length > 2000) return null;
  const [body, sig, ...extra] = receipt.split(".");
  if (!body || !sig || extra.length) return null;
  const expected = signature(body),
    a = Buffer.from(sig),
    b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const r = JSON.parse(Buffer.from(body, "base64url").toString());
    return r.child === child &&
      r.lesson === lesson &&
      r.rubric === rubric &&
      typeof r.correct === "boolean"
      ? r.correct
      : null;
  } catch {
    return null;
  }
}
