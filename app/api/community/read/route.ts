import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/community/read — record a genuine read of a community story.
 *
 * Fired once from the client when a reader actually opens a story (so bots and
 * crawlers that don't run JS never inflate the count). The RPC dedupes per
 * reader, so refreshes don't recount. Reader identity:
 *   - authenticated -> the auth user id (also earns the kid author carrots)
 *   - anonymous      -> a long-lived per-browser cookie id (`rdc`)
 *
 * Body (JSON): { slug: string }
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const slug = String(body?.slug ?? "").trim();
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  // Prefer the authenticated user; fall back to an anon per-browser cookie.
  let readerKey: string | null = null;
  let isAuthed = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      readerKey = user.id;
      isAuthed = true;
    }
  } catch {
    /* anon is fine */
  }

  const jar = await cookies();
  let setAnonCookie = false;
  if (!readerKey) {
    let anon = jar.get("rdc")?.value;
    if (!anon) {
      anon = crypto.randomUUID();
      setAnonCookie = true;
    }
    readerKey = anon;
  }

  const { data } = await supabaseAdmin().rpc("record_community_read", {
    p_slug: slug,
    p_reader_key: readerKey,
    p_is_authed: isAuthed,
  });

  const res = NextResponse.json(data ?? { ok: true });
  if (setAnonCookie && readerKey) {
    res.cookies.set("rdc", readerKey, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  }
  return res;
}
