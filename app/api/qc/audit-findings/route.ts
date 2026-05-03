import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasAnyAdminAccess } from "@/lib/auth/admin-gate";

export const dynamic = "force-dynamic";

/**
 * Admin-only finding triage actions for /owner/content-audit.
 *
 * POST /api/qc/audit-findings
 *   body: {
 *     ids: string[]              // one or many finding ids
 *     status: "fixed"|"wont_fix"|"open"|"duplicate"
 *     note?: string              // optional resolver note
 *   }
 *
 * Updates `status`, `resolved_by`, `resolved_at`, `resolver_note` for
 * each finding. RLS already restricts UPDATE to admin_memberships, but
 * we also gate at the route level so non-admins get a clean 403 (vs. a
 * silent no-op from RLS).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const isAdmin = await hasAnyAdminAccess(user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  let body: { ids?: string[]; status?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON." }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((s) => typeof s === "string") : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "No finding ids." }, { status: 400 });
  }
  if (ids.length > 500) {
    return NextResponse.json({ error: "Too many ids in one batch (max 500)." }, { status: 400 });
  }
  const allowed = new Set(["open", "fixed", "wont_fix", "duplicate"]);
  if (!body.status || !allowed.has(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const note = typeof body.note === "string" ? body.note.slice(0, 500) : null;
  const isResolution = body.status === "fixed" || body.status === "wont_fix" || body.status === "duplicate";

  const { data, error } = await supabase
    .from("content_audit_findings")
    .update({
      status: body.status,
      resolver_note: note,
      resolved_by: isResolution ? user.id : null,
      resolved_at: isResolution ? new Date().toISOString() : null,
    })
    .in("id", ids)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    updated: data?.length ?? 0,
    status: body.status,
  });
}
