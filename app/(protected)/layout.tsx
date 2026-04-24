import TosGate from "@/app/_components/TosGate";
import SidebarShell from "@/app/_components/SidebarShell";
import FeedbackButton from "@/app/_components/FeedbackButton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  return (
    <TosGate>
      <SidebarShell>{children}</SidebarShell>
      <FeedbackButton />
    </TosGate>
  );
}
