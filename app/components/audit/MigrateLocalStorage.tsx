"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface ParsedRow {
  item_id: string;
  status: string | null;
  comment: string;
  grade?: string;
  standard_id?: string;
}

interface MigrateProps {
  localStorageKey: string;
  itemType: string;
  /** Parse individual key/value entries from localStorage JSON */
  parseEntry?: (key: string, value: any) => ParsedRow | null;
  /** Parse the entire localStorage blob at once (for non-flat formats) */
  parseBulk?: (data: any) => ParsedRow[];
}

export function MigrateLocalStorage({
  localStorageKey,
  itemType,
  parseEntry,
  parseBulk,
}: MigrateProps) {
  const [count, setCount] = useState(0);
  const [migrating, setMigrating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(localStorageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (parseBulk) {
        setCount(parseBulk(data).length);
      } else if (parseEntry) {
        let n = 0;
        for (const [k, v] of Object.entries(data)) {
          if (parseEntry(k, v)) n++;
        }
        setCount(n);
      }
    } catch {}
  }, [localStorageKey, parseEntry, parseBulk]);

  if (count === 0 || done) return null;

  async function migrate() {
    setMigrating(true);
    setError("");

    try {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not logged in");
        setMigrating(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      const reviewerName = profile?.display_name || "";

      const raw = localStorage.getItem(localStorageKey);
      if (!raw) return;
      const data = JSON.parse(raw);

      let parsed: ParsedRow[] = [];
      if (parseBulk) {
        parsed = parseBulk(data);
      } else if (parseEntry) {
        for (const [k, v] of Object.entries(data)) {
          const p = parseEntry(k, v);
          if (p) parsed.push(p);
        }
      }

      const rows = parsed.map((p) => ({
        item_type: itemType,
        item_id: p.item_id,
        status: p.status,
        comment: p.comment || "",
        grade: p.grade || null,
        standard_id: p.standard_id || null,
        user_id: user.id,
        reviewer_name: reviewerName,
        updated_at: new Date().toISOString(),
      }));

      // Batch upsert in chunks of 50
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50);
        const { error: upsertError } = await supabase
          .from("audit_reviews")
          .upsert(chunk, { onConflict: "item_type,item_id,user_id" });
        if (upsertError) {
          setError(`Failed at row ${i}: ${upsertError.message}`);
          setMigrating(false);
          return;
        }
      }

      localStorage.removeItem(localStorageKey);
      setDone(true);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    }

    setMigrating(false);
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 flex items-center gap-3">
      <span className="text-amber-700 text-sm">
        Found <strong>{count}</strong> local reviews to migrate to Supabase.
      </span>
      <button
        onClick={migrate}
        disabled={migrating}
        className="ml-auto px-4 py-1.5 text-sm font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
      >
        {migrating ? "Migrating..." : "Migrate Now"}
      </button>
      {error && (
        <span className="text-red-600 text-xs">{error}</span>
      )}
    </div>
  );
}
