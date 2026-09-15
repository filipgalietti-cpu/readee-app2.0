"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function JourneyEntry({ child }: { child: string }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/approved-unit", { signal: ac.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => setEnabled(r?.enabled === true))
      .catch(() => {});
    return () => ac.abort();
  }, []);
  return enabled ? (
    <Link
      href={`/learn/unit-one?child=${encodeURIComponent(child)}`}
      className="mx-5 mb-4 block rounded-2xl bg-violet-50 p-4 font-bold text-violet-800"
    >
      Open Kindergarten Unit 1 →
    </Link>
  ) : null;
}
