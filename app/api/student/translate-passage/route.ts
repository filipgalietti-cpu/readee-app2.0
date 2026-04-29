import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/student-session";
import { createClient } from "@/lib/supabase/server";
import { translateText, SUPPORTED_LANGUAGES } from "@/lib/ai/translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/student/translate-passage
 *
 * body: { text: string, targetLang: string }
 *
 * Reader-side L1 translation. Auth is OR-gated:
 *   - student-session cookie (class-code login), or
 *   - Supabase auth session (parent playing as their kid).
 * If neither is present, 401.
 *
 * Cached server-side via translations_cache so the second tap (or
 * the next student in the same class with the same passage) is
 * instant and free.
 */
export async function POST(req: Request) {
  let userId: string | null = null;

  // Try student session first (most common: kid using the class iPad).
  const studentSession = await getStudentSession();
  if (studentSession) {
    userId = studentSession.childId;
  } else {
    // Parent playing the same quiz from /practice/custom-quiz/[id].
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { text?: string; targetLang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  const targetLang = (body.targetLang ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Missing text." }, { status: 400 });
  }
  const valid = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
  if (!valid) {
    return NextResponse.json(
      { error: "Unsupported language." },
      { status: 400 },
    );
  }

  const res = await translateText({
    text,
    targetLang: valid.code,
    userId,
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: res.error },
      { status: 400 },
    );
  }
  return NextResponse.json({
    ok: true,
    translated: res.translated,
    cached: res.cached,
    nativeName: valid.nativeName,
  });
}
