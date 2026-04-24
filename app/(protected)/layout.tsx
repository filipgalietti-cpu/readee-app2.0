import TosGate from "@/app/_components/TosGate";
import SidebarShell from "@/app/_components/SidebarShell";
import FeedbackButton from "@/app/_components/FeedbackButton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

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

  // Tag subsequent server-side errors with the authed user so Sentry
  // issues carry "who was affected" without leaking extra PII — we
  // already hold id + email via auth anyway.
  Sentry.setUser({ id: user.id, email: user.email ?? undefined });

  return (
    <TosGate>
      <SidebarShell>{children}</SidebarShell>
      <FeedbackButton />
    </TosGate>
  );
}
