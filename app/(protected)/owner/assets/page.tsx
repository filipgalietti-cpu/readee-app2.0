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
  FileText,
  Layers,
  ThumbsUp,
  ThumbsDown,
  Eye,
} from "lucide-react";
import {
  loadAssetFeed,
  assetKindLabel,
  type AssetKind,
  type AssetVerdict,
  type AssetRow,
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
  "daily_question",
  "ask_readee",
  "community_passage",
  "leveled_passage",
  "personalized_story",
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

/**
 * Package completeness — for each row, what does the bundle look
 * like? Different content types ship different mixes of media + Qs.
 * This drives the "missing media" signal in the hero.
 */
function isPackageComplete(r: AssetRow): boolean {
  switch (r.kind) {
    case "daily_question":
      return r.hasImage && r.hasAudio && r.questionCount > 0;
    case "ask_readee":
    case "community_passage":
      // Image is the only universally-required media; audio is opt-in
      // for parents but expected for community-published content.
      return r.hasImage && (r.kind === "ask_readee" ? true : r.hasAudio);
    case "leveled_passage":
      return r.hasImage && r.questionCount > 0;
    case "personalized_story":
      return r.hasImage && r.pageCount > 0;
    case "custom_lesson":
      return r.hasImage && r.pageCount > 0;
    case "custom_book":
      return r.hasImage && r.pageCount > 0;
  }
}

function bucketByRecency(rows: AssetRow[]): {
  today: AssetRow[];
  yesterday: AssetRow[];
  thisWeek: AssetRow[];
  older: AssetRow[];
} {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOf7d = new Date(startOfToday);
  startOf7d.setDate(startOf7d.getDate() - 7);

  const today: AssetRow[] = [];
  const yesterday: AssetRow[] = [];
  const thisWeek: AssetRow[] = [];
  const older: AssetRow[] = [];
  for (const r of rows) {
    const t = new Date(r.createdAt).getTime();
    if (t >= startOfToday.getTime()) today.push(r);
    else if (t >= startOfYesterday.getTime()) yesterday.push(r);
    else if (t >= startOf7d.getTime()) thisWeek.push(r);
    else older.push(r);
  }
  return { today, yesterday, thisWeek, older };
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

  const buckets = bucketByRecency(rows);
  const incomplete = rows.filter((r) => !isPackageComplete(r)).length;
  const passPct = counts.total
    ? Math.round((counts.byVerdict.pass / counts.total) * 100)
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
          Owner · Daily content feed
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Everything Readee just made
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          One row per content package. Each row shows the image, audio,
          and questions that ship together. Grouped by when it was made.
        </p>
      </div>

      {/* Hero counts */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Hero
          tone="from-amber-500 to-amber-700"
          label="Today"
          value={buckets.today.length.toString()}
          sub={`${counts.last7d} this week · ${counts.total} all time`}
        />
        <Hero
          tone="from-emerald-500 to-emerald-700"
          label="QC pass rate"
          value={`${passPct}%`}
          sub={`${counts.byVerdict.fail} failed · ${counts.byVerdict.warn} warned`}
        />
        <Hero
          tone="from-rose-500 to-rose-700"
          label="Missing media"
          value={incomplete.toString()}
          sub="Packages with no image, audio, or Qs"
        />
        <Hero
          tone="from-indigo-500 to-violet-700"
          label="Total kid thumbs"
          value={rows
            .reduce((acc, r) => acc + (r.thumbsUp ?? 0) + (r.thumbsDown ?? 0), 0)
            .toString()}
          sub={`${rows.reduce((a, r) => a + (r.thumbsUp ?? 0), 0)} ↑ · ${rows.reduce((a, r) => a + (r.thumbsDown ?? 0), 0)} ↓`}
        />
      </div>

      {/* Filter chips */}
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
          QC verdict
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

      {/* Sections by recency */}
      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
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
        <div className="mt-4 space-y-6">
          {buckets.today.length > 0 && (
            <Section title="Today" rows={buckets.today} expanded />
          )}
          {buckets.yesterday.length > 0 && (
            <Section title="Yesterday" rows={buckets.yesterday} expanded />
          )}
          {buckets.thisWeek.length > 0 && (
            <Section title="Earlier this week" rows={buckets.thisWeek} />
          )}
          {buckets.older.length > 0 && (
            <Section title="Older" rows={buckets.older} />
          )}
        </div>
      )}

      {/* Cross-link to QC bot */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        Looking for change history (regens, dismissals, audit fixes)? See
        the{" "}
        <Link href="/owner/qc-bot" className="font-bold underline">
          QC bot dashboard
        </Link>
        . This page lists packages; that one lists what the bot did to them.
      </div>
    </div>
  );
}

