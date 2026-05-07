"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, BookOpen, Wand2, Users, Calendar } from "lucide-react";
import { loadKidUnlocks, type KidUnlock } from "@/lib/dashboard/kid-unlocks";

const KIND_META: Record<
  KidUnlock["kind"],
  { label: string; tone: string; Icon: any }
> = {
  ask_readee: {
    label: "Made for you",
    tone: "from-violet-500 to-indigo-600",
    Icon: Wand2,
  },
  personalized_story: {
    label: "Your story",
    tone: "from-amber-400 to-orange-500",
    Icon: BookOpen,
  },
  community_passage: {
    label: "Community pick",
    tone: "from-emerald-500 to-teal-600",
    Icon: Users,
  },
  daily_question: {
    label: "Today's read",
    tone: "from-indigo-500 to-violet-600",
    Icon: Calendar,
  },
};

/**
 * "Fresh for you" — surfaces newly created AI content for the kid.
 * Renders nothing if there are no unlocks, per the design rule that
 * empty sections should hide entirely (no dashed-grey empty state).
 */
export default function FreshForYou({
  childId,
  parentId,
  gradeLevel,
}: {
  childId: string;
  parentId: string;
  gradeLevel: string | null;
}) {
  const [items, setItems] = useState<KidUnlock[] | null>(null);

  useEffect(() => {
    let cancel = false;
    loadKidUnlocks({ childId, parentId, gradeLevel })
      .then((rows) => {
        if (!cancel) setItems(rows);
      })
      .catch(() => {
        if (!cancel) setItems([]);
      });
    return () => {
      cancel = true;
    };
  }, [childId, parentId, gradeLevel]);

  // Hide entirely while loading + when empty (no dashed grey box).
  if (items === null || items.length === 0) return null;

  return (
    <section className="mt-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-600" />
        <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Fresh for you
        </h2>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-700">
          {items.length} new
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
        New reads since you last visited.
      </p>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {items.map((item) => {
          const meta = KIND_META[item.kind];
          const Icon = meta.Icon;
          return (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className="group relative flex-shrink-0 w-44 overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900"
            >
              <div className="relative h-24 w-full overflow-hidden bg-zinc-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${meta.tone} text-white`}
                  >
                    <Icon className="h-8 w-8 opacity-90" />
                  </div>
                )}
                <span
                  className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-800 shadow-sm`}
                >
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </span>
              </div>
              <div className="px-3 py-2.5">
                <h3 className="line-clamp-2 text-xs font-bold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                {item.topicOrSubtitle && (
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-zinc-500 dark:text-slate-400">
                    {item.topicOrSubtitle}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
