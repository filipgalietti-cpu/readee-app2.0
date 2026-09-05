import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import DailyReader, { type DailyRendition } from "./_components/DailyReader";
import AssignDailyButton from "./_components/AssignDailyButton";
import { Glyph } from "@/app/_components/Glyph";

// Static daily content — half-hour revalidate. (No `force-dynamic`: it
// overrode this and re-queried the DB on every navigation, which is what
// made switching pages laggy.)
export const revalidate = 1800;

type RawQ = { prompt: string; choices: string[]; correct: string; hint?: string | null };

type EasyVariant = {
  passage_title: string;
  passage_body: string;
  audio_url: string | null;
  question_prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
  extra_questions: RawQ[] | null;
};

type Daily = {
  date: string;
  theme: string;
  slug: string;
  passage_title: string;
  passage_body: string;
  image_url: string | null;
  image_attribution: string | null;
  audio_url: string | null;
  question_prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
  extra_questions: any;
  easy_variant: EasyVariant | null;
};

// One fetch per request — React cache() dedupes the generateMetadata read
// and the page read (previously two separate DB round-trips every load).
const getDaily = cache(async (slug: string): Promise<Daily | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_questions")
    .select(
      "date, theme, slug, passage_title, passage_body, image_url, image_attribution, audio_url, question_prompt, choices, correct, hint, extra_questions, easy_variant",
    )
    .eq("slug", slug)
    .maybeSingle();
  return (data as Daily) ?? null;
});

/** The published dailies either side of this date, for the arrow keys.
 *  Two tiny indexed reads; only live rows so the archive never walks into a
 *  draft or a QC-failed day. */
const getNeighbours = cache(async (date: string): Promise<{ prev: string | null; next: string | null }> => {
  const supabase = await createClient();
  const [older, newer] = await Promise.all([
    supabase.from("daily_questions").select("slug").lt("date", date)
      .eq("published_state", "live").order("date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("daily_questions").select("slug").gt("date", date)
      .eq("published_state", "live").order("date", { ascending: true }).limit(1).maybeSingle(),
  ]);
  return {
    prev: ((older.data as { slug?: string } | null)?.slug) ?? null,
    next: ((newer.data as { slug?: string } | null)?.slug) ?? null,
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getDaily(slug);
  if (!d) return { title: "Today's Readee" };
  const desc = d.passage_body.slice(0, 150);
  return {
    title: `${d.passage_title} - Readee Daily`,
    description: desc,
    openGraph: {
      title: `${d.passage_title} - Readee Daily`,
      description: desc,
      images: d.image_url ? [d.image_url] : [],
      type: "article",
    },
  };
}

// Reading levels / grades that default to the K-1 "Short read".
// children.reading_level is placement-owned and holds either an
// assessment band name or a grade key; grade is the fallback when
// placement hasn't run yet.
const EARLY_READING_LEVELS = new Set([
  "Emerging Reader",
  "Beginning Reader",
  "kindergarten",
  "K",
  "1st",
]);
const EARLY_GRADES = new Set(["Pre-K", "kindergarten", "K", "1st"]);

export default async function TodayDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getDaily(slug);
  const neighbours = d ? await getNeighbours(d.date) : { prev: null, next: null };
  if (!d) notFound();
  const extras = Array.isArray(d.extra_questions) ? d.extra_questions : [];
  // Daily Readee is a signed-in feature — send logged-out visitors to sign
  // up (turns shared-link traffic into signups rather than free reads).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const toQ = (q: RawQ) => ({
    prompt: q.prompt,
    choices: q.choices,
    correct: q.correct,
    hint: q.hint ?? null,
  });

  const full: DailyRendition = {
    title: d.passage_title,
    body: d.passage_body,
    audioUrl: d.audio_url,
    questions: [
      { prompt: d.question_prompt, choices: d.choices, correct: d.correct, hint: d.hint },
      ...extras.map(toQ),
    ],
  };

  const ev = d.easy_variant;
  const easy: DailyRendition | null =
    ev && ev.passage_body && ev.question_prompt
      ? {
          title: ev.passage_title || d.passage_title,
          body: ev.passage_body,
          audioUrl: ev.audio_url ?? null,
          questions: [
            { prompt: ev.question_prompt, choices: ev.choices, correct: ev.correct, hint: ev.hint ?? null },
            ...(Array.isArray(ev.extra_questions) ? ev.extra_questions.map(toQ) : []),
          ],
        }
      : null;

  // Default level: a child placed at K or 1st grade starts on the short
  // read; everyone else (and families without a reading level yet whose
  // child is in 2nd grade or above) starts on the full read. The toggle
  // always lets them switch. (B2C: the parent's first child.)
  // One child read, used for BOTH the default reading level and the outfit the
  // celebration bunny wears. It used to sit inside `if (easy)`, so on any daily
  // without an easy rendition we never looked the child up at all - and the
  // post-quiz bunny was hardcoded to "classic", which is not even a real outfit
  // id (the only one is "bunny_classic"), so it silently fell back for
  // everybody regardless. A child who bought an outfit never saw it here.
  let defaultLevel: "easy" | "full" = "full";
  let outfitId = "bunny_classic";
  const { data: kid } = await supabase
    .from("children")
    .select("reading_level, grade, equipped_items")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (kid) {
    outfitId =
      ((kid as { equipped_items?: { outfit?: string } | null }).equipped_items?.outfit) ||
      "bunny_classic";
    if (easy) {
      const readingLevel = (kid as { reading_level: string | null }).reading_level ?? null;
      const grade = (kid as { grade: string | null }).grade ?? null;
      if (readingLevel ? EARLY_READING_LEVELS.has(readingLevel) : grade ? EARLY_GRADES.has(grade) : false) {
        defaultLevel = "easy";
      }
    }
  }

  const dateLabel = new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-6 py-3">
          <Link
            href="/daily"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-zinc-500 transition hover:text-violet-700"
          >
            <Glyph name="arrow-left" size={16} />
            Back
          </Link>
          <span className="font-display text-lg font-extrabold text-zinc-900">Today&apos;s Readee</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-6 py-8 pb-16">
        <DailyReader
          theme={d.theme}
          dateLabel={dateLabel}
          date={d.date}
          imageUrl={d.image_url}
          imageAttribution={d.image_attribution}
          prevSlug={neighbours.prev}
          nextSlug={neighbours.next}
          full={full}
          easy={easy}
          defaultLevel={defaultLevel}
          outfitId={outfitId}
        />

        {/* Teacher CTA — only renders when authed as a teacher with a classroom. */}
        <div className="mt-10 flex justify-center">
          <AssignDailyButton date={d.date} />
        </div>

      </div>
    </article>
  );
}
