/**
 * Unified AI-asset feed for /owner/assets.
 *
 * Fans out across every table that holds AI-created content and
 * normalizes each row into the same shape so the dashboard renders
 * one filterable, sortable table.
 *
 * Why one loader instead of per-table dashboards: the owner needs to
 * see "what was made today" across every surface (parent Ask-Readee,
 * factory passages, daily question, teacher tools, leveled passages,
 * personalized stories, lessons, books) without clicking around. The
 * QC bot dashboard handles audit findings; this handles the assets
 * themselves.
 */
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getFeedbackAggregates, type KidAssetKind } from "@/lib/feedback/kid-thumbs";

export type AssetKind =
  | "ask_readee" // child_ai_content (parent-generated)
  | "community_passage" // community_passages (factory + community-shared)
  | "leveled_passage" // differentiated_passages
  | "personalized_story" // personalized_stories
  | "daily_question" // daily_questions
  | "custom_lesson" // custom_lessons (teacher-built)
  | "custom_book"; // custom_books (decodable)

export type AssetVerdict = "pass" | "warn" | "fail" | "unknown";

export type AssetRow = {
  id: string;
  kind: AssetKind;
  title: string;
  gradeLevel: string | null;
  standardId: string | null;
  qcVerdict: AssetVerdict;
  // Free-form note from QC report (e.g., judge feedback summary)
  qcNote: string | null;
  hasImage: boolean;
  hasAudio: boolean;
  // Engagement signal where the source table tracks it
  thumbsUp: number | null;
  thumbsDown: number | null;
  views: number | null;
  // Who created it. NULL for system-generated (factory cron).
  createdById: string | null;
  createdByLabel: string | null;
  createdAt: string;
  // Direct content URLs so the row can render thumbnails inline.
  imageUrl: string | null;
  audioUrl: string | null;
  // Detail link (where the operator can preview the asset)
  detailHref: string;
};

export type AssetCounts = {
  total: number;
  byKind: Record<AssetKind, number>;
  byVerdict: Record<AssetVerdict, number>;
  last7d: number;
  last24h: number;
};

const KIND_LABEL: Record<AssetKind, string> = {
  ask_readee: "Ask Readee",
  community_passage: "Community / Factory",
  leveled_passage: "Leveled",
  personalized_story: "Personalized story",
  daily_question: "Daily question",
  custom_lesson: "Lesson",
  custom_book: "Decodable book",
};

export function assetKindLabel(kind: AssetKind): string {
  return KIND_LABEL[kind] ?? kind;
}

function pickVerdict(value: string | null | undefined): AssetVerdict {
  if (value === "pass" || value === "warn" || value === "fail") return value;
  return "unknown";
}

function noteFromReport(report: any): string | null {
  if (!report || typeof report !== "object") return null;
  const txt =
    report.summary ??
    report.note ??
    report.image?.note ??
    report.audio?.note ??
    null;
  return typeof txt === "string" && txt.length > 0 ? txt : null;
}

export type AssetFilter = {
  kinds?: AssetKind[];
  verdicts?: AssetVerdict[];
  gradeLevel?: string | null;
  search?: string | null;
  // Pull this many of each kind. Caller paginates client-side.
  perKindLimit?: number;
};

/**
 * Loads an asset feed. Runs every per-kind query in parallel via
 * Promise.all so a slow table doesn't block the dashboard.
 */
