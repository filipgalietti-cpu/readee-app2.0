import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Clock, CheckCircle2, XCircle, Flag } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import CommunityReviewList from "./_components/CommunityReviewList";
import FlaggedReportsList, { type FlaggedReport } from "./_components/FlaggedReportsList";

export const dynamic = "force-dynamic";

export default async function CommunityModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const profile = await requireProfile();
  const { status = "pending" } = await searchParams;

  // Admin scope check — same signal the sidebar uses.
  const admin = supabaseAdmin();
  const { count: adminCount } = await admin
    .from("admin_memberships")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);
  if ((adminCount ?? 0) === 0) notFound();

  const flaggedTab = status === "flagged";
  const { data: rows } = flaggedTab
    ? { data: [] }
    : await admin
        .from("community_passages")
        .select(
          "id, title, passage_text, questions, image_url, grade_level, topic, phonics_pattern, status, rejection_reason, created_at, reviewed_at, reviewed_by, source_parent_id, view_count, play_count, completion_count, auto_approved",
        )
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(50);

  // Flags: every report a reader filed, with the AI re-review it got. Until
  // Sep 2026 the team email was the only record of these.
  let flagged: FlaggedReport[] = [];
  if (flaggedTab) {
    const { data: reports } = await admin
      .from("community_reports")
      .select("id, community_id, slug, reason, verdict, removed, reporter_id, created_at, reviewed_at")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(100);
    const list = (reports ?? []) as Array<Record<string, unknown>>;
    const ids = [...new Set(list.map((r) => r.community_id).filter((v): v is string => typeof v === "string"))];
    const { data: passages } = ids.length
      ? await admin.from("community_passages").select("id, title, status, display_byline").in("id", ids)
      : { data: [] };
    const byId = new Map(
      ((passages ?? []) as Array<{ id: string; title: string; status: string; display_byline: string | null }>).map(
        (p) => [p.id, p],
      ),
    );
    flagged = list.map((r) => ({
      id: String(r.id),
      slug: String(r.slug ?? ""),
      reason: (r.reason as string | null) ?? null,
      verdict: (r.verdict as string | null) ?? null,
      removed: Boolean(r.removed),
      anonymous: !r.reporter_id,
      created_at: String(r.created_at),
      passage: byId.get(String(r.community_id)) ?? null,
    }));
  }

  const counts = await Promise.all([
    admin
      .from("community_passages")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("community_passages")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    admin
      .from("community_passages")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected"),
    admin
      .from("community_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Admin home
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600">
          <Users className="h-4 w-4" />
          Community moderation
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
          Parent-shared content review
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Content parents contributed to the community library. Approve to
          publish it for all Readee families. Reject with a reason when
          the content isn&apos;t a fit.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <TabLink
          href="/admin/community?status=pending"
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Pending"
          count={counts[0].count ?? 0}
          active={status === "pending"}
        />
        <TabLink
          href="/admin/community?status=approved"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          label="Approved"
          count={counts[1].count ?? 0}
          active={status === "approved"}
        />
        <TabLink
          href="/admin/community?status=rejected"
          icon={<XCircle className="h-3.5 w-3.5" />}
          label="Rejected"
          count={counts[2].count ?? 0}
          active={status === "rejected"}
        />
        <TabLink
          href="/admin/community?status=flagged"
          icon={<Flag className="h-3.5 w-3.5" />}
          label="Flagged"
          count={counts[3].count ?? 0}
          active={flaggedTab}
        />
      </div>

      <div className="mt-6">
        {flaggedTab ? (
          <FlaggedReportsList items={flagged} />
        ) : (
          <CommunityReviewList
            items={(rows ?? []) as any[]}
            currentStatus={status}
          />
        )}
      </div>
    </div>
  );
}

function TabLink({
  href,
  icon,
  label,
  count,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300"
      }`}
    >
      {icon}
      {label}
      <span
        className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
          active
            ? "bg-white/20 text-white"
            : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}
