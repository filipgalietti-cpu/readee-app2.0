import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, ChevronRight } from "lucide-react";
import { getAllStandards, slugifyStandard, domainFriendlyName } from "@/lib/data/standards";

export const dynamic = "force-static";
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Common Core ELA reading practice — K-4 standards | Readee",
  description:
    "Every Common Core ELA reading comprehension standard for Kindergarten through 4th grade, with free practice questions. Reading Literature, Informational Text, Foundational Skills, and Language.",
  alternates: { canonical: "https://learn.readee.app/standards" },
  openGraph: {
    title: "Common Core ELA reading practice — K-4 standards | Readee",
    description:
      "All Common Core ELA reading comprehension standards for K-4 with free sample questions at Readee.",
    url: "https://learn.readee.app/standards",
    type: "website",
    siteName: "Readee",
  },
};

export default async function StandardsIndexPage() {
  const all = getAllStandards();
  const byGrade = new Map<string, typeof all>();
  for (const s of all) {
    const arr = byGrade.get(s.gradeLabel) ?? [];
    arr.push(s);
    byGrade.set(s.gradeLabel, arr);
  }
  const GRADE_ORDER = ["Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade"];

  const totalQuestions = all.reduce((s, st) => s + st.questions.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          <BookOpen className="h-4 w-4" />
          Common Core ELA · K-4
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          Every K-4 reading standard. Every practice question.
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-slate-400">
          {all.length} Common Core ELA reading comprehension standards across
          Kindergarten through 4th grade, with {totalQuestions}+ practice
          questions. Tap any standard for free sample questions and plain-English
          explanations for families.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {GRADE_ORDER.map((grade) => {
          const list = byGrade.get(grade);
          if (!list || list.length === 0) return null;
          const byDomain = new Map<string, typeof list>();
          for (const s of list) {
            const dom = domainFriendlyName(s.domain);
            const arr = byDomain.get(dom) ?? [];
            arr.push(s);
            byDomain.set(dom, arr);
          }
          return (
            <section key={grade}>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{grade}</h2>
              <div className="mt-3 space-y-4">
                {Array.from(byDomain.entries()).map(([dom, standards]) => (
                  <div key={dom}>
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
                      {dom}
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {standards.map((s) => (
                        <li key={s.standard_id}>
                          <Link
                            href={`/standards/${slugifyStandard(s.standard_id)}`}
                            className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
                          >
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-mono text-[11px] font-extrabold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                              {s.standard_id.split(".").slice(-1)[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                {s.standard_id}
                              </div>
                              <div className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-slate-400">
                                {s.standard_description}
                              </div>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-zinc-400" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
