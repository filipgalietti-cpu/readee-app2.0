import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, BookOpen } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import TodayQuestionPlayer from "@/app/today/[slug]/_components/TodayQuestionPlayer";
import ReadAloudButton from "@/app/today/[slug]/_components/ReadAloudButton";
import RecordCommunityRead from "@/app/_components/RecordCommunityRead";

export const dynamic = "force-dynamic";

export default async function CommunityPassagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;

  const admin = supabaseAdmin();
  const { data: row } = await admin
    .from("community_passages")
    .select(
      "id, slug, title, passage_text, questions, image_url, audio_url, grade_level, topic, phonics_pattern, status, view_count, play_count, display_byline, display_avatar, source_kind",
    )
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  if (!row) notFound();
  const passage = row as any;


  const wordCount = ((passage.passage_text as string) ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 120));

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 pb-16 sm:px-6">
      {passage.slug && <RecordCommunityRead slug={passage.slug} />}
      <Link
        href="/practice-hub/community"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Community library
      </Link>

      {/* Daily Readee layout: image + passage LEFT, quiz sticky RIGHT. */}
      <div className="mt-6 grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {passage.display_avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={passage.display_avatar}
                alt=""
                className="h-7 w-7 flex-none rounded-full object-cover shadow-sm ring-2 ring-white"
              />
            ) : (
              <Users className="h-4 w-4 text-violet-600" />
            )}
            <span className="text-sm font-bold text-zinc-700">
              {passage.display_byline
                ? `${passage.source_kind === "kid_story" ? "Written by" : "Shared by"} ${passage.display_byline}`
                : "Shared by a Readee family"}
            </span>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-700">
              {passage.grade_level}
            </span>
            {passage.phonics_pattern && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                {passage.phonics_pattern}
              </span>
            )}
          </div>

          <h1 className="mt-2 font-display text-[34px] font-extrabold leading-[1.1] tracking-tight text-zinc-900 sm:text-[38px]">
            {passage.title}
          </h1>

          {passage.image_url && (
            <div className="mt-5 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={passage.image_url}
                alt=""
                className="max-h-[460px] w-auto max-w-full rounded-3xl border border-zinc-200 object-contain shadow-sm"
              />
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {wordCount} words · {readMinutes} min read
            </span>
            {passage.audio_url && <ReadAloudButton audioUrl={passage.audio_url} />}
          </div>

          <div
            className="mt-[18px] flex flex-col gap-[18px] whitespace-pre-line text-[19px] leading-[1.75] text-zinc-900"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {passage.passage_text}
          </div>
        </div>

        {/* RIGHT — the quiz, sticky, same player as Daily Readee + Studio */}
        {Array.isArray(passage.questions) && passage.questions.length > 0 && (
          <div className="lg:sticky lg:top-6">
            <TodayQuestionPlayer questions={passage.questions} />
          </div>
        )}
      </div>
    </div>
  );
}