function Section({
  title,
  rows,
  expanded = false,
}: {
  title: string;
  rows: AssetRow[];
  expanded?: boolean;
}) {
  // Show first 12 by default; the rest collapse behind a details summary.
  const initialCount = expanded ? rows.length : Math.min(rows.length, 12);
  const visible = rows.slice(0, initialCount);
  const remaining = rows.slice(initialCount);

  return (
    <section>
      <header className="mb-2 flex items-baseline gap-2 px-1">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-700">
          {title}
        </h2>
        <span className="text-[11px] text-zinc-400">
          {rows.length} package{rows.length === 1 ? "" : "s"}
        </span>
      </header>
      <ul className="overflow-hidden rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-100">
        {visible.map((r) => (
          <PackageRow key={`${r.kind}-${r.id}`} row={r} />
        ))}
      </ul>
      {remaining.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-semibold text-zinc-500 hover:text-amber-700">
            Show {remaining.length} more
          </summary>
          <ul className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-100">
            {remaining.map((r) => (
              <PackageRow key={`${r.kind}-${r.id}`} row={r} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function PackageRow({ row: r }: { row: AssetRow }) {
  const Icon = VERDICT_ICON[r.qcVerdict];
  const complete = isPackageComplete(r);
  return (
    <li className="flex items-start gap-3 px-3 py-3 transition hover:bg-zinc-50">
      {/* Thumbnail */}
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white">
        {r.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-zinc-300" />
        )}
      </div>

      {/* Title + chips */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${KIND_TONE[r.kind]}`}
          >
            {assetKindLabel(r.kind)}
          </span>
          {r.gradeLevel && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-700">
              {r.gradeLevel}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${VERDICT_TONES[r.qcVerdict]}`}
          >
            <Icon className="h-3 w-3" />
            {r.qcVerdict}
          </span>
          {!complete && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 ring-1 ring-rose-200">
              <AlertTriangle className="h-3 w-3" />
              missing
            </span>
          )}
        </div>
        <div className="mt-1 line-clamp-1 text-sm font-bold text-zinc-900">
          {r.title}
        </div>
        {r.qcNote && (
          <div className="mt-0.5 line-clamp-1 text-[11px] text-amber-700">
            {r.qcNote}
          </div>
        )}

        {/* Package contents */}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
          <PackageChip
            present={r.hasImage}
            label="Image"
            Icon={ImageIcon}
          />
          <PackageChip
            present={r.hasAudio}
            label="Audio"
            Icon={Volume2}
          />
          {r.questionCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 font-bold text-blue-700">
              <FileText className="h-3 w-3" />
              {r.questionCount} Q{r.questionCount === 1 ? "" : "s"}
            </span>
          )}
          {r.pageCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 font-bold text-zinc-700">
              <Layers className="h-3 w-3" />
              {r.pageCount}{" "}
              {r.kind === "leveled_passage" ? "versions" : "pages"}
            </span>
          )}
          {(r.thumbsUp ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <ThumbsUp className="h-3 w-3" />
              {r.thumbsUp}
            </span>
          )}
          {(r.thumbsDown ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-rose-600">
              <ThumbsDown className="h-3 w-3" />
              {r.thumbsDown}
            </span>
          )}
          {(r.views ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-zinc-500">
              <Eye className="h-3 w-3" />
              {r.views}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-zinc-400">
          <span>{r.createdByLabel ?? "—"}</span>
          <span className="text-zinc-300">·</span>
          <span>{shortRelative(r.createdAt)}</span>
        </div>
      </div>

      {/* Open */}
      <div className="flex-shrink-0">
        <Link
          href={r.detailHref}
          target="_blank"
          className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-200"
        >
          Open →
        </Link>
      </div>
    </li>
  );
}

function PackageChip({
  present,
  label,
  Icon,
}: {
  present: boolean;
  label: string;
  Icon: any;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-bold ${
        present
          ? "bg-emerald-50 text-emerald-700"
          : "bg-zinc-100 text-zinc-400 line-through"
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
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
