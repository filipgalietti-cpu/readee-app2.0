import Link from "next/link";
import Image from "next/image";
import { previewLessons } from "@/lib/lessons/preview-catalog";
import { Glyph } from "@/app/_components/Glyph";
import { UNIT_ONE } from "@/lib/approved-unit/catalogue";
import { unitOneEnabled } from "@/lib/approved-unit/access";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
const covers: Record<string, string> = {
  "rhyme-time": "rhyme-time/opening-matching-rory.webp",
  "key-details": "pips-tree/pip-opening-v3.webp",
};
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const enabled = unitOneEnabled(),
    parent = await requireProfile(),
    { child: selected } = await searchParams,
    db = await createClient();
  let query = db.from("children").select("id").eq("parent_id", parent.id);
  if (selected) query = query.eq("id", selected);
  const { data: reader } = await query.order("created_at").limit(1).maybeSingle();
  const setup = reader ? `/placement/ready?child=${reader.id}` : "/placement/setup";
  const samples = previewLessons.filter((l) => !enabled || l.grade !== "Kindergarten");
  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* ‼️ Filip: "there is no back button btw to go back to the sign up".
            This page hides the sidebar, so it had no nav, no breadcrumb and no
            way out except one link at the very bottom, past both lesson lists.
            Parents arrive here from "Explore first" while setting a reader up,
            and some of them never went back. */}
        <Link
          href={setup}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600"
        >
          <Glyph name="arrow-left" size={18} />
          {reader ? "Back to setup" : "Back to setting up your reader"}
        </Link>
        <div className="flex items-center gap-6">
          <Image
            src="/images/ui/bunny-reading.png"
            alt=""
            width={128}
            height={128}
            className="h-24 w-24 shrink-0 object-contain sm:h-32 sm:w-32"
          />
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
              Take a look around.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-600">
              See the stories, games and reading practice inside Readee. Your child’s assessment
              will help choose their starting point.
            </p>
          </div>
        </div>
        {enabled && (
          <section className="mt-8" aria-labelledby="approved-k-heading">
            <h2 id="approved-k-heading" className="text-2xl font-semibold">
              Meet our Kindergarten adventures
            </h2>
            <p className="mt-2 text-zinc-600">
              Try Pip’s Tree as a complete free sample: warm-up, lesson, practice and Luna. Sample
              carrots and answers stay in this visit; they do not change your child’s progress.
            </p>
            <Link
              href={reader ? `/learn/unit-one/sample?child=${reader.id}` : "/learn/unit-one/sample"}
              className="mt-4 inline-flex rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600"
            >
              Try Pip’s Tree free <Glyph name="arrow-right" size={20} className="ml-2" />
            </Link>
            {/* ‼️ Filip: "we should not give them the entire lesson unit one
                preview for k, make it hidden in the drop down". Eight cards
                opened flat, then four more below them, in front of a parent who
                has not set a reader up yet. The one thing worth acting on is
                the free sample above; the catalogue is reassurance, and
                reassurance folds away. */}
            <details className="group mt-6">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-violet-700">
                <Glyph name="chevron-right" size={18} className="transition-transform group-open:rotate-90" />
                See all {UNIT_ONE.length} Kindergarten lessons
              </summary>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {UNIT_ONE.map((l) => (
                <li
                  key={l.id}
                  className="overflow-hidden rounded-3xl border border-violet-100 bg-white"
                >
                  <Link
                    href={reader ? `/learn/unit-one?child=${reader.id}&lesson=${l.id}` : setup}
                    className="block h-full p-4 focus-visible:outline-2 focus-visible:outline-violet-600"
                  >
                    <Image
                      unoptimized
                      src={`/lesson-studio/${covers[l.id] ?? `${l.id}/opening.webp`}`}
                      width={640}
                      height={400}
                      alt=""
                      className="aspect-[8/5] w-full rounded-xl object-contain"
                    />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-violet-700">
                      Kindergarten · Unit 1
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{l.title}</h3>
                    <p className="mt-2 text-sm text-zinc-600">
                      {reader ? "Open lesson" : "Set up your reader"} →
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-zinc-500">
              Full lessons follow your family’s plan and save progress for your selected reader. The
              unit exam opens after all eight lessons are completed.
            </p>
            </details>
          </section>
        )}
        <section className="mt-10" aria-labelledby="other-samples">
          <h2 id="other-samples" className="text-2xl font-semibold">
            {enabled ? "Explore other grades" : "Try a lesson sample"}
          </h2>
          <details className="group">
            <summary className="mt-4 flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-violet-700">
              <Glyph name="chevron-right" size={18} className="transition-transform group-open:rotate-90" />
              See {samples.length} lessons from other grades
            </summary>
          <div className="mt-4 divide-y divide-violet-100 overflow-hidden rounded-3xl border border-violet-100 bg-white">
            {samples.map((l) => (
              <Link
                key={l.standardId}
                href={`/learn?standard=${encodeURIComponent(l.standardId)}&preview=1`}
                className="flex items-center justify-between gap-4 p-6 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-600"
              >
                <div>
                  <p className="text-sm font-semibold text-violet-700">{l.grade}</p>
                  <h3 className="mt-1 text-xl font-semibold">{l.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">Try this lesson</p>
                </div>
                <Glyph name="arrow-right" size={24} />
              </Link>
            ))}
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            Samples don’t set a reading level or save child progress.
          </p>
          </details>
        </section>
        <section className="mt-8 rounded-3xl bg-violet-50 p-6">
          <h2 className="text-xl font-semibold">Find your child’s starting point</h2>
          <p className="mt-2 text-zinc-600">
            Let Luna check their reading skills, then follow a journey built from their results.
          </p>
          <Link
            href={setup}
            className="mt-4 inline-flex rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white"
          >
            {reader ? "Get ready for the assessment" : "Set up my reader"}
          </Link>
        </section>
      </div>
    </main>
  );
}
