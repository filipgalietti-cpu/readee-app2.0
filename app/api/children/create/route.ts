import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { synthesizeChildGreeting } from "@/lib/audio/child-greeting";
import { hasFullAccessFromProfile } from "@/lib/plan/access";

export const dynamic = "force-dynamic";

/**
 * POST /api/children/create — server-enforced reader creation.
 *
 * The reader cap (1 on free, 2 with full access — paid or inside the retired
 * reverse trial) was previously checked only in the settings UI, which a
 * client could skip with a direct insert. This route is the enforcement:
 * authenticate, resolve the effective plan off the profiles row, count the
 * parent's existing readers, and only then insert (via the admin client).
 *
 * Body (JSON): { first_name, grade? }
 * Returns { ok, child } or 402 { error: "limit", reason: "multi_reader" }
 * when the cap is reached.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let b: { first_name?: unknown; grade?: unknown };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }
  const firstName = String(b?.first_name ?? "").trim().slice(0, 50);
  const grade = b?.grade ? String(b.grade).slice(0, 30) : null;
  if (!firstName) return NextResponse.json({ error: "first_name required" }, { status: 400 });

  // Cap: 1 reader on free, 2 with full access (same resolution every other
  // server gate uses — trial resolves to full access).
  const admin = supabaseAdmin();
  const { data: prof } = await admin
    .from("profiles")
    .select("plan, created_at, had_subscription")
    .eq("id", user.id)
    .maybeSingle();
  const maxReaders = hasFullAccessFromProfile(
    prof as { plan?: string | null; created_at?: string | null; had_subscription?: boolean | null } | null,
  )
    ? 2
    : 1;

  const { count } = await admin
    .from("children")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", user.id);
  if ((count ?? 0) >= maxReaders) {
    return NextResponse.json(
      { error: "limit", reason: "multi_reader", maxReaders },
      { status: 402 },
    );
  }

  const { data: child, error } = await admin
    .from("children")
    .insert({
      parent_id: user.id,
      first_name: firstName,
      grade,
    })
    .select()
    .single();
  if (error) {
    console.error("[children/create] insert failed:", error);
    return NextResponse.json({ error: "Could not add reader." }, { status: 500 });
  }

  // Personal greeting clip, synthesized once at name submission. Fire and
  // forget: must never block or fail the creation response.
  void synthesizeChildGreeting(child.id, firstName);

  return NextResponse.json({ ok: true, child });
}
