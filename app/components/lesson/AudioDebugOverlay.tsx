"use client";

// TEMP debug overlay for the lesson-audio silence investigation. Renders a
// live readout of audioManager's recent events + a direct "TEST SOUND" button
// (plays a known file straight from a tap) so we can isolate whether Howler
// works at all vs. the scheduling/autoplay path. Remove once resolved.
import { useEffect, useState } from "react";
import { audioManager } from "@/lib/audio/audio-manager";
import { useAudioStore } from "@/lib/stores/audio-store";

const TEST_URL =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/audio/lessons/RF.2.3b/S1a.mp3";

export default function AudioDebugOverlay() {
  const [lines, setLines] = useState<string[]>([]);
  const muted = useAudioStore((s) => s.isMuted);

  useEffect(() => {
    const t = setInterval(() => setLines([...(audioManager?.debugLog ?? [])]), 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed", bottom: 8, left: 8, zIndex: 99999,
        background: "rgba(0,0,0,.88)", color: "#e5e5e5",
        font: "11px/1.45 ui-monospace,Menlo,monospace",
        padding: 10, maxWidth: 400, borderRadius: 8, border: "1px solid #444",
      }}
    >
      <div style={{ color: "#fff", marginBottom: 6, fontWeight: 700 }}>
        AUDIO DEBUG · muted={String(muted)}
      </div>
      <button
        type="button"
        onClick={() => audioManager?.play(TEST_URL)}
        style={{
          marginBottom: 8, background: "#4338ca", color: "#fff", border: "none",
          borderRadius: 6, padding: "7px 14px", cursor: "pointer",
          font: "12px ui-monospace,monospace",
        }}
      >
        ▶ TEST SOUND
      </button>
      {lines.length === 0 ? (
        <div style={{ color: "#888" }}>(no audio calls yet — tap the lesson or TEST SOUND)</div>
      ) : (
        lines.map((l, i) => (
          <div
            key={i}
            style={{ color: l.includes("ERROR") ? "#f87171" : l.includes("PLAYING") ? "#4ade80" : "#cbd5e1" }}
          >
            {l}
          </div>
        ))
      )}
    </div>
  );
}
