import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { draftIepProgressNote } from "@/lib/ai/build-iep-note";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return NextResponse.json({ ok: false, error: "Educators only." }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON." }, { status: 400 });
  }

  const childId = String(body.childId ?? "");
  const annualGoal = String(body.annualGoal ?? "").slice(0, 1500);
  const reportingPeriod = String(body.reportingPeriod ?? "Quarter").slice(0, 80);
  if (!childId) {
    return NextResponse.json({ ok: false, error: "childId required." }, { status: 400 });
  }
  if (!annualGoal.trim()) {
    return NextResponse.json({ ok: false, error: "Annual goal required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: child } = await supabase
    .from("children")
    .select("id, name, reading_level")
    .eq("id", childId)
    .maybeSingle();
  if (!child) {
    return NextResponse.json({ ok: false, error: "Student not found." }, { status: 404 });
  }
  const { data: practice } = await supabase
    .from("practice_results")
    .select("standard_id, questions_correct, questions_attempted, updated_at")
    .eq("child_id", childId)
    .order("updated_at", { ascending: false })
    .limit(20);
  const { data: lessons } = await supabase
    .from("lessons_progress")
    .select("lesson_id, section, score, updated_at")
    .eq("child_id", childId)
    .order("updated_at", { ascending: false })
    .limit(20);

  const c = child as any;
  const metricsLines: string[] = [];
  if (c.reading_level) metricsLines.push(`Reading level: ${c.reading_level}`);
  for (const r of (practice ?? []) as any[]) {
    const pct = r.questions_attempted
      ? Math.round((r.questions_correct / r.questions_attempted) * 100)
      : 0;
    metricsLines.push(
      `${r.standard_id}: ${r.questions_correct}/${r.questions_attempted} (${pct}%)`,
    );
  }
  const masteryLines = ((lessons ?? []) as any[]).map(
    (l) => `${l.lesson_id} (${l.section}): ${l.score ?? "—"}`,
  );

  const res = await draftIepProgressNote({
    teacherId: profile.id,
    studentFirstName: c.name?.split(" ")[0] ?? "Student",
    gradeLevel: c.reading_level ?? "K-4",
    annualGoal,
    reportingPeriod,
    metricsBlock:
      metricsLines.length > 0 ? metricsLines.join("\n") : "No recent practice data.",
    recentMastery:
      masteryLines.length > 0 ? masteryLines.join("\n") : "No recent lesson activity.",
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, note: res.note });
}
