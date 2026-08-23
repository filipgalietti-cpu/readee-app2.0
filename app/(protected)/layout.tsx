import TosGate from "@/app/_components/TosGate";
import StopAudioOnNav from "@/app/_components/StopAudioOnNav";
import SidebarShell from "@/app/_components/SidebarShell";
import { createClient } from "@/lib/supabase/server";
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

  // Guard the "authenticated but no profile row" edge (signup race, or a
  // deleted profile). Without this, protected pages that call
  // requireProfile() throw an unhandled "Profile not found" (500 + Sentry
  // noise) instead of sending the user somewhere sane. Normal users have a
  // profile, so this is a no-op for them beyond one light existence check.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    redirect("/login");
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
