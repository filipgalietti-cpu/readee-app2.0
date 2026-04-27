import { NextResponse } from "next/server";
import { checkParentReadeePlus } from "@/lib/plan/teacher-gate";
import { translateText, SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/ai/translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CODES = SUPPORTED_LANGUAGES.map((l) => l.code) as LanguageCode[];

export async function POST(req: Request) {
  // Any paid tier (parent Readee+ or teacher) gets translate.
  const gate = await checkParentReadeePlus();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }
  const user = { id: gate.userId };

  let body: { text?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON." }, { status: 400 });
  }

  const text = (body.text ?? "").toString();
  const lang = (body.lang ?? "").toString() as LanguageCode;
  if (!CODES.includes(lang)) {
    return NextResponse.json(
      { ok: false, error: `Unsupported language: ${lang}` },
      { status: 400 },
    );
  }

  const res = await translateText({ text, targetLang: lang, userId: user.id });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, translated: res.translated, cached: res.cached });
}
