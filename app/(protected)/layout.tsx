import TosGate from "@/app/_components/TosGate";
import StopAudioOnNav from "@/app/_components/StopAudioOnNav";
import SidebarShell from "@/app/_components/SidebarShell";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { SIDEBAR_COOKIE_NAME } from "@/lib/sidebar/cookie";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Guard the "authenticated but no profile row" edge. The handle_new_user
  // trigger creates this row on signup, but a legacy account, a trigger
  // miss, or a deleted profile can leave an authed user without one — which
  // used to throw "Profile not found" (500 + Sentry noise) on /review and
  // every requireProfile() page. Normal users have a profile, so this is a
  // no-op for them beyond one light existence check.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    // Self-heal instead of dead-ending: recreate the row (mirroring the
    // trigger) via the admin client so RLS can't block the insert, then let
    // the user continue. Fall back to /login only if the heal itself fails.
    const metaRole = (user.user_metadata?.role as string | undefined) ?? "parent";
    const role = metaRole === "educator" ? "educator" : "parent";
    const { error: healErr } = await supabaseAdmin()
      .from("profiles")
      .upsert(
        { id: user.id, email: user.email, role, onboarding_complete: false },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (healErr) {
      Sentry.captureException(healErr, {
        tags: { where: "protected-layout-profile-heal" },
        extra: { userId: user.id },
      });
      redirect("/login");
    }
  }

  // Tag subsequent server-side errors with the authed user so Sentry
  // issues carry "who was affected" without leaking extra PII — we
  // already hold id + email via auth anyway.
  Sentry.setUser({ id: user.id, email: user.email ?? undefined });

  // Read sidebar open state from the cookie on the server so the
  // initial margin matches the user's last preference. Without this
  // the store boots collapsed → user's actual state hydrates →
  // content column shifts horizontally. Big CLS source.
  const cookieStore = await cookies();
  const sidebarOpenCookie = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value;
  const initialSidebarOpen = sidebarOpenCookie === "true";

  return (
    <TosGate>
      <StopAudioOnNav />
      <SidebarShell initialOpen={initialSidebarOpen}>{children}</SidebarShell>
    </TosGate>
  );
}
