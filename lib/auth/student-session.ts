import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Cookie-based session for classroom-owned students.
 *
 * Students don't have Supabase auth accounts — no email, no password,
 * no PII. "Signing in" from the class-code page sets a signed cookie
 * containing {childId, classroomId, issuedAt}. Server actions that
 * serve student traffic verify the signature, extract the childId, and
 * use the service-role Supabase client to do scoped reads/writes.
 *
 * Rotation: teacher rotates the classroom join code → invalidates the
 * classroom lookup path. We intentionally don't bake classroom code
 * into the signature so re-signing isn't required; the classroom-id
 * reference is enough because the code only gates initial sign-in.
 */

export type StudentSession = {
  childId: string;
  classroomId: string;
  issuedAt: number;
};

const COOKIE_NAME = "readee_student";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

function secret(): string {
  const s =
    process.env.STUDENT_SESSION_SECRET ??
    process.env.SUPABASE_JWT_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) {
    throw new Error(
      "STUDENT_SESSION_SECRET (or SUPABASE_JWT_SECRET) must be set to mint student sessions.",
    );
  }
  return s;
}

function signPayload(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function signStudentSession(
  input: Omit<StudentSession, "issuedAt">,
): string {
  const session: StudentSession = { ...input, issuedAt: Date.now() };
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = signPayload(body);
  return `${body}.${sig}`;
}

export function verifyStudentSession(token: string | undefined | null): StudentSession | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return null;

  let expected: string;
  try {
    expected = signPayload(body);
  } catch {
    return null;
  }
  try {
    const a = Buffer.from(sig, "base64url");
    const b = Buffer.from(expected, "base64url");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as StudentSession;
    if (
      typeof parsed.childId !== "string" ||
      typeof parsed.classroomId !== "string" ||
      typeof parsed.issuedAt !== "number"
    ) {
      return null;
    }
    const age = Date.now() - parsed.issuedAt;
    if (age < 0 || age > MAX_AGE_SECONDS * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Server helper — reads + verifies the student cookie. */
export async function getStudentSession(): Promise<StudentSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifyStudentSession(token);
}

/** Server helper — set the cookie. */
export async function setStudentCookie(session: Omit<StudentSession, "issuedAt">): Promise<void> {
  const token = signStudentSession(session);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearStudentCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const STUDENT_COOKIE_NAME = COOKIE_NAME;
