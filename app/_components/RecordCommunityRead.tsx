"use client";

import { useEffect } from "react";

/** Fires a single read-record ping when a community story is opened. No UI.
 *  Client-only so bots/crawlers that don't run JS never inflate the count;
 *  the server RPC dedupes per reader so refreshes don't recount. */
export default function RecordCommunityRead({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;
    fetch("/api/community/read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);
  return null;
}
