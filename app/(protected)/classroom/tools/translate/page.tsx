import { Languages, Info } from "lucide-react";
import { requireTeacherTier } from "@/lib/plan/teacher-gate";
import TranslatePlayground from "./_components/TranslatePlayground";

export const dynamic = "force-dynamic";

export default async function TranslateToolPage() {
  await requireTeacherTier({ min: "premium", reason: "translate" });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-fuchsia-600">
        <Languages className="h-4 w-4" />
        Translate
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Translate any passage
        </h1>
        <details className="group">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-500 transition hover:border-fuchsia-300 hover:text-fuchsia-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 [&::-webkit-details-marker]:hidden">
            <Info className="h-3 w-3" />
            How it works
          </summary>
          <p className="mt-2 max-w-2xl rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-zinc-700 dark:border-fuchsia-900/40 dark:bg-fuchsia-950/30 dark:text-slate-300">
            Sandbox for one-off translations. The real win is automatic,
            set a student&apos;s home language on their profile and Readee
            translates parent letters, weekly digests, and in-reader
            passages for that family without a copy-paste.
          </p>
        </details>
      </div>
      <div className="mt-6">
        <TranslatePlayground />
      </div>
      <div className="mt-8 rounded-3xl border border-fuchsia-200 bg-fuchsia-50 p-5 text-sm dark:border-fuchsia-900/40 dark:bg-fuchsia-950/30">
        <div className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-700 dark:text-fuchsia-300">
          Multilingual Family Mode
        </div>
        <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
          Set <span className="rounded bg-white px-1.5 dark:bg-slate-900">Home language</span> on a student&apos;s profile and the rest is automatic.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-700 dark:text-slate-300">
          <li>
            Student opens an assignment, taps &quot;Show in [Spanish]&quot;,
            sees passage side-by-side without leaving the reader.
          </li>
          <li>
            Parent letters and weekly digests auto-translate per recipient,
            one click sends 28 families their L1.
          </li>
          <li>
            Translations cached, the second family with the same L1 gets
            it free and instantly.
          </li>
        </ul>
      </div>
    </div>
  );
}
