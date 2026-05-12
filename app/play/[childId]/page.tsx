import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowRight, BookOpen, BookText, Brain, Compass, Library as LibraryIcon, Trophy, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import {
  encodePlayCookie,
  PLAY_COOKIE_NAME,
  PLAY_COOKIE_MAX_AGE_SECONDS,
  decodePlayCookie,
} from "@/lib/auth/play-mode";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";

export const dynamic = "force-dynamic";

/**
 * Kid play home — locked surface. Once this page loads, the device is
 * in play-mode (cookie set), and the proxy blocks all adult routes
 * until the parent exits via /api/play/exit (PIN or password).
 *
 * Inside play-mode, the kid can still navigate to /journey, /stories,
 * /practice-hub, /shop, /leaderboard — those are kid-friendly. The
 * exit button at the top is the only way back to teacher/parent UI.
 */
export default async function PlayHomePage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const profile = await requireProfile();

  const supabase = await createClient();
  const { data: childRow } = await supabase
    .from("children")
    .select("id, first_name, reading_level, parent_id, owner_type")
    .eq("id", childId)
    .maybeSingle();
  if (!childRow) notFound();
  const child = childRow as any;

  // Authorization: only the kid's parent (or a teacher of their
  // classroom) can launch them into play. We don't need teacher
  // launch yet — for now, parent only.
  if (child.parent_id !== profile.id) {
    notFound();
  }

  // Set the play-cookie on every visit (refreshes the 30-day TTL).
  const cookieStore = await cookies();
  const existing = cookieStore.get(PLAY_COOKIE_NAME)?.value;
  const decoded = decodePlayCookie(existing);
  const needsSet = !decoded || decoded.childId !== childId || decoded.parentId !== profile.id;
  if (needsSet) {
    cookieStore.set({
      name: PLAY_COOKIE_NAME,
      value: encodePlayCookie({
        parentId: profile.id,
        childId,
        iat: Date.now(),
      }),
      path: "/",
      sameSite: "lax",
      httpOnly: false, // client may need to read for "exit" UI hints
      maxAge: PLAY_COOKIE_MAX_AGE_SECONDS,
    });
  }

  const childAvatar = getChildAvatarImage(child, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/30">
      {/* Locked top bar — only exit is via the grown-up button */}
      <div className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            {childAvatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={childAvatar}
                alt={child.first_name}
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-slate-700"
              />
            )}
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              {child.first_name}&apos;s reading time
            </span>
          </div>
          <Link
            href={`/play/${childId}/exit`}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-600 transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <LogOut className="h-3 w-3" />
            Grown-up exit
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          Hi {child.first_name}!
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-slate-400">
          Pick what you want to do today.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PlayCard
            href={`/review?child=${childId}`}
            title="Today's review"
            subtitle="What Readee thinks you're ready for"
            icon={<Brain className="h-5 w-5" />}
            color="indigo"
          />
          <PlayCard
            href={`/journey?child=${childId}`}
            title="Reading Journey"
            subtitle="Your progress through every grade"
            icon={<BookOpen className="h-5 w-5" />}
            color="violet"
          />
          <PlayCard
            href={`/discover`}
            title="Discover"
            subtitle="Brand-new fact-checked stories"
            icon={<Compass className="h-5 w-5" />}
            color="rose"
          />
          <PlayCard
            href={`/stories`}
            title="Story library"
            subtitle="Read-along stories with audio"
            icon={<LibraryIcon className="h-5 w-5" />}
            color="emerald"
          />
          <PlayCard
            href={`/word-bank`}
            title="Word Bank"
            subtitle="Tap a word, hear it, learn it"
            icon={<BookText className="h-5 w-5" />}
            color="sky"
          />
          <PlayCard
            href={`/leaderboard?child=${childId}`}
            title="Leaderboard"
            subtitle="See how you stack up"
            icon={<Trophy className="h-5 w-5" />}
            color="amber"
          />
        </div>

        <p className="mt-8 text-center text-[11px] text-zinc-400 dark:text-slate-500">
          Ready to take a break?{" "}
          <Link
            href={`/play/${childId}/exit`}
            className="font-semibold text-indigo-600 underline hover:text-indigo-700 dark:text-indigo-300"
          >
            Hand the device back to a grown-up
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function PlayCard({
  href,
  title,
  subtitle,
  icon,
  color,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "indigo" | "violet" | "emerald" | "amber" | "rose" | "sky";
}) {
  const ringByColor: Record<string, string> = {
    indigo: "from-indigo-500 to-indigo-600",
    violet: "from-violet-500 to-violet-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-pink-600",
    sky: "from-sky-500 to-cyan-600",
  };
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
    >
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${ringByColor[color]} text-white shadow-sm`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-zinc-900 dark:text-white">{title}</div>
        <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">{subtitle}</div>
      </div>
      <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
    </Link>
  );
}
