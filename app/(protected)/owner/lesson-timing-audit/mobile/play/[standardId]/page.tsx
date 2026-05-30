import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import sampleLessons from "@/app/data/sample-lessons.json";
import PopoutPlayClient from "./_components/PopoutPlayClient";

export const dynamic = "force-dynamic";

/**
 * Pop-out window target — full browser window rendering ONLY the
 * iPhone shell for one lesson. Opened by the audit page's "Pop out"
 * button via window.open() so the reviewer can drag the phone preview
 * to a second monitor while keeping the comment cards on their main
 * screen.
 *
 * Url shape:
 *   /owner/lesson-timing-audit/mobile/play/RL.K.1
 */
export default async function MobilePopoutPlayPage({
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

  return <PopoutPlayClient lesson={lesson} />;
}
