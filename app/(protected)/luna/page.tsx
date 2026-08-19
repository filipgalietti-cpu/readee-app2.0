import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, MessageCircleHeart, Sparkles, Wand2, ArrowRight } from "lucide-react";
import LunaOrb from "./_components/LunaOrb";

export const dynamic = "force-dynamic";

/**
 * Luna hub — the single home for the AI suite. The orb is Luna's face; the
 * child picks an activity. Everything AI now lives under Luna:
 *   • Read with Luna  → /luna/read   (Azure-graded read-aloud; subsumes the
 *                                     old Fluency Check)
 *   • Ask Luna        → the AI Q&A helper (formerly "Ask Readee")
 *   • Story with Luna → a story starring the child (formerly "Personalized
 *                       Stories")
 * The hub itself is open (free taste) — per-activity gating handles limits.
 */
export default async function LunaHubPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const profile = await requireProfile();
  const { child: childIdParam } = await searchParams;
  const supabase = await createClient();

  let child: { id: string; name: string } | null = null;
  const base = supabase
    .from("children")
    .select("id, first_name, parent_id")
    .eq("parent_id", profile.id);
  const { data } = childIdParam
    ? await base.eq("id", childIdParam).maybeSingle()
    : await base.order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (data) {
    child = {
      id: (data as any).id,
      name: ((data as any).first_name ?? "").split(" ")[0] || "Reader",
    };
  }
  if (!child) redirect("/dashboard");

  const q = `?child=${child.id}`;
  const activities = [
    {
      href: `/luna/read${q}`,
      icon: BookOpen,
      label: "Read with Luna",
      desc: "Read out loud — I listen and help you sound out every word.",
      grad: "linear-gradient(135deg,#4338ca,#7c3aed)",
      glow: "rgba(124,58,237,.28)",
    },
    {
      href: `/dashboard/ask-readee${q}`,
      icon: MessageCircleHeart,
      label: "Ask Luna",
      desc: "Ask me anything — a tricky word, a question, an idea.",
      grad: "linear-gradient(135deg,#2563eb,#22d3ee)",
      glow: "rgba(37,99,235,.26)",
    },
    {
      href: `/luna/create${q}`,
      icon: Wand2,
      label: "Make a Story",
      desc: "Tell me a topic — I'll write a story you can read, then help you read it.",
      grad: "linear-gradient(135deg,#c026d3,#7c3aed)",
      glow: "rgba(192,38,211,.26)",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-10">
      {/* Luna's face */}
      <div className="flex flex-col items-center text-center">
        <LunaOrb mode="idle" size={240} />
        <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
          <Sparkles className="h-4 w-4" />
          Luna
        </div>
        <h1
          className="mt-1 font-extrabold tracking-tight text-zinc-900 dark:text-white"
          style={{ fontFamily: "'Baloo 2','Nunito',sans-serif", fontSize: 30 }}
        >
          Hi, {child.name}!
        </h1>
        <p className="mt-1 text-sm font-semibold text-zinc-500 dark:text-slate-400">
          What should we do together?
        </p>
      </div>

      {/* Activities */}
      <div className="mt-9 grid gap-4 sm:grid-cols-3">
        {activities.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="group relative flex flex-col rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60"
              style={{ boxShadow: `0 10px 30px -18px ${a.glow}` }}
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
                style={{ background: a.grad }}
              >
                <Icon className="h-7 w-7 text-white" strokeWidth={2} />
              </span>
              <div
                className="mt-4 text-lg font-extrabold text-zinc-900 dark:text-white"
                style={{ fontFamily: "'Baloo 2','Nunito',sans-serif" }}
              >
                {a.label}
              </div>
              <p className="mt-1 flex-1 text-[13px] font-medium leading-snug text-zinc-500 dark:text-slate-400">
                {a.desc}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-violet-600 transition group-hover:gap-2 dark:text-violet-300">
                Start
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
