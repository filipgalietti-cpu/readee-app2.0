"use client";

/**
 * /demo/bunny-render?outfit=bunny_robot&state=wave — one bunny in one
 * outfit and pose on a transparent 320x360 stage, for the email renderer
 * (scripts/render-email-bunnies.mjs screenshots the frame to PNG). Dev-only.
 */
import { useEffect, useState } from "react";
import { Bunny, BunnyReaction, type ReactionState } from "@/app/_components/Bunny/Bunny";

export default function BunnyRenderPage() {
  const [q, setQ] = useState<{ outfit: string; state: string } | null>(null);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQ({ outfit: sp.get("outfit") ?? "bunny_classic", state: sp.get("state") ?? "idle" });
    // The site body paints white (globals.css); a transparent screenshot needs the whole chain clear.
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_PLACEMENT_DEMO !== "1") return null;
  if (!q) return null;
  return (
    <main style={{ background: "transparent", margin: 0, padding: 24 }}>
      <div data-frame style={{ width: 320, height: 360, background: "transparent" }}>
        {q.state === "idle" ? <Bunny outfitId={q.outfit} /> : <BunnyReaction outfitId={q.outfit} state={q.state as ReactionState} />}
      </div>
    </main>
  );
}
