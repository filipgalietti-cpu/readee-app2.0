"use client";

/**
 * LunaCreate — the premium "make me a story about ___" flow. The kid (or
 * parent) picks a topic; Luna generates a passage that's decodable to the
 * kid's level (via /api/luna/passage → generatePassage), then hands it
 * straight to the orb reader for an Azure-graded read. No images — the orb
 * and the words ARE the experience.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Wand2, RefreshCw, Lock } from "lucide-react";
import LunaOrb from "./LunaOrb";
import LunaReader from "./LunaReader";

type LunaPassage = { grade: string; title: string; text: string };

// Big, tappable topic starters. Kid agency = the wow. No native emojis
// (Lucide/text only) per the design rules.
const TOPICS = [
  "Animals",
  "Space",
  "Dinosaurs",
  "Sports",
  "Ocean",
  "Magic",
  "Trucks & diggers",
  "Something funny",
];

type Phase = "pick" | "generating" | "reading" | "error";

export default function LunaCreate({
  childId,
  childName,
  grade,
}: {
  childId: string;
  childName: string;
  grade: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pick");
  const [passage, setPassage] = useState<LunaPassage | null>(null);
  const [custom, setCustom] = useState("");
  const [errKind, setErrKind] = useState<"upgrade" | "gen" | null>(null);

  async function generate(topic: string) {
    setPhase("generating");
    setErrKind(null);
    try {
      const r = await fetch("/api/luna/passage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ childId, topic, gradeLevel: grade }),
      });
      if (r.status === 402) {
        setErrKind("upgrade");
        setPhase("error");
        return;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      if (!j?.passage?.text) throw new Error("no passage");
      setPassage({
        grade: j.passage.grade ?? grade,
        title: j.passage.title ?? "Your story",
        text: j.passage.text,
      });
      setPhase("reading");
    } catch {
      setErrKind("gen");
      setPhase("error");
    }
  }

  // Once we have a passage, hand off to the real orb/Azure reader.
  if (phase === "reading" && passage) {
    return (
      <LunaReader childId={childId} childName={childName} passages={[passage]} />
    );
  }

  const thinking = phase === "generating";

  return (
    <div className="flex flex-col items-center text-center">
      <LunaOrb mode={thinking ? "thinking" : "idle"} size={200} />

      {thinking ? (
        <p
          className="mt-6 text-lg font-extrabold text-violet-700 dark:text-violet-300"
          style={{ fontFamily: "'Baloo 2','Nunito',sans-serif" }}
        >
          Luna is writing your story…
        </p>
      ) : phase === "error" ? (
        <div className="mt-6">
          {errKind === "upgrade" ? (
            <>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                <Lock className="h-3 w-3" />
                Readee+
              </div>
              <h2
                className="mt-2 text-xl font-extrabold text-zinc-900 dark:text-white"
                style={{ fontFamily: "'Baloo 2','Nunito',sans-serif" }}
              >
                Make unlimited stories with Luna
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
                Luna writes a new story about anything {childName} loves — at
                their exact reading level — and coaches every word.
              </p>
              <Link
                href="/upgrade?reason=reading_buddy"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                Unlock Luna
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-zinc-600 dark:text-slate-300">
                Luna couldn&apos;t finish that one. Let&apos;s try again.
              </p>
              <button
                type="button"
                onClick={() => setPhase("pick")}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-5 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <h2
            className="mt-6 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white"
            style={{ fontFamily: "'Baloo 2','Nunito',sans-serif" }}
          >
            What should your story be about, {childName}?
          </h2>
          <p className="mt-1 text-sm font-semibold text-zinc-500 dark:text-slate-400">
            Pick one and Luna writes a story just for you.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => generate(t)}
                className="rounded-full border-2 border-violet-100 bg-white px-4 py-2 text-sm font-bold text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
              >
                {t}
              </button>
            ))}
          </div>

          {/* Parent / older-kid free text */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = custom.trim();
              if (v) generate(v);
            }}
            className="mt-5 flex w-full max-w-md items-center gap-2"
          >
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              maxLength={200}
              placeholder="…or type your own idea"
              className="flex-1 rounded-full border-2 border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 outline-none transition focus:border-violet-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!custom.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-default disabled:opacity-40"
            >
              <Wand2 className="h-4 w-4" />
              Make it
            </button>
          </form>

          {/* Surprise me = a free, instant premade read (no generation), so
              free readers still get a taste; custom topics above are the
              premium generated path. */}
          <button
            type="button"
            onClick={() => router.push(`/luna/read?child=${childId}`)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 transition hover:text-violet-800 dark:text-violet-300"
          >
            <Sparkles className="h-4 w-4" />
            Surprise me
          </button>
        </>
      )}
    </div>
  );
}
