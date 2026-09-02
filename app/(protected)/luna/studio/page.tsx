import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { hasFullAccessFromProfile } from "@/lib/plan/access";
import { FREE_LIMITS } from "@/lib/plan/limits";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import StoryStudio from "./_components/StoryStudio";
import { EmptyState } from "@/app/_components/EmptyState";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { Glyph } from "@/app/_components/Glyph";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata = {
  title: "Luna Story Studio - Readee",
  description: "Write your own story with Luna and share it with other children.",
};

export default async function StoryStudioPage() {
  const profile = await requireProfile();

  const supabase = await createClient();
  const { data: childrenRows } = await supabase
    .from("children")
    .select("id, first_name, grade, reading_level, carrots, equipped_items")
    .eq("parent_id", profile.id)
    .order("created_at", { ascending: true });
  const child = (childrenRows ?? [])[0] as
    | { id: string; first_name: string; grade: string | null; carrots?: number | null; equipped_items?: any }
    | undefined;

  if (!child) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/luna"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-violet-700"
        >
          <Glyph name="arrow-left" size={16} />
          Luna
        </Link>
        <div className="mt-8">
          <EmptyState
            mascot="wave-clipboard"
            size="lg"
            title="Add a child first"
            description="Story Studio writes at your child's reading level. Add a child on the dashboard to get started."
            action={{ href: "/dashboard", label: "Go to dashboard" }}
          />
        </div>
      </div>
    );
  }

  // Trial-aware: a reader inside the reverse trial passes too.
  const isPremium = hasFullAccessFromProfile(profile);

  // Free taste: FREE_LIMITS.personalizedStoriesFree Story Studio creations,
  // then the Readee+ wall. Same counter /api/luna/story enforces server-side
  // (child_ai_content rows with kind "luna_story"), so page and server agree.
  if (!isPremium) {
    const { count } = await supabase
      .from("child_ai_content")
      .select("id", { count: "exact", head: true })
      .eq("child_id", child.id)
      .eq("kind", "luna_story");
    if ((count ?? 0) >= FREE_LIMITS.personalizedStoriesFree) {
      return (
        <div className="mx-auto max-w-2xl px-6 py-10">
          <Link
            href="/luna"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-violet-700"
          >
            <Glyph name="arrow-left" size={16} />
            Luna
          </Link>
          <div className="mt-8 rounded-3xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-12 text-center shadow-sm ring-1 ring-violet-100">
            <FluentIcon name="lock" size={40} />
            <h1 className="mt-4 text-xl font-extrabold text-zinc-900">
              {child.first_name} used all {FREE_LIMITS.personalizedStoriesFree} free stories
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Readee+ unlocks unlimited stories with Luna, and lets {child.first_name} share
              their creations with other children.
            </p>
            <Link
              href="/upgrade?reason=luna"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              See Readee+
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <StoryStudio
      childId={child.id}
      childName={child.first_name}
      avatarSrc={getChildAvatarImage(child as any, 0)}
      carrots={(child as any).carrots ?? 0}
    />
  );
}
