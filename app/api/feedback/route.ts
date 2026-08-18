import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { trackError } from "@/lib/observability/track";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: { message?: string; path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const path = (body.path ?? "").slice(0, 500) || null;
  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 500) || null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profile as any)?.role ?? null;

  const { error } = await supabase.from("feedback_reports").insert({
    user_id: user.id,
    user_role: role,
    path,
    message,
    user_agent: userAgent,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort email alert to Filip so stuff doesn't rot in the DB.
  // Failures here don't fail the user's submission.
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      // Resend returns { error } instead of throwing on API failures.
      const { error: sendError } = await resend.emails.send({
        // From notify@ (not hello@) to avoid the self-addressed send that
        // got hello@ suppressed; recipient env-overridable.
        from: "Readee <notify@readee.app>",
        // hello@ is Resend-blocked until ~Sep 1; route to a working inbox.
        to: process.env.TEAM_INBOX_EMAIL || "filip.galietti@gmail.com",
        replyTo: user.email ?? undefined,
        subject: `[Readee feedback] ${role ?? "user"}: ${message.slice(0, 60)}`,
        text: [
          `From: ${user.email ?? "(no email)"}`,
          `Role: ${role ?? "(none)"}`,
          `Path: ${path ?? "(none)"}`,
          `UA: ${userAgent ?? "(none)"}`,
          ``,
          message,
        ].join("\n"),
      });
      if (sendError) {
        console.error("Feedback email alert failed (Resend):", sendError);
        trackError(sendError, { route: "api.feedback.email_alert", userId: user.id });
      }
    } catch (e) {
      console.error("Feedback email alert failed:", e);
      trackError(e, {
        route: "api.feedback.email_alert",
        userId: user.id,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
