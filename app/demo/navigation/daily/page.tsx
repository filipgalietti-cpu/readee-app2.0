import DailyView from "@/app/(protected)/daily/_components/DailyView";

const entries = Array.from({ length: 120 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 8, 11 - i)).toISOString().slice(0, 10);
  return { date, slug: `qa-daily-${date}`, theme: "Nature", passage_title: `Reading for ${date}`, image_url: null };
});
export default function DailyPreview() {
  return <DailyView entries={entries} todayDate="2026-09-11" completedDates={["2026-09-10"]} />;
}
