/**
 * Instant skeleton for the daily-article route so navigating in (from the
 * calendar) shows structure immediately instead of a frozen screen while
 * the server fetch runs. Next also prefetches this shell on link hover.
 */
export default function Loading() {
  return (
    <article className="min-h-screen bg-white">
      <div className="sticky top-0 z-20 border-b border-zinc-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-6 py-3">
          <div className="h-4 w-16 rounded bg-zinc-200" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl animate-pulse px-4 py-10 sm:px-6">
        <div className="h-3 w-40 rounded bg-zinc-200" />
        <div className="mt-3 h-9 w-3/4 rounded bg-zinc-200" />
        <div className="mx-auto mt-5 h-[320px] w-[320px] max-w-full rounded-3xl bg-zinc-200" />
        <div className="mt-4 h-3 w-32 rounded bg-zinc-100" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full rounded bg-zinc-100" />
          <div className="h-4 w-full rounded bg-zinc-100" />
          <div className="h-4 w-5/6 rounded bg-zinc-100" />
          <div className="h-4 w-full rounded bg-zinc-100" />
          <div className="h-4 w-2/3 rounded bg-zinc-100" />
        </div>
      </div>
    </article>
  );
}
