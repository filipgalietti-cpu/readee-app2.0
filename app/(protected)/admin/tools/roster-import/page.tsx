import { FileSpreadsheet } from "lucide-react";
import { requireTeacherTier } from "@/lib/plan/teacher-gate";
import RosterImporter from "./_components/RosterImporter";

export const dynamic = "force-dynamic";

export default async function RosterImportPage() {
  // School/district admin tool — saves 30 min/school onboarding cost.
  await requireTeacherTier({ min: "school", reason: "roster_import" });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
        <FileSpreadsheet className="h-4 w-4" />
        Roster importer
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Paste any roster — Readee makes sense of it
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Drop in a CSV, a comma-separated list, a tabbed spreadsheet
        export, anything. Readee figures out the columns and gives you
        a clean table to review before importing.
      </p>
      <div className="mt-6">
        <RosterImporter />
      </div>
    </div>
  );
}
