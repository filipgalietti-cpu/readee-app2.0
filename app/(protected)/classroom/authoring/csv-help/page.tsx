import Link from "next/link";
import { ArrowLeft, Download, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV import — Readee for Teachers",
};

export default function CsvHelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/classroom/authoring"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Authoring
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          <FileText className="h-4 w-4" />
          CSV import tutorial
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Import a quiz from a spreadsheet
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-slate-400">
          Already have your questions in Excel, Google Sheets, or another
          quiz tool? Save as CSV and upload them all at once. About 30
          seconds for 50 questions.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <a
          href="/api/classroom/csv-template"
          download
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <Download className="h-4 w-4" />
          Download the template
        </a>
        <Link
          href="/classroom/authoring"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-bold text-zinc-700 transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <Upload className="h-4 w-4" />
          Pick a quiz to import into
        </Link>
      </div>

      <Section title="The CSV format">
        <p>
          One row per question. The first row must be the header.
          Required columns: <code>kind</code>, <code>prompt</code>,
          <code> correct</code>. Optional: <code>choices</code>,
          <code> hint</code>, <code>image_url</code>,
          <code> audio_url</code>.
        </p>
        <ColumnTable />
      </Section>

      <Section title="Three question types">
        <Example
          title="Multiple choice"
          rows={[
            ["kind", "multiple_choice"],
            ["prompt", "Max ran to the park. He played fetch with a red ball.\\n\\nWhat did Max PLAY with?"],
            ["choices", "A stick|A toy car|A red ball|A bone"],
            ["correct", "A red ball"],
            ["hint", "Look at the second sentence."],
          ]}
          note="Pipe-separate the choices (no commas — pipes). The correct field must match one of the choices exactly, character-for-character."
        />
        <Example
          title="True / false"
          rows={[
            ["kind", "true_false"],
            ["prompt", "Max ran to the park."],
            ["correct", "True"],
            ["hint", "Re-read the first sentence."],
          ]}
          note={'choices column is ignored — Readee always shows "True" and "False".'}
        />
        <Example
          title="Fill in the blank"
          rows={[
            ["kind", "fill_in_blank"],
            ["prompt", "Max played _____ in the park."],
            ["correct", "fetch|catch"],
            ["hint", "What game do dogs love?"],
          ]}
          note='Pipe-separate accepted answers. Readee accepts any case-insensitive match — "Fetch" and "FETCH" both work.'
        />
      </Section>

      <Section title="Common mistakes">
        <Mistake
          title="Choices separated by commas"
          fix='Use pipes (|), not commas. Commas are reserved for the CSV format itself. Right: "Apple|Pear|Banana". Wrong: "Apple, Pear, Banana".'
        />
        <Mistake
          title={`"Correct" doesn't match a choice`}
          fix={`The "correct" field must be the exact choice text. Watch for trailing spaces, smart quotes, or capitalization mismatches.`}
        />
        <Mistake
          title="Multi-line prompts not quoted"
          fix={`If a prompt has line breaks, wrap the whole prompt in double quotes in the CSV. Excel does this automatically when you paste multi-line text into one cell.`}
        />
        <Mistake
          title="Saved as Excel (.xlsx)"
          fix={`Use File → Save As → "CSV UTF-8" (or "CSV (Comma delimited)"). The .xlsx format won't upload — only .csv.`}
        />
        <Mistake
          title="More than 100 questions in one file"
          fix="Cap is 100 questions per upload. Split into batches and run multiple imports — they'll all attach to the same quiz."
        />
      </Section>

      <Section title="Editing tips">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-zinc-700 dark:text-slate-300">
          <li>
            <strong>Google Sheets:</strong> File → Download → Comma Separated Values (.csv).
          </li>
          <li>
            <strong>Excel:</strong> File → Save As → CSV UTF-8 (Comma delimited)(*.csv).
          </li>
          <li>
            <strong>Numbers (Mac):</strong> File → Export To → CSV…
          </li>
          <li>
            Save without a BOM if you can. Readee handles BOMs but other tools may not.
          </li>
          <li>
            Image and audio URLs must be public (no auth required). Supabase
            Storage public URLs work.
          </li>
        </ul>
      </Section>

      <Section title="What happens after upload">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-zinc-700 dark:text-slate-300">
          <li>
            Each row is validated. Valid rows are added to your quiz in
            order, after any existing questions.
          </li>
          <li>
            Invalid rows are skipped — you&apos;ll see a list of which
            rows failed and why.
          </li>
          <li>
            Imported questions are full editable: tap any question to
            tweak prompt, choices, hint, image, or audio.
          </li>
          <li>
            You can re-upload more questions to the same quiz; they get
            appended at the end.
          </li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

function ColumnTable() {
  const cols: { name: string; req: boolean; desc: string }[] = [
    { name: "kind", req: true, desc: "multiple_choice, true_false, or fill_in_blank" },
    { name: "prompt", req: true, desc: "The question text. Up to 2,000 characters." },
    { name: "choices", req: false, desc: "MCQ only. Pipe-separated (Apple|Pear|Banana)." },
    {
      name: "correct",
      req: true,
      desc: "MCQ: exact choice text. T/F: True or False. Fill-in: pipe-separated accepted answers.",
    },
    { name: "hint", req: false, desc: "Shown after a wrong answer." },
    {
      name: "image_url",
      req: false,
      desc: "Public URL to an illustration (PNG/JPG/WebP).",
    },
    {
      name: "audio_url",
      req: false,
      desc: "Public URL to an MP3/WAV that reads the prompt aloud.",
    },
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-slate-700">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50 text-left dark:bg-slate-950">
          <tr>
            <th className="px-3 py-2 font-bold text-zinc-700 dark:text-slate-300">Column</th>
            <th className="px-3 py-2 font-bold text-zinc-700 dark:text-slate-300">Required</th>
            <th className="px-3 py-2 font-bold text-zinc-700 dark:text-slate-300">What it does</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900">
          {cols.map((c) => (
            <tr key={c.name} className="border-t border-zinc-100 dark:border-slate-800">
              <td className="px-3 py-2 font-mono text-xs">{c.name}</td>
              <td className="px-3 py-2">
                {c.req ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Optional
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-zinc-600 dark:text-slate-400">{c.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Example({
  title,
  rows,
  note,
}: {
  title: string;
  rows: [string, string][];
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
        <div className="font-bold text-zinc-900 dark:text-white">{title}</div>
      </div>
      <table className="mt-2 min-w-full text-xs">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="align-top">
              <td className="w-32 py-0.5 pr-3 font-mono font-semibold text-zinc-500 dark:text-slate-400">
                {k}
              </td>
              <td className="py-0.5 font-mono text-zinc-800 dark:text-slate-200">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-zinc-500 dark:text-slate-400">{note}</p>
    </div>
  );
}

function Mistake({ title, fix }: { title: string; fix: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
        <div className="font-bold text-zinc-900 dark:text-white">{title}</div>
      </div>
      <p className="mt-1 text-xs text-zinc-700 dark:text-slate-300">{fix}</p>
    </div>
  );
}
