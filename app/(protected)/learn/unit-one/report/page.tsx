import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UNIT_VERSION, approvedLesson } from "@/lib/approved-unit/catalogue";
import { parentQuestionReport } from "@/lib/approved-unit/parent-report";
import ParentProgressReport from "@/app/components/approved-unit/ParentProgressReport";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const { child } = await searchParams;
  if (!child || !/^[0-9a-f-]{36}$/i.test(child)) notFound();
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    redirect(`/login?redirect=${encodeURIComponent(`/learn/unit-one/report?child=${child}`)}`);
  const { data: reader, error: readerError } = await db
    .from("children")
    .select("id,first_name")
    .eq("id", child)
    .eq("parent_id", user.id)
    .maybeSingle();
  if (readerError) throw Error("Your progress report is temporarily unavailable.");
  if (!reader) notFound();
  const { data, error } = await db
    .from("approved_unit_sessions")
    .select(
      "lesson_id,results:result->results,readiness:result->readiness,attempt_id:state->practice->id,carrots_awarded",
    )
    .eq("child_id", child)
    .eq("release_id", UNIT_VERSION)
    .eq("completed", true);
  if (error) throw Error("Your saved results could not load. Please try again.");
  const reports = (data ?? []).flatMap((row) => {
    const performance = parentQuestionReport(row.lesson_id, row.results);
    const readiness =
      row.readiness && typeof row.readiness === "object" && !Array.isArray(row.readiness)
        ? row.readiness.status
        : undefined;
    return performance
      ? [
          {
            id: row.lesson_id,
            title: approvedLesson(row.lesson_id)?.title ?? "The Story Garden · Unit exam",
            performance,
            carrots: row.carrots_awarded,
            examStatus:
              row.lesson_id === "k-unit-1-checkpoint" && typeof readiness === "string"
                ? readiness
                : undefined,
            retry:
              row.lesson_id === "k-unit-1-checkpoint" &&
              readiness !== "ready" &&
              typeof row.attempt_id === "string"
                ? { child, attemptId: row.attempt_id }
                : undefined,
          },
        ]
      : [];
  });
  return (
    <ParentProgressReport
      name={reader.first_name || "Reader"}
      reports={reports}
      backHref={`/journey?child=${child}`}
    />
  );
}
