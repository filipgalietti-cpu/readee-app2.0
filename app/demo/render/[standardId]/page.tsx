import { notFound } from "next/navigation";
import sampleLessons from "@/app/data/sample-lessons.json";
import DesktopPlayClient from "@/app/(protected)/owner/lesson-timing-audit/play/[standardId]/_components/DesktopPlayClient";

export const dynamic = "force-dynamic";

/**
 * TEMP dev-only public render route — lets the screenshot script capture
 * any lesson in the canon desktop wireframe without the owner auth gate.
 * Delete after rendering. Not linked anywhere.
 */
export default async function DemoRenderPage({
  params,
}: {
  params: Promise<{ standardId: string }>;
}) {
  const { standardId } = await params;
  const lesson = (sampleLessons as any[]).find((l) => l.standardId === standardId);
  if (!lesson) notFound();
  return <DesktopPlayClient lesson={lesson} />;
}
