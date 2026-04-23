import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth/helpers";

/**
 * Classroom layout — the /classroom tree is educator-only.
 * Non-teacher users get bounced to the regular dashboard.
 *
 * We use the existing 'educator' role on profiles.role. There is no
 * separate teacher account type — a single user can be a parent OR an
 * educator (never both for now). Role can be flipped via the dev
 * promotion server action in classroom/actions.ts until we ship a
 * proper teacher signup flow.
 */
export default async function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "educator") redirect("/dashboard");

  return <>{children}</>;
}
