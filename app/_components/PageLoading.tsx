/** Route loading stays inside the shared shell, leaving navigation usable. */
export default function PageLoading() {
  return (
    <div className="mx-auto min-h-[60dvh] max-w-6xl px-5 py-8 sm:px-8" role="status" aria-label="Loading page" data-page-loading>
      <span className="sr-only">Opening this page…</span>
      <div aria-hidden="true" className="space-y-8">
        <div className="space-y-4">
          <div className="h-10 w-2/3 max-w-sm rounded-lg bg-violet-100/70" />
          <div className="h-4 w-3/4 max-w-lg rounded bg-zinc-100" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="h-72 rounded-2xl border border-violet-100 bg-violet-50/40" />
          <div className="space-y-4">
            <div className="h-32 rounded-2xl border border-zinc-100 bg-zinc-50" />
            <div className="h-32 rounded-2xl border border-zinc-100 bg-zinc-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
