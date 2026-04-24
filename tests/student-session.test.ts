import { describe, it, expect, beforeAll } from "vitest";

// student-session.ts reads STUDENT_SESSION_SECRET (or a fallback) at call
// time, so we set it before importing. Tests run on the server runtime.
beforeAll(() => {
  process.env.STUDENT_SESSION_SECRET =
    "test-secret-do-not-use-in-prod-at-least-32-chars-long";
});

async function loadModule() {
  return await import("@/lib/auth/student-session");
}

describe("signStudentSession + verifyStudentSession", () => {
  it("round-trips a valid session", async () => {
    const { signStudentSession, verifyStudentSession } = await loadModule();
    const token = signStudentSession({
      childId: "child-abc",
      classroomId: "classroom-xyz",
    });
    const session = verifyStudentSession(token);
    expect(session).not.toBeNull();
    expect(session?.childId).toBe("child-abc");
    expect(session?.classroomId).toBe("classroom-xyz");
    expect(typeof session?.issuedAt).toBe("number");
  });

  it("rejects a token signed with a different secret", async () => {
    const { signStudentSession, verifyStudentSession } = await loadModule();
    const token = signStudentSession({
      childId: "child-abc",
      classroomId: "classroom-xyz",
    });

    // Re-import with a different secret in a fresh module context. The
    // verify path pulls the secret from process.env at call time, so
    // swapping it here is enough.
    process.env.STUDENT_SESSION_SECRET = "a-completely-different-secret-xyz";
    expect(verifyStudentSession(token)).toBeNull();
    process.env.STUDENT_SESSION_SECRET =
      "test-secret-do-not-use-in-prod-at-least-32-chars-long";
  });

  it("rejects a tampered body (swapped child id)", async () => {
    const { signStudentSession, verifyStudentSession } = await loadModule();
    const token = signStudentSession({
      childId: "child-abc",
      classroomId: "classroom-xyz",
    });
    const [body, sig] = token.split(".");
    const original = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    const tampered = { ...original, childId: "child-IMPOSTER" };
    const tamperedBody = Buffer.from(JSON.stringify(tampered)).toString("base64url");
    const forged = `${tamperedBody}.${sig}`;
    expect(verifyStudentSession(forged)).toBeNull();
  });

  it("rejects a malformed token", async () => {
    const { verifyStudentSession } = await loadModule();
    expect(verifyStudentSession("")).toBeNull();
    expect(verifyStudentSession("nodotseparator")).toBeNull();
    expect(verifyStudentSession("one.two.three")).toBeNull();
    expect(verifyStudentSession(undefined)).toBeNull();
    expect(verifyStudentSession(null)).toBeNull();
  });

  it("rejects a token older than 90 days", async () => {
    const { verifyStudentSession } = await loadModule();
    // Build a token manually with an aged issuedAt to avoid mocking timers.
    const crypto = await import("node:crypto");
    const secret = process.env.STUDENT_SESSION_SECRET!;
    const body = Buffer.from(
      JSON.stringify({
        childId: "child-abc",
        classroomId: "classroom-xyz",
        issuedAt: Date.now() - 91 * 24 * 60 * 60 * 1000, // 91 days ago
      }),
    ).toString("base64url");
    const sig = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("base64url");
    expect(verifyStudentSession(`${body}.${sig}`)).toBeNull();
  });
});
