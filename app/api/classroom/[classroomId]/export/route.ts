import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { csvEscape, safeExportFilename } from "@/lib/util/csv";

/**
 * GET /api/classroom/[classroomId]/export?type=roster|assignments
 *
 * Server-side CSV generator for teachers. Roster export includes mastery,
 * streak, carrots. Assignment export is a student x assignment matrix
 * of completion + score.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ classroomId: string }> },
) {
  const { classroomId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, teacher_id")
    .eq("id", classroomId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!classroom) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "roster";

  if (type === "roster") return rosterCsv(supabase, classroom as any);
  if (type === "assignments") return assignmentsCsv(supabase, classroom as any);
  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

// csvEscape + safeExportFilename live in lib/util/csv.ts

async function rosterCsv(
  supabase: Awaited<ReturnType<typeof createClient>>,
  classroom: { id: string; name: string },
): Promise<Response> {
  const { data: memberships } = await supabase
    .from("classroom_memberships")
    .select("child_id, children(id, first_name, grade, carrots, streak_days, last_lesson_at)")
    .eq("classroom_id", classroom.id);

  const rows = (memberships ?? []) as any[];
  const childIds = rows.map((r) => r.children?.id).filter((x): x is string => !!x);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data: practice } = childIds.length
    ? await supabase
        .from("practice_results")
        .select("child_id, questions_attempted, questions_correct, completed_at")
        .in("child_id", childIds)
        .gte("completed_at", thirtyDaysAgo)
    : { data: [] as any[] };

  const mastery = new Map<string, { attempted: number; correct: number }>();
  (practice ?? []).forEach((p: any) => {
    const cur = mastery.get(p.child_id) ?? { attempted: 0, correct: 0 };
    cur.attempted += p.questions_attempted;
    cur.correct += p.questions_correct;
    mastery.set(p.child_id, cur);
  });

  const header = [
    "Student first name",
    "Grade",
    "Mastery (30d %)",
    "Questions attempted (30d)",
    "Streak days",
    "Carrots",
    "Last active",
  ];
  const lines = [header.map(csvEscape).join(",")];
  for (const r of rows) {
    const c = r.children;
    if (!c) continue;
    const m = mastery.get(c.id);
    const masteryPct = m && m.attempted > 0 ? Math.round((m.correct / m.attempted) * 100) : "";
    lines.push(
      [
        csvEscape(c.first_name),
        csvEscape(c.grade ?? ""),
        csvEscape(masteryPct),
        csvEscape(m?.attempted ?? 0),
        csvEscape(c.streak_days ?? 0),
        csvEscape(c.carrots ?? 0),
        csvEscape(c.last_lesson_at ?? ""),
      ].join(","),
    );
  }

  const csv = lines.join("\r\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${safeExportFilename(classroom.name, "roster")}"`,
    },
  });
}

async function assignmentsCsv(
  supabase: Awaited<ReturnType<typeof createClient>>,
  classroom: { id: string; name: string },
): Promise<Response> {
  const [{ data: memberships }, { data: assignments }] = await Promise.all([
    supabase
      .from("classroom_memberships")
      .select("child_id, children(id, first_name)")
      .eq("classroom_id", classroom.id),
    supabase
      .from("assignments")
      .select("id, title, source_id, due_at")
      .eq("classroom_id", classroom.id)
      .order("due_at", { ascending: true, nullsFirst: false }),
  ]);

  const memberRows = (memberships ?? []) as any[];
  const studentIds = memberRows.map((m) => m.children?.id).filter((x): x is string => !!x);
  const assignmentList = (assignments ?? []) as { id: string; title: string; source_id: string; due_at: string | null }[];

  const { data: submissions } = studentIds.length && assignmentList.length
    ? await supabase
        .from("assignment_submissions")
        .select("assignment_id, child_id, completed_at, score_percent")
        .in("child_id", studentIds)
        .in(
          "assignment_id",
          assignmentList.map((a) => a.id),
        )
    : { data: [] as any[] };

  const key = (aid: string, cid: string) => `${aid}|${cid}`;
  const subMap = new Map<string, { completed_at: string | null; score_percent: number | null }>();
  (submissions ?? []).forEach((s: any) => {
    subMap.set(key(s.assignment_id, s.child_id), {
      completed_at: s.completed_at,
      score_percent: s.score_percent == null ? null : Number(s.score_percent),
    });
  });

  const header = ["Student", ...assignmentList.map((a) => `${a.title} (${a.source_id})`)];
  const lines = [header.map(csvEscape).join(",")];
  for (const m of memberRows) {
    const c = m.children;
    if (!c) continue;
    const row: (string | number)[] = [c.first_name];
    for (const a of assignmentList) {
      const sub = subMap.get(key(a.id, c.id));
      if (!sub || !sub.completed_at) {
        row.push("");
      } else if (sub.score_percent !== null) {
        row.push(`${Math.round(sub.score_percent)}%`);
      } else {
        row.push("done");
      }
    }
    lines.push(row.map(csvEscape).join(","));
  }

  const csv = lines.join("\r\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${safeExportFilename(classroom.name, "assignments")}"`,
    },
  });
}
