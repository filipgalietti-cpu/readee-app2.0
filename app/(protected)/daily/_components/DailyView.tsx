import DailyArchive from "./DailyArchive";

type Entry = { date: string; slug: string; theme: string; passage_title: string; image_url: string | null };

export default function DailyView({ entries = [], todayDate = "", completedDates = [], children }: {
  entries?: Entry[]; todayDate?: string; completedDates?: string[]; children?: React.ReactNode;
}) {
  return (
    <div data-daily-frame className="fixed inset-x-0 bottom-0 top-[76px] z-10 flex flex-col overflow-y-auto overscroll-contain bg-white lg:left-[272px]">
      <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col px-4 pb-4 pt-3 sm:px-6">
        {/* Newspaper masthead */}
        <div className="flex-none border-y-[3px] border-double border-zinc-900 py-2 text-center">
          <h1
            className="m-0 text-[32px] font-black tracking-tight text-zinc-900 sm:text-[38px]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            The Daily Readee
          </h1>
        </div>

        {children ? children : entries.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
            No dailies published yet. Come back tomorrow morning.
          </div>
        ) : (
          <DailyArchive entries={entries} todayDate={todayDate} completedDates={completedDates} />
        )}
      </div>
    </div>
  );
}
