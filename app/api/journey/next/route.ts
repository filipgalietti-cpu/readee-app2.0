import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadJourney } from "@/lib/journey-v2/load";

/**
 * GET /api/journey/next?child=<id> — the child's next step on the V2 journey,
 * for surfaces that are client components today (the dashboard CTA). Answers
 * { v2: false } for a child on the legacy journey so callers keep their
 * existing behavior.
 */
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const childId = new URL(req.url).searchParams.get("child");
  const loaded = await loadJourney({ parentId: user.id, childId });
  if (!loaded) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  if (!loaded.isV2Journey) return NextResponse.json({ ok: true, v2: false });
  const { view } = loaded;
  const cur = view.current;
  return NextResponse.json({
    ok: true,
    v2: true,
    childId: view.childId,
    hasPlacement: loaded.hasPlacement,
    complete: cur === null,
    next: cur
      ? {
          kind: cur.item.kind,
          id: cur.item.id,
          title: cur.item.title,
          href: cur.item.href,
          free: cur.item.free,
          unitId: cur.unit.id,
          unitName: cur.unit.name,
          unitGrade: cur.unit.grade,
          unitDone: cur.unit.lessonsDone,
          unitTotal: cur.unit.lessonsTotal,
        }
      : null,
    unbuiltAhead: view.unbuiltAhead,
  });
}
