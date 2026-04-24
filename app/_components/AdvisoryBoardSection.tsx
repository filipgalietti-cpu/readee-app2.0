import { Users } from "lucide-react";
import { ADVISORY_BOARD } from "@/lib/data/advisors";

/**
 * Shared UI for /about and /schools. Renders all seats — including
 * placeholders — with distinct styling per state so the board shows
 * growth momentum without looking empty.
 */
export default function AdvisoryBoardSection({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  if (variant === "compact") {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          <Users className="h-4 w-4" />
          Advisory board
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-slate-400">
          Readee is advised by educators, researchers, and administrators who
          care about evidence-based reading instruction. We&apos;re actively
          seating our founding advisors — if you&apos;re a superintendent,
          reading researcher, or reading specialist interested in shaping
          Readee&apos;s direction, reach out at{" "}
          <a className="font-semibold text-indigo-700 hover:underline" href="mailto:hello@readee.app?subject=Readee%20advisory%20board">
            hello@readee.app
          </a>
          .
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
        <Users className="h-4 w-4" />
        Advisory board
      </div>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Built with educators at the table
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-slate-400">
        Readee&apos;s content and product direction is shaped by a small
        advisory board of educators, researchers, and district leaders. We&apos;re
        currently seating our founding advisors.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {ADVISORY_BOARD.map((a) => (
          <AdvisorCard key={a.name} advisor={a} />
        ))}
      </div>

      <p className="mt-5 text-xs text-zinc-500 dark:text-slate-400">
        Know someone who&apos;d be a great fit? Email{" "}
        <a className="font-semibold text-indigo-700 hover:underline" href="mailto:hello@readee.app?subject=Readee%20advisory%20board">
          hello@readee.app
        </a>
        .
      </p>
    </section>
  );
}

function AdvisorCard({ advisor }: { advisor: (typeof ADVISORY_BOARD)[number] }) {
  const isConfirmed = advisor.status === "confirmed";
  const isPending = advisor.status === "in_discussion";
  const isPlaceholder = advisor.status === "placeholder";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isConfirmed
          ? "border-indigo-200 bg-white shadow-sm dark:border-indigo-900/40 dark:bg-slate-900/40"
          : isPending
          ? "border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20"
          : "border-dashed border-zinc-200 bg-zinc-50/60 dark:border-slate-800 dark:bg-slate-950/40"
      }`}
    >
      <div className="flex items-start gap-3">
        {advisor.headshotUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={advisor.headshotUrl}
            alt={advisor.name}
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-slate-700"
          />
        ) : (
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold ${
              isPlaceholder
                ? "bg-zinc-100 text-zinc-400 dark:bg-slate-800 dark:text-slate-500"
                : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
            }`}
          >
            {advisor.name
              .replace(/Seat \d+\s*—\s*/, "")
              .split(/\s+/)
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-zinc-900 dark:text-white">
            {advisor.name}
          </div>
          <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            {advisor.role}
            {advisor.org ? ` · ${advisor.org}` : ""}
          </div>
          {isPending && (
            <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              In discussion
            </span>
          )}
          {isPlaceholder && (
            <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:bg-slate-800 dark:text-slate-400">
              Seat open
            </span>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-slate-400">
        {advisor.bio}
      </p>
    </div>
  );
}
