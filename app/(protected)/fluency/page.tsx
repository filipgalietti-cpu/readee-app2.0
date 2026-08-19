import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Fluency Check has folded into Luna — reading aloud is now "Read with Luna"
 * (`/luna/read`), graded by the streaming Azure engine. This route forwards
 * there; the old FluencyRecorder + `/api/fluency/analyze` (pre-Azure grading,
 * the "wasn't good" path) are retired.
 */
export default async function FluencyRedirect({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const { child } = await searchParams;
  redirect(child ? `/luna/read?child=${child}` : "/luna/read");
}
