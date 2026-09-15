"use client";
import { useEffect, useState } from "react";
export function useApprovedUnitProgress(child: string | undefined | null): {
  enabled: boolean;
  completed: string[];
} {
  const [value, setValue] = useState<{
    child: string;
    enabled: boolean;
    completed: string[];
  } | null>(null);
  useEffect(() => {
    if (!child) return;
    const ac = new AbortController();
    fetch(`/api/approved-unit?child=${encodeURIComponent(child)}`, {
      cache: "no-store",
      signal: ac.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => {
        if (r)
          setValue({
            child,
            enabled: r.enabled === true,
            completed: Array.isArray(r.completed) ? r.completed : [],
          });
      })
      .catch(() => {});
    return () => ac.abort();
  }, [child]);
  return value && value.child === child ? value : { enabled: false, completed: [] };
}
