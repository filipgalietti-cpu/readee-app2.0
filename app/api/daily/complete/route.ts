import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/daily/complete  body: { date: "YYYY-MM-DD" }
 * Records that the signed-in family finished the given Daily Readee, so the
 * /daily archive can mark it read. Public visitors (not signed in) are a
 * no-op. B2C: recorded against the parent's first child.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: true }); // logged-out reader — nothing to record

  let body: { date?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const date = (body.date ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "bad date" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: kid } = await admin
    .from("children")
    .select("id")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!kid) return NextResponse.json({ ok: true });

  await admin
    .from("daily_reads")
    .upsert({ child_id: (kid as { id: string }).id, daily_date: date }, { onConflict: "child_id,daily_date" });

  return NextResponse.json({ ok: true });
}
