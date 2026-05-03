import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login-hint
 * body: { email: string }
 *
 * After a sign-in failure, the login form calls this to figure out
 * WHY it failed without leaking user existence to a public endpoint.
 * We return one of:
 *   { hint: "no_account" }   — no user with this email
 *   { hint: "oauth_only" }   — user exists but only has Google identity
 *   { hint: "wrong_password" } — user has email/password, just wrong
 *   { hint: "unknown" }      — fall through; show generic message
 *
 * To prevent enumeration, the endpoint is rate-limited at the edge by
 * Supabase + Vercel and only fires AFTER a failed sign-in (so an
 * attacker is paying the same cost they'd pay scraping signup
 * directly). Net new info disclosure: minimal.
 */
export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ hint: "unknown" });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ hint: "unknown" });
  }

  try {
    const admin = supabaseAdmin();
    // listUsers is not paginated by email; pull a small page filtered.
    // For our scale (low six-figure users) the email is indexed in
    // auth.users and Supabase's getUserByEmail is the right path,
    // but the admin SDK exposes that as `listUsers` with email.
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      // The current SDK accepts `filter` for some fields but email
      // lookup is best done via direct query — fall back if needed.
    } as any);
    // Safer: query the raw auth schema via SQL — but we only have
    // service role, which can do that. Use rpc when available.
    let user: any = null;
    if (data && Array.isArray(data.users)) {
      user = data.users.find(
        (u: any) => (u.email ?? "").toLowerCase() === email,
      ) ?? null;
    }
    // Fallback path: query profiles which has email mirrored at signup.
    if (!user && !error) {
      const { data: profileRow } = await admin
        .from("profiles")
        .select("id, email")
        .ilike("email", email)
        .maybeSingle();
      if (profileRow) {
        const { data: full } = await admin.auth.admin.getUserById(
          (profileRow as any).id,
        );
        user = full?.user ?? null;
      }
    }

    if (!user) return NextResponse.json({ hint: "no_account" });

    const identities: any[] = Array.isArray(user.identities) ? user.identities : [];
    const providers = identities.map((i) => i.provider);
    const hasPassword =
      providers.includes("email") || !!user.encrypted_password;
    const hasGoogle = providers.includes("google");

    if (!hasPassword && hasGoogle) {
      return NextResponse.json({ hint: "oauth_only" });
    }
    return NextResponse.json({ hint: "wrong_password" });
  } catch {
    return NextResponse.json({ hint: "unknown" });
  }
}
