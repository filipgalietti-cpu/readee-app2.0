import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import sampleLessons from "@/app/data/sample-lessons.json";
import DesktopPlayClient from "./_components/DesktopPlayClient";

export const dynamic = "force-dynamic";

/**
 * Desktop play-by-standard preview — renders ANY lesson in the canon
 * desktop wireframe (LessonShellDesktop), the same shell the canon
 * audit at /owner/lesson-timing-audit uses for the 5 reference lessons.
 *
 * The canon audit page itself is hardcoded to the 5 canon standards, so
 * this route is how we eyeball a non-canon lesson (e.g. a freshly healed
 * example) in the real desktop format during the catalog rollout.
 *
 *   /owner/lesson-timing-audit/play/RL.1.3
 */
export default async function DesktopPlayPage({
  params,
}: {
  params: Promise<{ standardId: string }>;
}) {
  const { standardId } = await params;
  const profile = await requireProfile();
  if (!isPlatformAdmin(profile as any)) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-zinc-500">
        Owner only.
      </div>
    );
  }

  const lesson = (sampleLessons as any[]).find(
    (l) => l.standardId === standardId,
  );
  if (!lesson) notFound();

  return <DesktopPlayClient lesson={lesson} />;
}
