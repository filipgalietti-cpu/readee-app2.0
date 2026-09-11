/** Reserve the real introduction's layout; no second loader or timed reveal. */
export default function JourneySkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8"
      role="status"
      aria-label="Opening your reading journey"
      data-journey-loading
    >
      <p className="text-sm font-medium text-violet-700">Opening your reading journey…</p>
      <div aria-hidden className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="h-12 max-w-md rounded-lg bg-violet-100/70" />
          <div className="mt-5 h-5 max-w-lg rounded bg-zinc-100" />
          <div className="mt-3 h-5 max-w-sm rounded bg-zinc-100" />
          <div className="mt-9 h-64 rounded-2xl border border-violet-100 bg-white" />
        </div>
        <div className="h-[440px] rounded-2xl border border-violet-100 bg-violet-50/50" />
      </div>
    </div>
  );
}
