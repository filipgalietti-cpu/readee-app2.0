import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth/helpers";

/**
 * Classroom layout — the /classroom tree is educator-only.
 * Non-teacher users get bounced to the regular dashboard. First-time
 * educators (no display_name) get sent through the onboarding wizard
 * so we can capture name + grade + setting + intent before they land
 * in an empty classroom.
 */
export default async function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "educator") redirect("/dashboard");
  if (!(profile as any).display_name) redirect("/onboarding/teacher");

  return <>{children}</>;
}
