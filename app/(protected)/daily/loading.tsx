import DailyView from "./_components/DailyView";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Loading() {
  return <DailyView><div role="status" aria-label="Loading daily readings" className="flex flex-1 flex-col">
    <span className="sr-only">Loading daily readings</span>
        <div className="mt-3 flex flex-none flex-wrap items-center justify-between gap-3">
          <div className="h-6 w-40 rounded bg-zinc-200" />
          <div className="h-11 w-full sm:w-52 rounded-full bg-zinc-100" />
        </div>

        <div className="mt-3 grid flex-none grid-cols-7 gap-1 sm:gap-2 text-center">
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {d}
            </div>
          ))}
        </div>

        <div
          className="grid min-h-[360px] flex-1 grid-cols-7 gap-1 sm:gap-2 pb-1"
          style={{ gridAutoRows: "minmax(0, 1fr)" }}
        >
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-full rounded-xl bg-zinc-100" />
          ))}
        </div>
  </div></DailyView>;
}
