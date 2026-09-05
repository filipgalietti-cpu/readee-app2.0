import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { awardCarrots } from "@/lib/levels/award-carrots";
import { journeyCatalog, gradeFinal } from "@/lib/journey-v2/catalog";
import { loadJourney, loadProgress } from "@/lib/journey-v2/load";
import { buildJourney, EXAM_PASS_PCT } from "@/lib/journey-v2/journey";
import { carrotsFor, locateItem } from "@/lib/journey-v2/items";

/**
 * POST /api/journey/complete — a runner finished an item on the V2 journey.
 * Verifies the child is the caller's, that the item is on the child's plan
 * (free unit or Readee+), records the attempt, awards carrots through the
 * single choke point, and answers with what to do next.
 */
const Body = z.object({
  childId: z.string().uuid(),
  kind: z.enum(["warmup", "lesson", "quiz", "exam", "final"]),
  id: z.string().min(1).max(120),
  /** 0-100 when the runner scored it (questions, exams). */
  score: z.number().min(0).max(100).nullable().optional(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 }); }
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Bad submission." }, { status: 400 });
  const { childId, kind, id } = parsed.data;
  const score = parsed.data.score ?? null;

  const loaded = await loadJourney({ parentId: user.id, childId });
  if (!loaded) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  const where = locateItem(kind, id);
  if (!where) return NextResponse.json({ ok: false, error: "Unknown item." }, { status: 404 });

  // The plan: the prescribed unit is free end to end; graduation exams and every other unit are Readee+.
  const { view } = loaded;
  const onFreeUnit = where.unitId === view.prescribedUnitId && kind !== "final";
  if (!view.fullAccess && !onFreeUnit) return NextResponse.json({ ok: false, error: "This part of the journey is Readee+.", upgrade: true }, { status: 403 });

  const passed = kind === "exam" || kind === "final" ? (score ?? 0) >= EXAM_PASS_PCT : true;
  const admin = supabaseAdmin();
  const { error } = await admin.from("journey_v2_progress").insert({
    child_id: childId,
    item_type: kind,
    item_id: id,
    unit_id: where.unitId,
    score: score === null ? null : Math.round(score),
    passed,
  });
  if (error) return NextResponse.json({ ok: false, error: "Could not save progress." }, { status: 500 });

  const carrots = carrotsFor(kind, score, passed);
  // awardCarrots is the one choke point for every award site (levels count on it).
  const award = await awardCarrots(admin as unknown as Parameters<typeof awardCarrots>[0], childId, carrots);

  // Recompute with the new row so the client gets the real next step.
  const progress = await loadProgress(supabase, childId);
  const next = buildJourney({
    childId,
    catalog: journeyCatalog(),
    finals: { 0: gradeFinal(0), 1: gradeFinal(1), 2: gradeFinal(2), 3: gradeFinal(3), 4: gradeFinal(4) },
    startBand: loaded.startBand,
    enrolledBand: loaded.enrolledBand,
    progress,
    fullAccess: view.fullAccess,
  });
  const unitDone = !next.units.some((u) => u.id === where.unitId && u.status === "current");
  return NextResponse.json({
    ok: true,
    passed,
    carrots,
    award,
    unitDone,
    next: next.current ? { kind: next.current.item.kind, id: next.current.item.id, title: next.current.item.title, href: next.current.item.href, free: next.current.item.free, unitId: next.current.unit.id, unitName: next.current.unit.name } : null,
  });
}
