"use client";

/**
 * Karaoke story reader — the redesigned Stories reading experience.
 *
 *   K–2 (mode "line"):  one sentence centered at a time, amber word-highlight
 *                       synced to real audio timing, SLOW pacing. K–2 auto-play.
 *   3–4 (mode "prose"): whole paragraph shown fully readable; grey-out + word
 *                       highlight only start when the reader taps "Read it to me".
 *
 * Word timing comes from app/data/stories-karaoke.json (Whisper forced-
 * alignment — same tech as lesson karaoke), NOT browser speech.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, Play, Pause, Check, ArrowLeft, Carrot } from "lucide-react";
import { useAudio } from "@/lib/audio/use-audio";

export type KaraokeWord = { t: string; start: number; end: number };
export type KaraokeSentence = { text: string; audioUrl?: string; words: KaraokeWord[] };
export type StoryKaraoke = {
  mode: "line" | "prose";
  autoplay: boolean;
  wholeAudio?: string;
  sentences: KaraokeSentence[];
};

type Props = {
  title: string;
  grade: string;
  imageUrl: string;
  fallbackText: string;
  fallbackAudioUrl: string;
  karaoke?: StoryKaraoke;
  carrots?: number;
  onBack: () => void;
  onFinishReading: () => void;
};

// If a sentence got no aligned words (rare Whisper miss on whole-passage
// audio), fall back to its plain words so the text still renders (no karaoke).
function wordsOf(s: KaraokeSentence): KaraokeWord[] {
  return s.words && s.words.length
    ? s.words
    : s.text.split(/\s+/).filter(Boolean).map((t) => ({ t, start: 0, end: 0 }));
}

// Slower inter-sentence breath for the youngest readers.
function sentencePauseMs(grade: string): number {
  if (grade === "kindergarten" || grade === "1st") return 1500;
  if (grade === "2nd") return 1000;
  return 700;
}

export default function StoryKaraokeReader({
  title,
  grade,
  imageUrl,
  fallbackText,
  fallbackAudioUrl,
  karaoke,
  carrots,
  onBack,
  onFinishReading,
}: Props) {
  const { playUrl, stop } = useAudio();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [litWord, setLitWord] = useState(-1);
  const [usedAudio, setUsedAudio] = useState(false); // prose: has read-along begun

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const halt = useCallback(() => {
    clearTimers();
    stop();
    setPlaying(false);
    setLitWord(-1);
  }, [clearTimers, stop]);

  useEffect(() => () => halt(), [halt]); // cleanup on unmount

  const isProse = karaoke?.mode === "prose";
  const sentences = useMemo(() => karaoke?.sentences ?? [], [karaoke]);

  // Schedule the amber word-highlight for one sentence's words, offset by `base` ms.
  const scheduleWords = useCallback((words: KaraokeWord[], base = 0) => {
    words.forEach((w, wi) => {
      timers.current.push(setTimeout(() => setLitWord(wi), base + Math.max(0, w.start * 1000)));
    });
  }, []);

  // ── Line mode (K–2): play one sentence, then auto-advance ──
  const playLine = useCallback(
    (i: number) => {
      clearTimers();
      const s = sentences[i];
      if (!s) return;
      setLineIdx(i);
      setPlaying(true);
      setLitWord(-1);
      if (s.audioUrl) playUrl(s.audioUrl);
      scheduleWords(s.words);
      const last = s.words[s.words.length - 1];
      const endMs = (last ? last.end * 1000 : 2500) + sentencePauseMs(grade);
      timers.current.push(
        setTimeout(() => {
          setLitWord(-1);
          if (i + 1 < sentences.length) {
            playLine(i + 1);
          } else {
            setPlaying(false);
          }
        }, endMs),
      );
    },
    [sentences, clearTimers, playUrl, scheduleWords, grade],
  );

  // Auto-play for K–2 on open.
  useEffect(() => {
    if (karaoke && !isProse && karaoke.autoplay) {
      playLine(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [karaoke?.mode]);

  const toggleLinePlay = () => {
    if (playing) {
      halt();
    } else {
      playLine(lineIdx >= sentences.length ? 0 : lineIdx);
    }
  };
  const replayLine = () => playLine(lineIdx);

  // ── Prose mode (3–4): read-along across the whole clip ──
  const startProse = useCallback(() => {
    if (!karaoke) return;
    clearTimers();
    setUsedAudio(true);
    setPlaying(true);
    if (karaoke.wholeAudio) playUrl(karaoke.wholeAudio);
    // Highlight sentence-by-sentence; each word's start is an absolute offset
    // into the whole recording.
    let maxEnd = 0;
    karaoke.sentences.forEach((s, si) => {
      const first = s.words[0];
      if (first) {
        timers.current.push(
          setTimeout(() => {
            setLineIdx(si);
            setLitWord(-1);
          }, first.start * 1000),
        );
      }
      s.words.forEach((w, wi) => {
        timers.current.push(setTimeout(() => setLitWord(wi), w.start * 1000));
        maxEnd = Math.max(maxEnd, w.end * 1000);
      });
    });
    timers.current.push(setTimeout(() => { setPlaying(false); setLitWord(-1); }, maxEnd + 400));
  }, [karaoke, clearTimers, playUrl]);

  const toggleProse = () => (playing ? halt() : startProse());

  const back = () => { halt(); onBack(); };
  const finish = () => { halt(); onFinishReading(); };

  // ── Graceful fallback if this story has no karaoke data yet ──
  if (!karaoke || sentences.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <button onClick={back} className="mb-4 flex items-center gap-1 text-sm font-semibold text-violet-600">
          <ArrowLeft className="h-4 w-4" /> Back to Stories
        </button>
        <div className="overflow-hidden rounded-3xl bg-white shadow-md">
          <Image src={imageUrl} alt="" width={640} height={360} className="aspect-video w-full bg-violet-50 object-contain" />
          <div className="p-6">
            <h1 className="mb-3 text-xl font-extrabold text-zinc-900">{title}</h1>
            <div className="space-y-2">
              {fallbackText.split(/(?<=[.!?"])\s+/).map((s, i) => (
                <p key={i} className="text-base leading-relaxed text-zinc-700">{s}</p>
              ))}
            </div>
            <button onClick={() => playUrl(fallbackAudioUrl)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-100">
              <Volume2 className="h-4 w-4" /> Listen
            </button>
            <button onClick={finish} className="mt-4 block w-full rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-600 py-4 text-base font-extrabold text-white shadow-sm active:scale-[0.98]">
              I&apos;m done reading →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const n = sentences.length;
  const atEnd = lineIdx >= n - 1 && !playing;
  const progressPct = isProse ? (usedAudio ? ((lineIdx + 1) / n) * 100 : 0) : ((lineIdx + 1) / n) * 100;
  const LINE_H = 132;
  const MASK = "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] w-full px-4 pb-10 pt-6 md:px-7"
      style={{ background: "linear-gradient(160deg,#e8e0ff 0%,#ffffff 45%,#e0ecff 100%)" }}
    >
     <div className="mx-auto" style={{ maxWidth: 1080 }}>
      {/* Top bar */}
      <div className="mb-3 flex items-center gap-3">
        <button onClick={back} className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white shadow-sm" style={{ color: "#4338ca" }}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-extrabold" style={{ color: "#1e1b4b", fontFamily: "var(--font-baloo, inherit)" }}>{title}</h1>
        {typeof carrots === "number" && (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-extrabold" style={{ background: "#fef3c7", color: "#b45309" }}>
            <Carrot className="h-4 w-4" style={{ color: "#f97316" }} /> {carrots}
          </span>
        )}
        {!isProse && (
          <span className="hidden rounded-full px-3 py-1.5 text-sm font-bold sm:inline-block" style={{ background: "rgba(255,255,255,0.85)", color: "#4338ca" }}>
            Line {Math.min(lineIdx + 1, n)} of {n}
          </span>
        )}
      </div>

      {/* Progress rail */}
      <div className="mb-4 h-[9px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.75)" }}>
        <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", transition: "width 0.4s" }} />
      </div>

      {/* Book spread */}
      <div className="flex flex-col overflow-hidden bg-white shadow-xl md:flex-row" style={{ borderRadius: 28, minHeight: 540 }}>
        <div className="md:w-[44%]">
          <Image src={imageUrl} alt="" width={720} height={720} className="h-60 w-full bg-[#ede9fe] object-cover md:h-full" style={{ objectPosition: "center 15%" }} />
        </div>
        <div className="hidden md:block" style={{ flex: "0 0 3px", background: "linear-gradient(90deg, rgba(0,0,0,0.07), rgba(0,0,0,0))" }} />
        <div className="flex flex-1 flex-col justify-between" style={{ background: "#fffdf8", padding: "44px 40px 32px" }}>
          {isProse ? (
            /* ── 3–4: whole paragraph, grey-out only after read-along ── */
            <div className="flex-1 overflow-y-auto">
              <p className="text-[20px] font-bold leading-[1.85]" style={{ color: "#d4d4d8" }}>
                {sentences.map((s, si) => {
                  const d = si - lineIdx;
                  const color = !usedAudio ? "#3f3f46" : si === lineIdx ? "#1e1b4b" : d < 0 ? "#a1a1aa" : "#c4c4cc";
                  return (
                    <span key={si} style={{ color, transition: "color 0.4s" }}>
                      {wordsOf(s).map((w, wi) => (
                        <span
                          key={wi}
                          style={{
                            background: usedAudio && playing && si === lineIdx && wi === litWord ? "#fde68a" : "transparent",
                            borderRadius: 6,
                            padding: "1px 3px",
                            transition: "background 0.18s ease",
                          }}
                        >
                          {w.t}{" "}
                        </span>
                      ))}
                    </span>
                  );
                })}
              </p>
            </div>
          ) : (
            /* ── K–2: stacked lines, current sentence ringed + amber word karaoke ── */
            <div className="relative flex-1 overflow-hidden" style={{ minHeight: 396, WebkitMaskImage: MASK, maskImage: MASK }}>
              <div
                className="absolute inset-x-0 top-0"
                style={{ transform: `translateY(${LINE_H - lineIdx * LINE_H}px)`, transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)" }}
              >
                {sentences.map((s, i) => {
                  const cur = i === lineIdx;
                  const d = i - lineIdx;
                  return (
                    <div
                      key={i}
                      className="mx-auto flex items-center justify-center text-center"
                      style={{
                        height: LINE_H,
                        maxWidth: "94%",
                        borderRadius: 16,
                        padding: "0 20px",
                        background: cur ? "#eef2ff" : "transparent",
                        boxShadow: cur ? "inset 0 0 0 2px #c7d2fe" : "none",
                        color: cur ? "#1e1b4b" : d < 0 ? "#a1a1aa" : "#c4c4cc",
                        fontSize: cur ? 26 : 20,
                        fontWeight: 800,
                        opacity: cur ? 1 : Math.abs(d) === 1 ? 0.78 : 0.32,
                        transform: cur ? "scale(1)" : "scale(0.97)",
                        transition: "all 0.35s ease",
                      }}
                    >
                      {cur ? (
                        <span>
                          {wordsOf(s).map((w, wi) => (
                            <span
                              key={wi}
                              style={{
                                background: playing && wi === litWord ? "#fde68a" : "transparent",
                                borderRadius: 7,
                                padding: "2px 4px",
                                transition: "background 0.18s ease",
                              }}
                            >
                              {w.t}{" "}
                            </span>
                          ))}
                        </span>
                      ) : (
                        s.text
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5" style={{ borderColor: "#f0ece1" }}>
            <button
              onClick={isProse ? toggleProse : replayLine}
              className="inline-flex items-center gap-2 rounded-full px-5 text-sm font-bold transition"
              style={{ height: 52, background: playing ? "#6d28d9" : "#ede9fe", color: playing ? "#fff" : "#6d28d9" }}
            >
              <Volume2 className="h-4 w-4" />
              {isProse ? (playing ? "Stop reading" : "Read it to me") : "Listen again"}
            </button>

            <button
              onClick={isProse || atEnd ? finish : toggleLinePlay}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 font-extrabold text-white shadow-md active:scale-[0.98]"
              style={{ height: 60, minWidth: 208, fontSize: 21, background: "linear-gradient(90deg,#4338ca,#7c3aed)", fontFamily: "var(--font-baloo, inherit)" }}
            >
              {isProse ? (
                <><Check className="h-5 w-5" /> I&apos;m done reading</>
              ) : atEnd ? (
                <><Check className="h-5 w-5" /> Go to questions</>
              ) : playing ? (
                <><Pause className="h-5 w-5" /> Pause</>
              ) : (
                <><Play className="h-5 w-5" /> {lineIdx > 0 ? "Keep reading" : "Play story"}</>
              )}
            </button>
          </div>
          {!isProse && !atEnd && (
            <button onClick={finish} className="mt-3 self-center text-sm font-semibold underline" style={{ color: "#6d28d9" }}>
              Skip to questions
            </button>
          )}
        </div>
      </div>
     </div>
    </div>
  );
}
