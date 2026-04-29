import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/student-session";
import { translateText, SUPPORTED_LANGUAGES } from "@/lib/ai/translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/student/translate-passage
 *
 * body: { text: string, targetLang: string }
 *
 * Student-facing translation endpoint for the in-reader L1 toggle.
 * Cached server-side via translations_cache so the second tap (or
 * the next student in the same class with the same passage) gets
 * it free.
 */
export async function POST(req: Request) {
  const session = await getStudentSession();
  if (!session) {
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
