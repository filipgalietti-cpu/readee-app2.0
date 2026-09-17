import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UNIT_ONE, UNIT_VERSION, isApprovedId } from "@/lib/approved-unit/catalogue";
import { loadJourneySnapshot } from "@/lib/journey/load.server";
import { unitHasAccess } from "@/lib/approved-unit/entitlement";
import { unitAccess, unitOneEnabled } from "@/lib/approved-unit/access";
import Player from "@/app/components/approved-unit/Player";
export default async function UnitOne({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; lesson?: string }>;
}) {
  if (!unitOneEnabled()) notFound();
  const { child, lesson } = await searchParams;
  if (!child || !/^[0-9a-f-]{36}$/i.test(child)) redirect("/dashboard");
  const db = await createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: reader } = await db
    .from("children")
    .select("id,first_name")
    .eq("id", child)
    .eq("parent_id", user.id)
    .maybeSingle();
  if (!reader) notFound();
  if (lesson) {
    if (!isApprovedId(lesson)) notFound();
    const access = await unitAccess(child, lesson);
    if ("error" in access) {
      if (access.error === 403) redirect("/upgrade?reason=lesson");
      if (access.error === 409) redirect(`/learn/unit-one?child=${child}`);
      notFound();
    }
    return <Player key={`${child}:${lesson}`} child={child} lesson={lesson} />;
  }
  const { data: progress, error } = await db
    .from("approved_unit_sessions")
    .select(
      "lesson_id,completed,result,carrots_awarded,practice_finished:state->practice->finished",
    )
    .eq("child_id", child)
    .eq("release_id", UNIT_VERSION);
  if (error)
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-bold">Unit 1 is getting ready</h1>
        <p>Saved progress is temporarily unavailable. Please try again shortly.</p>
        <Link href="/dashboard">Back to dashboard</Link>
      </main>
    );
  const done = (id: string) => progress?.some((p) => p.lesson_id === id && p.completed) ?? false;
  const snapshot = await loadJourneySnapshot(child);
  if (!snapshot) notFound();
  const locked = (id: string) => !unitHasAccess(snapshot, id);
  const count = UNIT_ONE.filter((l) => done(l.id)).length,
    exam = progress?.find((p) => p.lesson_id === "k-unit-1-checkpoint");
  const href = (id: string) => `/learn/unit-one?child=${child}&lesson=${id}`;
  return (
    <main className="min-h-dvh bg-[#f7f2e6] px-5 py-8 text-[#29213a]">
      <div className="mx-auto max-w-4xl">
        <Link className="font-semibold text-violet-700" href={`/journey?child=${child}`}>
          ← Reading journey
        </Link>
        <Link
          className="ml-6 font-semibold text-violet-700"
          href={`/learn/unit-one/report?child=${child}`}
        >
          Parent progress report
        </Link>
        <p className="mt-8 text-sm font-bold uppercase tracking-widest">Kindergarten · Unit 1</p>
        <h1 className="mt-2 text-4xl font-bold">Let’s grow, {reader.first_name}!</h1>
        <p className="mt-3 text-lg">
          {count} of {UNIT_ONE.length} lessons completed
        </p>
        <p className="mt-3">
          Finish these lessons, then take the unit exam. At least 80% at regular difficulty or
          above, with every question independently checked, opens the next unit. Microphone problems
          need another check, not a wrong mark.
        </p>
        <ol className="my-8 grid gap-4 sm:grid-cols-2">
          {UNIT_ONE.map((l, n) => (
            <li key={l.id}>
              <Link
                className="flex min-h-28 items-center gap-4 rounded-3xl border-2 border-violet-100 bg-white p-5 shadow-sm focus-visible:outline-violet-600"
                href={locked(l.id) ? "/upgrade?reason=lesson" : href(l.id)}
              >
                <span
                  className="text-2xl font-bold text-violet-600"
                  aria-label={done(l.id) ? "Completed" : `Lesson ${n + 1}`}
                >
                  {done(l.id) ? "✓" : n + 1}
                </span>
                <span>
                  <span className="block text-xl font-bold">{l.title}</span>
                  <span className="text-sm">
                    {locked(l.id)
                      ? "Readee+"
                      : done(l.id)
                        ? "Completed · View"
                        : "Warm-up, lesson and practice"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <section className="rounded-3xl bg-white p-6">
          <h2 className="text-2xl font-bold">The Story Garden</h2>
          <p className="my-3">
            Your Unit 1 gateway: ten questions, including two answers spoken to Luna.
          </p>
          {count === UNIT_ONE.length ? (
            <Link
              className="inline-block rounded-2xl bg-violet-600 px-6 py-3 font-bold text-white"
              href={
                locked("k-unit-1-checkpoint")
                  ? "/upgrade?reason=lesson"
                  : exam?.practice_finished === true
                    ? `/learn/unit-one/report?child=${child}`
                    : href("k-unit-1-checkpoint")
              }
            >
              {locked("k-unit-1-checkpoint")
                ? "Continue with Readee+"
                : exam?.practice_finished === true
                  ? "See parent results"
                  : exam?.completed
                    ? "Continue the unit exam"
                    : "Start the unit exam"}
            </Link>
          ) : (
            <p>Finish the eight lessons to open your unit exam.</p>
          )}
          {exam?.result?.readiness?.status === "ready" && (
            <p className="mt-4 font-bold text-green-700">
              Unit exam passed.{" "}
              <Link href={`/journey?child=${child}&completed=k-unit-1-checkpoint`}>
                Continue your journey →
              </Link>
            </p>
          )}
          {exam?.completed && exam.result?.readiness && (
            <p className="mt-4">
              {exam.result.readiness.percent === null
                ? "Some questions still need an independent answer."
                : `${exam.result.readiness.correct} of ${exam.result.readiness.total} correct (${exam.result.readiness.percent}%).`}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
