/**
 * Instant calendar skeleton for the Daily Readee archive so "Back to
 * archive" (and the sidebar link) paints immediately instead of freezing
 * on the 120-row fetch. Mirrors the real masthead + 7-col grid layout.
 */
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Loading() {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[76px] z-10 flex flex-col overflow-hidden bg-white lg:left-[272px]">
      <div className="mx-auto flex min-h-0 w-full max-w-[960px] flex-1 flex-col px-6 pb-4 pt-3">
        <div className="flex-none border-y-[3px] border-double border-zinc-900 py-2 text-center">
          <h1
            className="m-0 text-[32px] font-black tracking-tight text-zinc-900 sm:text-[38px]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            The Daily Readee
          </h1>
        </div>

        <div className="mt-3 flex flex-none items-center justify-between">
          <div className="h-6 w-40 rounded bg-zinc-200" />
          <div className="h-8 w-52 rounded-full bg-zinc-100" />
        </div>

        <div className="mt-3 grid flex-none grid-cols-7 gap-2 text-center">
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {d}
            </div>
          ))}
        </div>

        <div
          className="grid min-h-0 flex-1 animate-pulse grid-cols-7 gap-2 pb-1"
          style={{ gridAutoRows: "minmax(0, 1fr)" }}
        >
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-full rounded-xl bg-zinc-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
