import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";

/**
 * GET /api/admin/school/[schoolId]/export
 *
 * Streams a CSV of every student in the school with their per-classroom
 * mastery. School admin (direct or via parent district) only.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  // Authority check.
  const { data: selfDirect } = await supabase
    .from("admin_memberships")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("scope", "school")
    .eq("school_id", schoolId)
    .maybeSingle();
  if (!selfDirect) {
    const { data: school } = await supabase
      .from("schools")
      .select("district_id")
      .eq("id", schoolId)
      .maybeSingle();
    const districtId = (school as any)?.district_id;
    if (!districtId) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const { data: selfDistrict } = await supabase
      .from("admin_memberships")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("scope", "district")
      .eq("district_id", districtId)
      .maybeSingle();
    if (!selfDistrict) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { data: school } = await supabase
    .from("schools")
    .select("id, name")
    .eq("id", schoolId)
    .maybeSingle();
  if (!school) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: classrooms } = await supabase
    .from("classrooms")
    .select("id, name, grade_level")
    .eq("school_id", schoolId)
    .is("archived_at", null);

  const classroomList = (classrooms ?? []) as {
    id: string;
    name: string;
    grade_level: string | null;
  }[];
  const classroomById = new Map(classroomList.map((c) => [c.id, c]));
  const classroomIds = classroomList.map((c) => c.id);

  const { data: memberships } = classroomIds.length
    ? await supabase
        .from("classroom_memberships")
        .select("classroom_id, child_id, children(id, first_name, grade, streak_days, carrots, last_lesson_at)")
        .in("classroom_id", classroomIds)
    : { data: [] as any[] };

  const memberRows = (memberships ?? []) as any[];
  const studentIds = Array.from(new Set(memberRows.map((r) => r.children?.id).filter(Boolean)));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data: practice } = studentIds.length
    ? await supabase
        .from("practice_results")
        .select("child_id, questions_attempted, questions_correct")
        .in("child_id", studentIds)
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
    "Classroom",
    "Grade",
    "Student first name",
    "Student grade",
    "Mastery (30d %)",
    "Questions (30d)",
    "Streak",
    "Carrots",
    "Last active",
  ];

  const lines = [header.map(csvEscape).join(",")];
  for (const m of memberRows) {
    const c = m.children;
    if (!c) continue;
    const cls = classroomById.get(m.classroom_id);
    if (!cls) continue;
    const mt = mastery.get(c.id);
    const masteryPct = mt && mt.attempted > 0 ? Math.round((mt.correct / mt.attempted) * 100) : "";
    lines.push(
      [
        csvEscape(cls.name),
        csvEscape(cls.grade_level ?? ""),
        csvEscape(c.first_name),
        csvEscape(c.grade ?? ""),
        csvEscape(masteryPct),
        csvEscape(mt?.attempted ?? 0),
        csvEscape(c.streak_days ?? 0),
        csvEscape(c.carrots ?? 0),
        csvEscape(c.last_lesson_at ?? ""),
      ].join(","),
    );
  }

  const csv = lines.join("\r\n");
  const s = school as any;
  const clean = (s.name as string).replace(/[^a-zA-Z0-9\- ]/g, "").trim().replace(/\s+/g, "_");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${clean || "school"}-progress-${date}.csv"`,
    },
  });
}

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
