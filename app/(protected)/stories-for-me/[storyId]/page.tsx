import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Sparkles, BookOpenText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StoryReader from "./_components/StoryReader";

export const dynamic = "force-dynamic";

export default async function PersonalizedStoryPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: story } = await supabase
    .from("personalized_stories")
    .select(
      "id, child_id, title, cover_image_url, pages, reading_level, qc_overall, parent_id",
    )
    .eq("id", storyId)
    .maybeSingle();
  if (!story) notFound();
  const s = story as any;
  if (s.parent_id !== user.id) notFound();

  const { data: child } = await supabase
    .from("children")
    .select("first_name")
    .eq("id", s.child_id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/stories-for-me"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All my stories
      </Link>
      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
          <Sparkles className="h-4 w-4" />
          A story for{" "}
          {(child as any)?.first_name ?? "your kid"}
        </div>
        <h1
          className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white"
          style={{
            fontFamily:
              'Andika, "Comic Sans MS", "Trebuchet MS", system-ui, sans-serif',
          }}
        >
          {s.title}
        </h1>
      </div>
      <div className="mt-6">
        <StoryReader
          pages={(s.pages ?? []) as any[]}
          title={s.title}
        />
      </div>
    </div>
  );
}
