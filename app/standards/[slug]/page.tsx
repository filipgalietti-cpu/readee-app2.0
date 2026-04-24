import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Sparkles, BookOpen, GraduationCap, ListChecks } from "lucide-react";
import type { Metadata } from "next";
import {
  getAllStandards,
  getStandardBySlug,
  slugifyStandard,
  domainFriendlyName,
} from "@/lib/data/standards";

export const dynamic = "force-static";
export const revalidate = 86400; // rebuild once a day if content changes

export async function generateStaticParams() {
  return getAllStandards().map((s) => ({ slug: slugifyStandard(s.standard_id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const standard = getStandardBySlug(slug);
  if (!standard) {
    return {
      title: "Standard not found — Readee",
    };
  }
  const domain = domainFriendlyName(standard.domain);
  const title = `${standard.standard_id} — ${standard.gradeLabel} ${domain} practice | Readee`;
  const description = `${standard.standard_description}. Practice ${standard.standard_id} with Readee — free sample questions, audio read-alouds, and full Common Core ELA coverage for ${standard.gradeLabel}.`;
  const canonical = `https://learn.readee.app/standards/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "Readee",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function StandardLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const standard = getStandardBySlug(slug);
  if (!standard) notFound();

  const sampleQuestions = standard.questions.slice(0, 3);
  const totalQs = standard.questions.length;
  const remaining = Math.max(0, totalQs - sampleQuestions.length);
  const domain = domainFriendlyName(standard.domain);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `${standard.standard_id} — ${standard.gradeLabel} ${domain}`,
    description: standard.standard_description,
    educationalLevel: standard.gradeLabel,
    educationalAlignment: {
      "@type": "AlignmentObject",
      alignmentType: "teaches",
      educationalFramework: "Common Core State Standards",
      targetName: standard.standard_id,
    },
    learningResourceType: "Practice questions",
    about: domain,
    url: `https://learn.readee.app/standards/${slug}`,
    provider: {
      "@type": "Organization",
      name: "Readee",
      url: "https://readee.app",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/standards"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          All standards
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          <BookOpen className="h-4 w-4" />
          <span>{domain}</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            {standard.gradeLabel}
          </span>
        </div>

        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {standard.standard_id}
        </h1>
        <p className="mt-2 text-lg leading-relaxed text-zinc-700 dark:text-slate-300">
          {standard.standard_description}
        </p>

        {standard.parent_tip && (
          <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 text-sm text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-200">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
              For parents
            </div>
            {standard.parent_tip}
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            <ListChecks className="h-4 w-4 text-violet-500" />
            Free sample questions
          </div>
          <ol className="mt-3 space-y-4">
            {sampleQuestions.map((q, i) => (
              <li
                key={q.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-900/40"
              >
                {q.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={q.image_url}
                    alt=""
                    className="mb-3 max-h-48 w-full rounded-xl object-contain"
                  />
                )}
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  Question {i + 1}
                </div>
                <div className="mt-1 whitespace-pre-line font-semibold text-zinc-900 dark:text-white">
                  {q.prompt}
                </div>
                {Array.isArray(q.choices) && (
                  <ul className="mt-3 space-y-1 text-xs">
                    {q.choices.map((c) => {
                      const isCorrect =
                        c ===
                        (Array.isArray(q.correct)
                          ? q.correct[0]
                          : (q.correct as string));
                      return (
                        <li
                          key={c}
                          className={
                            isCorrect
                              ? "inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2 py-1 font-semibold text-green-800 dark:bg-green-950/30 dark:text-green-300"
                              : "inline-flex px-2 py-1 text-zinc-600 dark:text-slate-400"
                          }
                        >
                          {isCorrect && <Check className="h-3 w-3" />}
                          {c}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 text-center shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-violet-950/20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-zinc-900 dark:text-white">
            {remaining > 0
              ? `Unlock ${remaining} more questions for ${standard.standard_id}`
              : `Unlock the full Readee library`}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-slate-400">
            Readee covers all {"911"}+ K-4 reading comprehension
            questions aligned to Common Core ELA, with audio read-alouds,
            comprehension hints, and Science-of-Reading lesson
            walkthroughs.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <GraduationCap className="h-4 w-4" />
              Start free — no credit card
            </Link>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-bold text-zinc-700 transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              See all plans
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
