import Link from "next/link";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import {
  ShieldOff,
  ArrowLeft,
  Boxes,
  Check,
  AlertTriangle,
  XCircle,
  ImageIcon,
  Volume2,
  ListChecks,
  Search,
} from "lucide-react";
import {
  loadAssetFeed,
  assetKindLabel,
  type AssetKind,
  type AssetVerdict,
} from "@/lib/owner/asset-feed";

export const dynamic = "force-dynamic";

const VERDICT_TONES: Record<AssetVerdict, string> = {
  pass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  warn: "bg-amber-100 text-amber-800 ring-amber-200",
  fail: "bg-rose-100 text-rose-700 ring-rose-200",
  unknown: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

const VERDICT_ICON: Record<AssetVerdict, any> = {
  pass: Check,
  warn: AlertTriangle,
  fail: XCircle,
  unknown: ListChecks,
};

const KIND_TONE: Record<AssetKind, string> = {
  ask_readee: "bg-violet-100 text-violet-700",
  community_passage: "bg-emerald-100 text-emerald-700",
  leveled_passage: "bg-rose-100 text-rose-700",
  personalized_story: "bg-amber-100 text-amber-700",
  daily_question: "bg-indigo-100 text-indigo-700",
  custom_lesson: "bg-blue-100 text-blue-700",
  custom_book: "bg-pink-100 text-pink-700",
};

const ALL_KINDS: AssetKind[] = [
  "ask_readee",
  "community_passage",
  "leveled_passage",
  "personalized_story",
  "daily_question",
  "custom_lesson",
  "custom_book",
];

const ALL_VERDICTS: AssetVerdict[] = ["pass", "warn", "fail", "unknown"];

function shortRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default async function OwnerAssetsPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string;
    verdict?: string;
    grade?: string;
    q?: string;
  }>;
}) {
  const me = await requireProfile();
  const ok = await isPlatformAdmin(me.id);
  if (!ok) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
          <ShieldOff className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">
          Owner only
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          The asset feed is restricted to platform admins.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const kindFilter = params.kind && ALL_KINDS.includes(params.kind as AssetKind)
    ? [params.kind as AssetKind]
    : undefined;
  const verdictFilter =
    params.verdict && ALL_VERDICTS.includes(params.verdict as AssetVerdict)
      ? [params.verdict as AssetVerdict]
      : undefined;
  const search = (params.q ?? "").trim() || null;
  const grade = (params.grade ?? "").trim() || null;

  const { rows, counts } = await loadAssetFeed({
    kinds: kindFilter,
    verdicts: verdictFilter,
    gradeLevel: grade,
    search,
    perKindLimit: 100,
  });

  const passPct = counts.total
    ? Math.round((counts.byVerdict.pass / counts.total) * 100)
    : 0;
  const warnPct = counts.total
    ? Math.round((counts.byVerdict.warn / counts.total) * 100)
    : 0;
  const failPct = counts.total
    ? Math.round((counts.byVerdict.fail / counts.total) * 100)
    : 0;

  function buildHref(overrides: Record<string, string | undefined>): string {
    const next: Record<string, string> = {};
    if (params.kind) next.kind = params.kind;
    if (params.verdict) next.verdict = params.verdict;
    if (params.grade) next.grade = params.grade;
    if (params.q) next.q = params.q;
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) delete next[k];
      else next[k] = v;
    }
    const qs = new URLSearchParams(next).toString();
    return qs ? `/owner/assets?${qs}` : `/owner/assets`;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/owner"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-amber-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Owner overview
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-600">
          <Boxes className="h-4 w-4" />
          Owner · AI asset feed
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Everything Readee just made
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          One feed. Every AI-created passage, lesson, story, daily question,
          and image-or-audio asset across all surfaces. Filter by kind or
          verdict to triage.
        </p>
      </div>

      {/* Hero counts */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Hero
          tone="from-amber-500 to-amber-700"
          label="Total assets"
          value={counts.total.toLocaleString()}
          sub={`${counts.last24h} new in 24h · ${counts.last7d} in 7d`}
        />
        <Hero
          tone="from-emerald-500 to-emerald-700"
          label="QC pass"
          value={`${passPct}%`}
          sub={`${counts.byVerdict.pass.toLocaleString()} of ${counts.total.toLocaleString()}`}
        />
        <Hero
          tone="from-amber-400 to-orange-500"
          label="QC warn"
          value={`${warnPct}%`}
          sub={`${counts.byVerdict.warn.toLocaleString()} need attention`}
        />
        <Hero
          tone="from-rose-500 to-rose-700"
          label="QC fail"
          value={`${failPct}%`}
          sub={`${counts.byVerdict.fail.toLocaleString()} blocked from kids`}
        />
      </div>

      {/* By-kind chips */}
      <div className="mt-4 flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-3">
        <Link
          href={buildHref({ kind: undefined })}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            !kindFilter
              ? "bg-amber-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          All · {counts.total}
        </Link>
        {ALL_KINDS.map((k) => {
          const isActive = kindFilter?.[0] === k;
          return (
            <Link
              key={k}
              href={buildHref({ kind: isActive ? undefined : k })}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                isActive
                  ? "bg-amber-600 text-white"
                  : `${KIND_TONE[k]} hover:opacity-80`
              }`}
            >
              {assetKindLabel(k)} · {counts.byKind[k]}
            </Link>
          );
        })}
      </div>

      {/* Filter strip */}
      <form
        action="/owner/assets"
        method="get"
        className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Verdict
        </span>
        <select
          name="verdict"
          defaultValue={params.verdict ?? ""}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700"
        >
          <option value="">Any</option>
          {ALL_VERDICTS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Grade
        </span>
        <select
          name="grade"
          defaultValue={params.grade ?? ""}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700"
        >
          <option value="">Any</option>
          <option value="K">K</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="3rd">3rd</option>
          <option value="4th">4th</option>
        </select>

        <div className="ml-auto flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1">
          <Search className="h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            name="q"
            defaultValue={search ?? ""}
            placeholder="Search title, creator…"
            className="w-44 bg-transparent text-xs focus:outline-none"
          />
        </div>
        {kindFilter && <input type="hidden" name="kind" value={kindFilter[0]} />}
        <button
          type="submit"
          className="rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-700"
        >
          Apply
        </button>
        {(params.kind || params.verdict || params.grade || params.q) && (
          <Link
            href="/owner/assets"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Asset table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Boxes className="mx-auto h-10 w-10 text-zinc-300" strokeWidth={1.5} />
            <h2 className="mt-3 text-base font-bold text-zinc-700">
              Nothing matches.
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Try fewer filters, or check the QC bot dashboard for system
              activity.
            </p>
            <Link
              href="/owner/qc-bot"
              className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-200"
            >
              QC bot →
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="px-3 py-2">Asset</th>
                <th className="px-3 py-2">Kind</th>
                <th className="px-3 py-2">Grade</th>
                <th className="px-3 py-2">QC</th>
                <th className="px-3 py-2">Media</th>
                <th className="px-3 py-2">Made by</th>
                <th className="px-3 py-2">When</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.slice(0, 200).map((r) => {
                const Icon = VERDICT_ICON[r.qcVerdict];
                return (
                  <tr key={`${r.kind}-${r.id}`} className="align-top hover:bg-zinc-50">
                    <td className="px-3 py-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white">
                          {r.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-zinc-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="line-clamp-2 text-xs font-bold text-zinc-900">
                            {r.title}
                          </div>
                          {r.qcNote && (
                            <div className="mt-0.5 line-clamp-1 text-[10px] text-amber-700">
                              {r.qcNote}
                            </div>
                          )}
                          {(r.views ?? 0) > 0 || (r.thumbsUp ?? 0) > 0 || (r.thumbsDown ?? 0) > 0 ? (
                            <div className="mt-0.5 flex flex-wrap gap-2 text-[10px] text-zinc-500">
                              {(r.views ?? 0) > 0 && <span>{r.views} views</span>}
                              {(r.thumbsUp ?? 0) > 0 && (
                                <span className="text-emerald-600">▲ {r.thumbsUp}</span>
                              )}
                              {(r.thumbsDown ?? 0) > 0 && (
                                <span className="text-rose-600">▼ {r.thumbsDown}</span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${KIND_TONE[r.kind]}`}
                      >
                        {assetKindLabel(r.kind)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs font-mono text-zinc-700">
                      {r.gradeLevel ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${VERDICT_TONES[r.qcVerdict]}`}
                      >
                        <Icon className="h-3 w-3" />
                        {r.qcVerdict}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 text-zinc-400">
                        {r.hasImage ? (
                          <ImageIcon className="h-3.5 w-3.5 text-violet-600" />
                        ) : null}
                        {r.hasAudio ? (
                          <Volume2 className="h-3.5 w-3.5 text-violet-600" />
                        ) : null}
                        {!r.hasImage && !r.hasAudio ? (
                          <span className="text-[10px]">text only</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-700">
                      {r.createdByLabel ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-500">
                      {shortRelative(r.createdAt)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <Link
                        href={r.detailHref}
                        target="_blank"
                        className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 hover:bg-amber-200"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {rows.length > 200 && (
          <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-2 text-center text-[11px] text-zinc-500">
            Showing first 200 of {rows.length}. Filter to narrow.
          </div>
        )}
      </div>

      {/* Cross-link to QC bot for the "what got fixed?" view. */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        Looking for change history (regens, dismissals, audit fixes)? See
        the{" "}
        <Link href="/owner/qc-bot" className="font-bold underline">
          QC bot dashboard
        </Link>
        . This page lists assets; that one lists what the bot did to them.
      </div>
    </div>
  );
}

function Hero({
  tone,
  label,
  value,
  sub,
}: {
  tone: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow-md ${tone}`}>
      <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
        {label}
      </div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] opacity-80">{sub}</div>
    </div>
  );
}
