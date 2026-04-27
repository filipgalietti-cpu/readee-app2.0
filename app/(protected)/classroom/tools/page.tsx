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

export const dynamic = "force-dynamic";

const TOOLS = [
  {
    id: "buddy",
    title: "Reading Buddy",
    desc: "Voice-to-voice AI tutor. Kids talk, Readee answers warmly.",
    href: "/buddy",
    icon: Mic2,
    tag: "Voice",
    color: "from-violet-500 to-indigo-600",
  },
  {
    id: "homework-scan",
    title: "Homework Scanner",
    desc: "Snap a worksheet → get the CCSS standard + practice instantly.",
    href: "/dashboard/homework-scan",
    icon: Camera,
    tag: "Vision",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "writing",
    title: "Writing Rubric",
    desc: "AI scores student writing on the 4-domain CCSS rubric.",
    href: "/classroom/tools/writing-rubric",
    icon: ClipboardCheck,
    tag: "Assess",
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "iep",
    title: "Progress Note (IEP/504)",
    desc: "Drafts a quarterly progress note grounded in real practice data.",
    href: "/classroom/tools/iep-note",
    icon: Notebook,
    tag: "SPED",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "coach",
    title: "Coach Mode",
    desc: "Record a small group reading; AI flags errors per kid.",
    href: "/classroom/tools/coach",
    icon: Brain,
    tag: "Observer",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "roster",
    title: "Roster Importer",
    desc: "Paste any roster — AI normalizes to first / last / grade / class.",
    href: "/admin/tools/roster-import",
    icon: FileSpreadsheet,
    tag: "Admin",
    color: "from-zinc-500 to-zinc-700",
  },
  {
    id: "translate",
    title: "Translate Anything",
    desc: "10 languages on demand. ELL kids and non-English parents.",
    href: "/classroom/tools/translate",
    icon: Languages,
    tag: "ELL",
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "calibrated",
    title: "Calibrated Item Builder",
    desc: "Generate one assessment item at exactly the difficulty you need.",
    href: "/classroom/tools/calibrated-item",
    icon: Wand2,
    tag: "Assess",
    color: "from-indigo-500 to-violet-600",
  },
];

export default async function ToolsHubPage() {
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

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <li key={t.id}>
              <Link
                href={t.href}
                className="group block h-full rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${t.color} text-white shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {t.tag}
                  </span>
                </div>
                <div className="mt-0.5 text-base font-bold text-zinc-900 dark:text-white">
                  {t.title}
                </div>
                <div className="mt-1 text-xs text-zinc-500">{t.desc}</div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 group-hover:gap-2">
                  Open
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