export async function loadAssetFeed(
  filter: AssetFilter = {},
): Promise<{ rows: AssetRow[]; counts: AssetCounts }> {
  const limit = filter.perKindLimit ?? 50;
  const admin = supabaseAdmin();

  const [
    askReadee,
    community,
    leveled,
    personalized,
    dailyQs,
    lessons,
    books,
  ] = await Promise.all([
    admin
      .from("child_ai_content")
      .select(
        "id, parent_id, child_id, kind, title, topic, grade_level, image_url, audio_url, passage_text, qc_status, last_played_at, play_count, shared, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("community_passages")
      .select(
        "id, source_parent_id, title, topic, grade_level, image_url, audio_url, status, view_count, play_count, completion_count, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("differentiated_passages")
      .select(
        "id, teacher_id, title, topic, base_grade, shared_image_url, qc_overall, qc_report, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("personalized_stories")
      .select(
        "id, parent_id, child_id, title, reading_level, cover_image_url, qc_overall, qc_report, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("daily_questions")
      .select(
        "date, theme, slug, passage_title, image_url, audio_url, qc_overall, qc_report, views, thumbs_up, thumbs_down, created_at",
      )
      .order("date", { ascending: false })
      .limit(limit),
    admin
      .from("custom_lessons")
      .select(
        "id, teacher_id, title, topic, grade_level, cover_image_url, qc_overall, qc_report, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("custom_books")
      .select(
        "id, teacher_id, title, phonics_pattern, grade_level, cover_image_url, qc_overall, qc_report, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  // Collect creator profile IDs across all sources to resolve emails
  // in one batched select. Owner needs to see who made what.
  const creatorIds = new Set<string>();
  for (const r of (askReadee.data ?? []) as any[]) if (r.parent_id) creatorIds.add(r.parent_id);
  for (const r of (community.data ?? []) as any[]) if (r.source_parent_id) creatorIds.add(r.source_parent_id);
  for (const r of (leveled.data ?? []) as any[]) if (r.teacher_id) creatorIds.add(r.teacher_id);
  for (const r of (personalized.data ?? []) as any[]) if (r.parent_id) creatorIds.add(r.parent_id);
  for (const r of (lessons.data ?? []) as any[]) if (r.teacher_id) creatorIds.add(r.teacher_id);
  for (const r of (books.data ?? []) as any[]) if (r.teacher_id) creatorIds.add(r.teacher_id);

  const creatorMap = new Map<string, string>();
  if (creatorIds.size > 0) {
    const { data } = await admin
      .from("profiles")
      .select("id, email, display_name")
      .in("id", Array.from(creatorIds));
    for (const p of (data ?? []) as any[]) {
      creatorMap.set(p.id, p.display_name || p.email || p.id.slice(0, 8));
    }
  }

  const rows: AssetRow[] = [];

  for (const r of (askReadee.data ?? []) as any[]) {
    rows.push({
      id: String(r.id),
      kind: "ask_readee",
      title: r.title ?? r.topic ?? "Ask Readee passage",
      gradeLevel: r.grade_level ?? null,
      standardId: null,
      // child_ai_content uses qc_status (pass/warn/fail/quarantined/
      // retired) — added by the deliverability gate in mig 091.
      qcVerdict:
        r.qc_status === "pass" || r.qc_status === "warn" || r.qc_status === "fail"
          ? r.qc_status
          : r.qc_status === "quarantined" || r.qc_status === "retired"
            ? "fail"
            : "unknown",
      qcNote: null,
      hasImage: Boolean(r.image_url),
      hasAudio: Boolean(r.audio_url),
      thumbsUp: null,
      thumbsDown: null,
      views: typeof r.play_count === "number" ? r.play_count : null,
      createdById: r.parent_id ?? null,
      createdByLabel: r.parent_id ? creatorMap.get(r.parent_id) ?? null : null,
      createdAt: r.created_at,
      imageUrl: r.image_url ?? null,
      audioUrl: r.audio_url ?? null,
      detailHref: `/parent-lesson/${r.id}`,
    });
  }

  for (const r of (community.data ?? []) as any[]) {
    rows.push({
      id: String(r.id),
      kind: "community_passage",
      title: r.title ?? r.topic ?? "Community passage",
      gradeLevel: r.grade_level ?? null,
      standardId: null,
      // community_passages uses a `status` column (pending/approved/…),
      // not qc_overall. Treat approved as pass, pending as unknown,
      // rejected/withdrawn as fail.
      qcVerdict:
        r.status === "approved"
          ? "pass"
          : r.status === "rejected" || r.status === "withdrawn"
            ? "fail"
            : "unknown",
      qcNote: r.status === "pending" ? "Awaiting review" : null,
      hasImage: Boolean(r.image_url),
      hasAudio: Boolean(r.audio_url),
      thumbsUp: null,
      thumbsDown: null,
      views: typeof r.view_count === "number" ? r.view_count : null,
      createdById: r.source_parent_id ?? null,
      createdByLabel: r.source_parent_id
        ? creatorMap.get(r.source_parent_id) ?? "Factory"
        : "Factory",
      createdAt: r.created_at,
      imageUrl: r.image_url ?? null,
      audioUrl: r.audio_url ?? null,
      detailHref: `/community/${r.id}`,
    });
  }

  for (const r of (leveled.data ?? []) as any[]) {
    rows.push({
      id: String(r.id),
      kind: "leveled_passage",
      title: r.title ?? r.topic ?? "Leveled passage",
      gradeLevel: r.base_grade ?? null,
      standardId: null,
      qcVerdict: pickVerdict(r.qc_overall),
      qcNote: noteFromReport(r.qc_report),
      hasImage: Boolean(r.shared_image_url),
      hasAudio: false,
      thumbsUp: null,
      thumbsDown: null,
      views: null,
      createdById: r.teacher_id ?? null,
      createdByLabel: r.teacher_id ? creatorMap.get(r.teacher_id) ?? null : null,
      createdAt: r.created_at,
      imageUrl: r.shared_image_url ?? null,
      audioUrl: null,
      detailHref: `/classroom/leveled/${r.id}`,
    });
  }

  for (const r of (personalized.data ?? []) as any[]) {
    rows.push({
      id: String(r.id),
      kind: "personalized_story",
      title: r.title ?? "Personalized story",
      gradeLevel: r.reading_level ?? null,
      standardId: null,
      qcVerdict: pickVerdict(r.qc_overall),
      qcNote: noteFromReport(r.qc_report),
      hasImage: Boolean(r.cover_image_url),
      hasAudio: false,
      thumbsUp: null,
      thumbsDown: null,
      views: null,
      createdById: r.parent_id ?? null,
      createdByLabel: r.parent_id ? creatorMap.get(r.parent_id) ?? null : null,
      createdAt: r.created_at,
      imageUrl: r.cover_image_url ?? null,
      audioUrl: null,
      detailHref: `/stories-for-me/${r.id}`,
    });
  }

  for (const r of (dailyQs.data ?? []) as any[]) {
    rows.push({
      id: String(r.date),
      kind: "daily_question",
      title: r.passage_title ?? r.theme ?? `Daily · ${r.date}`,
      gradeLevel: null,
      standardId: null,
      qcVerdict: pickVerdict(r.qc_overall),
      qcNote: noteFromReport(r.qc_report),
      hasImage: Boolean(r.image_url),
      hasAudio: Boolean(r.audio_url),
      thumbsUp: typeof r.thumbs_up === "number" ? r.thumbs_up : null,
      thumbsDown: typeof r.thumbs_down === "number" ? r.thumbs_down : null,
      views: typeof r.views === "number" ? r.views : null,
      createdById: null,
      createdByLabel: "System",
      createdAt: r.created_at,
      imageUrl: r.image_url ?? null,
      audioUrl: r.audio_url ?? null,
      detailHref: `/today?d=${r.date}`,
    });
  }

  for (const r of (lessons.data ?? []) as any[]) {
    rows.push({
      id: String(r.id),
      kind: "custom_lesson",
      title: r.title ?? r.topic ?? "Lesson",
      gradeLevel: r.grade_level ?? null,
      standardId: null,
      qcVerdict: pickVerdict(r.qc_overall),
      qcNote: noteFromReport(r.qc_report),
      hasImage: Boolean(r.cover_image_url),
      hasAudio: false,
      thumbsUp: null,
      thumbsDown: null,
      views: null,
      createdById: r.teacher_id ?? null,
      createdByLabel: r.teacher_id ? creatorMap.get(r.teacher_id) ?? null : null,
      createdAt: r.created_at,
      imageUrl: r.cover_image_url ?? null,
      audioUrl: null,
      detailHref: `/classroom/lessons/${r.id}`,
    });
  }

  for (const r of (books.data ?? []) as any[]) {
    rows.push({
      id: String(r.id),
      kind: "custom_book",
      title: r.title ?? "Decodable book",
      gradeLevel: r.grade_level ?? null,
      standardId: null,
      qcVerdict: pickVerdict(r.qc_overall),
      qcNote: noteFromReport(r.qc_report),
      hasImage: Boolean(r.cover_image_url),
      hasAudio: false,
      thumbsUp: null,
      thumbsDown: null,
      views: null,
      createdById: r.teacher_id ?? null,
      createdByLabel: r.teacher_id ? creatorMap.get(r.teacher_id) ?? null : null,
      createdAt: r.created_at,
      imageUrl: r.cover_image_url ?? null,
      audioUrl: null,
      detailHref: `/classroom/books/${r.id}`,
    });
  }

  // Pull kid-feedback aggregates for every row in one batched query.
  // KidAssetKind covers most asset kinds we surface; the rest get
  // (null, null, 0) which is the default we already populate above.
  const KIND_TO_FEEDBACK: Partial<Record<AssetKind, KidAssetKind>> = {
    ask_readee: "ask_readee",
    community_passage: "community_passage",
    leveled_passage: "leveled_passage",
    personalized_story: "personalized_story",
    daily_question: "daily_question",
    custom_lesson: "custom_lesson",
    custom_book: "custom_book",
  };
  const feedbackPairs = rows
    .map((r) => {
      const fk = KIND_TO_FEEDBACK[r.kind];
      return fk ? { kind: fk, id: r.id } : null;
    })
    .filter((p): p is { kind: KidAssetKind; id: string } => p !== null);
  const aggMap = await getFeedbackAggregates(feedbackPairs);
  for (const r of rows) {
    const fk = KIND_TO_FEEDBACK[r.kind];
    if (!fk) continue;
    const agg = aggMap.get(`${fk}:${r.id}`);
    if (agg) {
      r.thumbsUp = agg.up;
      r.thumbsDown = agg.down;
    }
  }

  // Apply filters in-memory. We do this after merge so the
  // counts-without-filter and counts-with-filter aren't tangled.
  const counts = computeCounts(rows);
  const filtered = applyFilter(rows, filter);

  // Sort newest-first across the whole feed.
  filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return { rows: filtered, counts };
}

function applyFilter(rows: AssetRow[], filter: AssetFilter): AssetRow[] {
  return rows.filter((r) => {
    if (filter.kinds && filter.kinds.length > 0 && !filter.kinds.includes(r.kind)) {
      return false;
    }
    if (
      filter.verdicts &&
      filter.verdicts.length > 0 &&
      !filter.verdicts.includes(r.qcVerdict)
    ) {
      return false;
    }
    if (filter.gradeLevel && r.gradeLevel !== filter.gradeLevel) return false;
    if (filter.search && filter.search.trim().length > 0) {
      const q = filter.search.toLowerCase();
      const hay = [
        r.title,
        r.gradeLevel,
        r.standardId,
        r.createdByLabel,
        r.qcNote,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function computeCounts(rows: AssetRow[]): AssetCounts {
  const byKind: Record<AssetKind, number> = {
    ask_readee: 0,
    community_passage: 0,
    leveled_passage: 0,
    personalized_story: 0,
    daily_question: 0,
    custom_lesson: 0,
    custom_book: 0,
  };
  const byVerdict: Record<AssetVerdict, number> = {
    pass: 0,
    warn: 0,
    fail: 0,
    unknown: 0,
  };
  let last7d = 0;
  let last24h = 0;
  const now = Date.now();
  const sevenDaysMs = 7 * 86_400_000;
  const dayMs = 86_400_000;

  for (const r of rows) {
    byKind[r.kind] += 1;
    byVerdict[r.qcVerdict] += 1;
    const age = now - new Date(r.createdAt).getTime();
    if (age <= dayMs) last24h += 1;
    if (age <= sevenDaysMs) last7d += 1;
  }

  return {
    total: rows.length,
    byKind,
    byVerdict,
    last7d,
    last24h,
  };
}
