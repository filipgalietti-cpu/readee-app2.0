"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export interface AuditReview {
  id: string;
  item_type: string;
  item_id: string;
  grade: string | null;
  standard_id: string | null;
  status: "pass" | "fail" | "flag" | "up" | "down" | null;
  comment: string;
  user_id: string;
  reviewer_name: string;
  created_at: string;
  updated_at: string;
}

interface UpsertPayload {
  status?: AuditReview["status"];
  comment?: string;
  grade?: string;
  standardId?: string;
}

export function useAuditReviews(itemType: string) {
  const [allReviews, setAllReviews] = useState<AuditReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState("");
  const supabase = useRef(supabaseBrowser()).current;

  // Fetch user + profile + all reviews on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      // Get display_name from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile?.display_name) {
        setReviewerName(profile.display_name);
      }

      // Fetch all reviews for this item_type
      const { data: reviews } = await supabase
        .from("audit_reviews")
        .select("*")
        .eq("item_type", itemType);

      if (!cancelled && reviews) {
        setAllReviews(reviews as AuditReview[]);
      }
      if (!cancelled) setLoading(false);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [itemType, supabase]);

  // reviews grouped by item_id (all reviewers)
  const reviews: Record<string, AuditReview[]> = {};
  for (const r of allReviews) {
    if (!reviews[r.item_id]) reviews[r.item_id] = [];
    reviews[r.item_id].push(r);
  }

  // myReviews keyed by item_id (current user only)
  const myReviews: Record<string, AuditReview> = {};
  for (const r of allReviews) {
    if (r.user_id === userId) {
      myReviews[r.item_id] = r;
    }
  }

  const upsertReview = useCallback(
    async (itemId: string, payload: UpsertPayload) => {
      if (!userId) return;

      const row = {
        item_type: itemType,
        item_id: itemId,
        user_id: userId,
        reviewer_name: reviewerName,
        status: payload.status ?? null,
        comment: payload.comment ?? "",
        grade: payload.grade ?? null,
        standard_id: payload.standardId ?? null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("audit_reviews")
        .upsert(row, { onConflict: "item_type,item_id,user_id" })
        .select()
        .single();

      if (error) {
        console.error("upsertReview error:", error);
        return;
      }

      if (data) {
        setAllReviews((prev) => {
          const filtered = prev.filter(
            (r) =>
              !(r.item_id === itemId && r.user_id === userId),
          );
          return [...filtered, data as AuditReview];
        });
      }
    },
    [userId, reviewerName, itemType, supabase],
  );

  const deleteReview = useCallback(
    async (itemId: string) => {
      if (!userId) return;

      await supabase
        .from("audit_reviews")
        .delete()
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .eq("user_id", userId);

      setAllReviews((prev) =>
        prev.filter(
          (r) => !(r.item_id === itemId && r.user_id === userId),
        ),
      );
    },
    [userId, itemType, supabase],
  );

  const exportCsv = useCallback(
    (filename?: string) => {
      const rows = [
        "item_id,grade,standard_id,status,comment,reviewer,date",
      ];
      for (const r of allReviews) {
        const comment = (r.comment || "").replace(/"/g, '""');
        rows.push(
          `${r.item_id},${r.grade || ""},${r.standard_id || ""},${r.status || ""},` +
            `"${comment}",${r.reviewer_name},${r.updated_at}`,
        );
      }
      const blob = new Blob([rows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `${itemType}-audit.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [allReviews, itemType],
  );

  return {
    reviews,
    myReviews,
    loading,
    userId,
    reviewerName,
    upsertReview,
    deleteReview,
    exportCsv,
  };
}
