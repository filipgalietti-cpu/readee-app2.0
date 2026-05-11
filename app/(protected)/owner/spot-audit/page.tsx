import Link from "next/link";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ShieldOff, ArrowLeft, Sparkles } from "lucide-react";
import SpotAuditCard, {
  type SpotAuditItem,
} from "./_components/SpotAuditCard";

export const dynamic = "force-dynamic";

/**
 * Spot audit. Pulls a random sample of "pass" rows from the last
 * 24h across our autonomous content tables and asks Filip + Jen
 * to verify the bot's verdict. Every ✗ becomes a permanent gate
 * via the lessons-learned pipeline.
 *
 * Why this exists: single-LLM judges have sycophancy blindness.
 * The adversarial second judge (f79e3af) catches a lot of it. The
 * Wikipedia portrait compare (1c4ae50) catches identity drift. But
 * neither catches what a thoughtful human notices. 10 random rows,
 * 10 minutes a day, every operator-found issue seeds a check.
 */
export default async function SpotAuditPage() {
  const profile = await requireProfile();
  const allowed = profile ? await isPlatformAdmin(profile.id) : false;
  if (!profile || !allowed) {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center">
        <ShieldOff className="mx-auto h-12 w-12 text-zinc-300" />
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">
          Owner only
        </h1>
      </div>
    );
  }

  const admin = supabaseAdmin();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: daily }, { data: discovery }, { data: alreadyReviewed }] =
    await Promise.all([
      admin
        .from("daily_questions")
        .select(
          "date, slug, passage_title, passage_body, image_url, audio_url, question_prompt, choices, correct, extra_questions, qc_overall",
        )
        .gte("created_at", since)
        .eq("qc_overall", "pass")
        .limit(20),
      admin
        .from("discovery_articles")
        .select(
          "id, category, slug, title, body, image_url, audio_url, question_prompt, choices, correct, extra_questions, qc_overall",
        )
        .gte("created_at", since)
        .eq("qc_overall", "pass")
        .limit(40),
      admin
        .from("spot_audit_findings")
        .select("target_kind, target_id")
        .gte("created_at", since),
    ]);

  const reviewedKey = (k: string, id: string) => `${k}:${id}`;
  const reviewedSet = new Set(
    ((alreadyReviewed ?? []) as any[]).map((r) =>
      reviewedKey(r.target_kind, r.target_id),
    ),
  );

  const items: SpotAuditItem[] = [];
  for (const r of (daily ?? []) as any[]) {
    if (reviewedSet.has(reviewedKey("daily_question", r.date))) continue;
    items.push({
      kind: "daily_question",
      id: r.date,
      title: r.passage_title,
      body: r.passage_body,
      imageUrl: r.image_url,
      audioUrl: r.audio_url,
      question: {
        prompt: r.question_prompt,
        choices: r.choices,
        correct: r.correct,
      },
      extraQuestions: Array.isArray(r.extra_questions) ? r.extra_questions : [],
      href: `https://learn.readee.app/today/${r.slug}`,
      qcOverall: r.qc_overall,
    });
  }
  for (const r of (discovery ?? []) as any[]) {
    if (reviewedSet.has(reviewedKey("discovery_article", r.id))) continue;
    items.push({
      kind: "discovery_article",
      id: r.id,
      title: r.title,
      body: r.body,
      imageUrl: r.image_url,
      audioUrl: r.audio_url,
      question: {
        prompt: r.question_prompt,
        choices: r.choices,
        correct: r.correct,
      },
      extraQuestions: Array.isArray(r.extra_questions) ? r.extra_questions : [],
      href: `https://learn.readee.app/discover/${r.category}/${r.slug}`,
      qcOverall: r.qc_overall,
    });
  }

  // Random sample of 10 (or fewer if not enough fresh rows).
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  const sample = items.slice(0, 10);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/owner"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Owner
      </Link>
      <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
        <Sparkles className="h-3 w-3" />
        Spot audit
      </div>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900">
        Find what the bot missed.
      </h1>
      <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
        10 random pieces of content the QC pipeline marked{" "}
        <span className="font-mono font-semibold">pass</span> in the last
        24h. Read each one quickly. If you spot anything wrong, click{" "}
        <span className="font-semibold text-rose-700">Found a problem</span>{" "}
        and write what's wrong — the article gets flipped to fail (auto-
        hidden from public surfaces) and your reason gets logged for the
        lessons-learned pipeline.
      </p>

      {sample.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
          No fresh pass rows to audit right now. Either the bot didn&apos;t
          produce any in the last 24h, or you&apos;ve already reviewed
          everything. Come back tomorrow.
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {sample.map((it) => (
            <SpotAuditCard key={`${it.kind}:${it.id}`} item={it} />
          ))}
        </div>
      )}
    </main>
  );
}
