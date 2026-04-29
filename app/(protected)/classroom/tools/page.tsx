import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Brain,
  Sparkles,
  Camera,
  Notebook,
  ClipboardCheck,
  FileSpreadsheet,
  Mic2,
  Languages,
  Wand2,
  ArrowRight,
} from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import { hasMinTier, type TeacherTier } from "@/lib/plan/teacher-gate";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

type Tier = "premium" | "teacher_solo" | "school";

const TOOLS: {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: any;
  tag: string;
  color: string;
  minTier: Tier;
}[] = [
  {
    id: "buddy",
    title: "Reading Buddy",
    desc: "Voice-to-voice AI tutor. Kids talk, Readee answers warmly.",
    href: "/buddy",
    icon: Mic2,
    tag: "Voice",
    color: "from-violet-500 to-indigo-600",
    minTier: "premium",
  },
  {
    id: "homework-scan",
    title: "Homework Scanner",
    desc: "Snap a worksheet → get the CCSS standard + practice instantly.",
    href: "/dashboard/homework-scan",
    icon: Camera,
    tag: "Vision",
    color: "from-emerald-500 to-teal-600",
    minTier: "premium",
  },
  {
    id: "writing",
    title: "Writing Rubric",
    desc: "AI scores student writing on the 4-domain CCSS rubric.",
    href: "/classroom/tools/writing-rubric",
    icon: ClipboardCheck,
    tag: "Assess",
    color: "from-rose-500 to-pink-600",
    minTier: "premium",
  },
  {
    id: "iep",
    title: "Progress Note (IEP/504)",
    desc: "Drafts a quarterly progress note grounded in real practice data.",
    href: "/classroom/tools/iep-note",
    icon: Notebook,
    tag: "SPED",
    color: "from-amber-500 to-orange-600",
    minTier: "school",
  },
  {
    id: "coach",
    title: "Running Records",
    desc: "Listen to one student read, get WCPM, accuracy, and miscues.",
    href: "/classroom/tools/coach",
    icon: Brain,
    tag: "1:1 fluency",
    color: "from-blue-500 to-cyan-600",
    minTier: "teacher_solo",
  },
  {
    id: "roster",
    title: "Roster Importer",
    desc: "Paste any roster — AI normalizes to first / last / grade / class.",
    href: "/admin/tools/roster-import",
    icon: FileSpreadsheet,
    tag: "Admin",
    color: "from-zinc-500 to-zinc-700",
    minTier: "school",
  },
  {
    id: "translate",
    title: "Translate Anything",
    desc: "10 languages on demand. ELL kids and non-English parents.",
    href: "/classroom/tools/translate",
    icon: Languages,
    tag: "ELL",
    color: "from-fuchsia-500 to-pink-600",
    minTier: "premium",
  },
  // Calibrated Item Builder folded into Quiz builder's "+ Add question
  // → AI fill" flow. The standalone route at /classroom/tools/calibrated-item
  // still exists as a redirect card for old deep-links.
];

const TIER_LABEL: Record<Tier, string> = {
  premium: "Readee+",
  teacher_solo: "Teacher Solo",
  school: "School",
};

export default async function ToolsHubPage() {
  // Hub itself is open to any educator (so free teachers can see the
  // upsell). Each tool page enforces its own tier minimum.
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600">
        <Sparkles className="h-4 w-4" />
        Readee.ai tools
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Your AI co-teacher
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-zinc-500">
        Every tool here is built on the same Readee.ai engine. Smart
        models, kid-safe guardrails, and CCSS alignment baked in. Cost
        burns from your Readee.ai credit pool.
      </p>

      {(() => {
        const userPlan = (profile as any).plan as TeacherTier | undefined;
        const TIER_RANK: Record<Tier, number> = {
          premium: 1,
          teacher_solo: 2,
          school: 3,
        };
        const annotated = TOOLS.map((t) => ({
          ...t,
          unlocked: hasMinTier(userPlan, t.minTier),
        }));
        const available = annotated.filter((t) => t.unlocked);
        const locked = annotated
          .filter((t) => !t.unlocked)
          .sort((a, b) => TIER_RANK[a.minTier] - TIER_RANK[b.minTier]);

        return (
          <>
            {/* ── Available now ── */}
            {available.length > 0 ? (
              <section className="mt-8">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Available on your plan
                  </h2>
                  <span className="text-[10px] text-zinc-400">
                    {available.length} tool{available.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {available.map((t) => (
                    <ToolCard key={t.id} tool={t} unlocked />
                  ))}
                </ul>
              </section>
            ) : (
              <section className="mt-8 rounded-3xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-6 text-center dark:border-violet-900/40 dark:bg-violet-950/20">
                <Sparkles className="mx-auto h-7 w-7 text-violet-500" />
                <div className="mt-2 text-base font-bold text-zinc-900 dark:text-white">
                  Unlock your first AI tool
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Pick any tier below to start. You can always upgrade later.
                </p>
                <Link
                  href="/upgrade?reason=tools_hub"
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700"
                >
                  See plans
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </section>
            )}

            {/* ── Locked / upsell ── */}
            {locked.length > 0 && (
              <section className="mt-10">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Upgrade to unlock
                  </h2>
                  <Link
                    href="/upgrade?reason=tools_hub"
                    className="text-[11px] font-semibold text-violet-600 hover:underline"
                  >
                    Compare plans →
                  </Link>
                </div>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {locked.map((t) => (
                    <ToolCard key={t.id} tool={t} unlocked={false} />
                  ))}
                </ul>
              </section>
            )}
          </>
        );
      })()}
    </div>
  );
}

function ToolCard({
  tool,
  unlocked,
}: {
  tool: {
    id: string;
    title: string;
    desc: string;
    href: string;
    icon: any;
    tag: string;
    color: string;
    minTier: Tier;
  };
  unlocked: boolean;
}) {
  const Icon = tool.icon;
  const href = unlocked ? tool.href : `/upgrade?reason=${tool.id}`;
  return (
    <li>
      <Link
        href={href}
        className={`group relative flex h-full flex-col rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900/40 ${
          unlocked
            ? "border-zinc-200 hover:border-violet-300 dark:border-slate-800"
            : "border-zinc-200 dark:border-slate-800"
        }`}
      >
        {!unlocked && (
          <span
            className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-zinc-900/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
            aria-hidden="true"
          >
            <Lock className="h-2.5 w-2.5" />
            {TIER_LABEL[tool.minTier]}
          </span>
        )}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color} text-white shadow-sm ${
            unlocked ? "" : "opacity-70"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          {tool.tag}
        </div>
        <div className="mt-0.5 text-base font-bold text-zinc-900 dark:text-white">
          {tool.title}
        </div>
        <div className="mt-1 flex-1 text-xs text-zinc-500">{tool.desc}</div>
        <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-slate-800">
          {unlocked ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 group-hover:gap-2">
              Open
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 dark:text-slate-300 group-hover:text-violet-700">
              Unlock with {TIER_LABEL[tool.minTier]}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}
