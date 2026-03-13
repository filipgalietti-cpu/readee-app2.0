"use client";

import type { AuditReview } from "@/lib/audit/use-audit-reviews";

const STATUS_ICON: Record<string, string> = {
  up: "\uD83D\uDC4D",
  down: "\uD83D\uDC4E",
  pass: "\u2713",
  fail: "\u2717",
  flag: "\uD83D\uDEA9",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ReviewList({
  reviews,
  currentUserId,
}: {
  reviews: AuditReview[];
  currentUserId?: string | null;
}) {
  if (!reviews || reviews.length === 0) return null;

  const sorted = [...reviews].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  return (
    <div className="space-y-1.5">
      {sorted.map((r) => {
        const isMe = r.user_id === currentUserId;
        const icon = r.status ? STATUS_ICON[r.status] || "" : "";
        return (
          <div
            key={r.id}
            className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-sm ${
              isMe
                ? "bg-indigo-50 border border-indigo-100"
                : "bg-gray-50 border border-gray-100"
            }`}
          >
            <span className="font-semibold text-gray-700 shrink-0">
              [{r.reviewer_name || "Unknown"}]
            </span>
            {icon && <span className="shrink-0">{icon}</span>}
            {r.comment && (
              <span className="text-gray-600 flex-1">
                &ldquo;{r.comment}&rdquo;
              </span>
            )}
            <span className="text-xs text-gray-400 shrink-0 ml-auto">
              {timeAgo(r.updated_at)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
