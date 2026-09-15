import { NextResponse } from "next/server";
import { unitOneEnabled } from "@/lib/approved-unit/access";
import { UNIT_VERSION, UNIT_ONE } from "@/lib/approved-unit/catalogue";
import { createClient } from "@/lib/supabase/server";
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
export async function GET(req: Request) {
  const db = await createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user || !unitOneEnabled()) return json({ enabled: false, completed: [] });
  const child = new URL(req.url).searchParams.get("child");
  if (!child) return json({ enabled: true, completed: [] });
  if (!/^[0-9a-f-]{36}$/i.test(child)) return json({ error: "Invalid reader" }, 400);
  const { data: reader } = await db
    .from("children")
    .select("id")
    .eq("id", child)
    .eq("parent_id", user.id)
    .maybeSingle();
  if (!reader) return json({ error: "Reader unavailable" }, 404);
  const { data, error } = await db
    .from("approved_unit_sessions")
    .select("lesson_id")
    .eq("child_id", child)
    .eq("release_id", UNIT_VERSION)
    .eq("completed", true);
  if (error) return json({ error: "Progress unavailable" }, 503);
  return json({
    enabled: true,
    completed: UNIT_ONE.filter((l) => data?.some((r) => r.lesson_id === l.id)).map(
      (l) => l.standard,
    ),
  });
}
