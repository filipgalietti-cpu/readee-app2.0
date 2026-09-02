"use client";

/**
 * Karaoke story reader — faithful port of the "Stories Hi-Fi" Claude Design
 * (project 30fe192f), driven by OUR real Whisper word-timing (not browser speech).
 *
 *   K–2 (mode "line"):  stacked sentences, current one ringed + centered, amber
 *                       word-highlight synced to audio, SLOW pacing, auto-play.
 *   3–4 (mode "prose"): whole paragraph shown readable; grey-out + word highlight
 *                       only after "Read it to me".
 * Reading, then the quiz, share ONE book spread — the quiz swaps the right pane.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAudio } from "@/lib/audio/use-audio";
import { FluentIcon } from "@/app/_components/FluentIcon";

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
  showQuiz?: boolean;
  quizSlot?: ReactNode;
  onBack: () => void;
  onFinishReading: () => void;
};

const GRADIENT = "linear-gradient(160deg,#e8e0ff 0%,#ffffff 45%,#e0ecff 100%)";
const MASK = "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)";
const LINE_H = 132;

// If a sentence got no aligned words (rare Whisper miss on whole-passage audio),
// fall back to its plain words so the text still renders (no karaoke).
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
  showQuiz,
  quizSlot,
  onBack,
  onFinishReading,
}: Props) {
  const { playUrl, stop } = useAudio();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [litWord, setLitWord] = useState(-1);
  const [usedAudio, setUsedAudio] = useState(false); // prose: has read-along begun
  const [displayCarrots, setDisplayCarrots] = useState(carrots ?? 0);
  const [carrotPop, setCarrotPop] = useState(false);
  const [flyers, setFlyers] = useState<{ id: string; sx: number; sy: number; dx: number; dy: number; delay: number }[]>([]);
  const prevCarrots = useRef(carrots ?? 0);
  const counterRef = useRef<HTMLSpanElement>(null);

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

  // Carrots tick up one-by-one (with a pop) when a correct answer bumps the total.
  useEffect(() => {
    if (typeof carrots !== "number") return;
    if (carrots > prevCarrots.current) {
      const rect = counterRef.current?.getBoundingClientRect();
      if (rect && typeof window !== "undefined") {
        const tx = rect.left + rect.width / 2;
        const ty = rect.top + rect.height / 2;
        const cx = window.innerWidth / 2;
        const sy = window.innerHeight * 0.58;
        const burst = Array.from({ length: 6 }).map((_, i) => {
          const sx = cx + (i - 2.5) * 24;
          return { id: `${carrots}-${i}`, sx, sy, dx: tx - sx, dy: ty - sy, delay: i * 45 };
        });
        setFlyers(burst);
        window.setTimeout(() => setFlyers([]), 1100);
      }
    }
    prevCarrots.current = carrots;
    const id = setInterval(() => {
      let reached = false;
      setDisplayCarrots((c) => {
        if (c >= carrots) { reached = true; return c; }
        return c + 1;
      });
      if (reached) { clearInterval(id); return; }
      setCarrotPop(true);
      window.setTimeout(() => setCarrotPop(false), 260);
    }, 90);
    return () => clearInterval(id);
  }, [carrots]);

  const isProse = karaoke?.mode === "prose";
  const sentences = useMemo(() => karaoke?.sentences ?? [], [karaoke]);

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
          if (i + 1 < sentences.length) playLine(i + 1);
          else setPlaying(false);
        }, endMs),
      );
    },
    [sentences, clearTimers, playUrl, scheduleWords, grade],
  );

  // Auto-play for K–2 on open.
  useEffect(() => {
    if (karaoke && !isProse && karaoke.autoplay) playLine(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [karaoke?.mode]);


  // ── Prose mode (3–4): read-along across the whole clip ──
  const startProse = useCallback(() => {
    if (!karaoke) return;
    clearTimers();
    setUsedAudio(true);
    setPlaying(true);
    if (karaoke.wholeAudio) playUrl(karaoke.wholeAudio);
    let maxEnd = 0;
    karaoke.sentences.forEach((s, si) => {
      const first = s.words[0];
      if (first) {
        timers.current.push(setTimeout(() => { setLineIdx(si); setLitWord(-1); }, first.start * 1000));
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
      <div className="fixed inset-x-0 bottom-0 top-[76px] z-10 overflow-y-auto lg:left-[272px]" style={{ background: GRADIENT, padding: "22px 28px 40px" }}>
        <div className="mx-auto max-w-2xl">
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
                <FluentIcon name="speaker" size={16} /> Listen
              </button>
              <button onClick={finish} className="mt-4 block w-full rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 py-4 text-base font-extrabold text-white shadow-sm active:scale-[0.98]">
                I&apos;m done reading →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const n = sentences.length;
  const progressPct = showQuiz ? 100 : isProse ? (usedAudio ? ((lineIdx + 1) / n) * 100 : 0) : ((lineIdx + 1) / n) * 100;

  return (
    <div className="fixed inset-x-0 bottom-0 top-[76px] z-10 overflow-y-auto lg:left-[272px]" style={{ background: GRADIENT, padding: "22px 28px 40px" }}>
      {flyers.map((f) => (
        <Flyer key={f.id} sx={f.sx} sy={f.sy} dx={f.dx} dy={f.dy} delay={f.delay} />
      ))}
      <div className="mx-auto" style={{ maxWidth: 1080 }}>
        {/* Top bar */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={back}
            aria-label="Back to library"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-zinc-200 bg-white transition hover:scale-105 active:scale-95"
            style={{ color: "#4338ca", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
          >
            <ArrowLeft className="h-[22px] w-[22px]" strokeWidth={2.5} />
          </button>
          <h1 className="flex-1 text-center text-2xl font-extrabold tracking-tight" style={{ color: "#1e1b4b", fontFamily: "var(--font-baloo, inherit)" }}>{title}</h1>
          {typeof carrots === "number" && (
            <span ref={counterRef} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-[7px] text-[15px] font-extrabold" style={{ background: "#fef3c7", color: "#b45309", animation: carrotPop ? "counterPop 0.28s ease" : undefined }}>
              <FluentIcon name="carrot" size={17} /> {displayCarrots}
            </span>
          )}
          {!showQuiz && !isProse && (
            <span className="hidden rounded-full px-3.5 py-[7px] text-sm font-extrabold sm:inline-flex" style={{ background: "rgba(255,255,255,0.85)", color: "#4338ca" }}>
              Line {Math.min(lineIdx + 1, n)} of {n}
            </span>
          )}
        </div>

        {/* Progress rail */}
        <div className="mt-3.5 h-[9px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "inset 0 1px 2px rgba(30,27,75,0.08)" }}>
          <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)" }} />
        </div>

        {/* Book spread */}
        <div className="relative mt-9 flex flex-col overflow-hidden md:flex-row" style={{ background: "#ffffff", borderRadius: 28, minHeight: 540, boxShadow: "0 10px 40px -12px rgba(49,46,129,0.28)" }}>
          <div className="h-[240px] w-full p-4 md:h-auto md:flex-[0_0_44%]" style={{ background: "#ede9fe" }}>
            <Image src={imageUrl} alt="Story illustration" width={600} height={600} className="mx-auto h-full w-full rounded-2xl object-contain" />
          </div>
          <div className="hidden md:block" style={{ flex: "0 0 3px", background: "linear-gradient(90deg, rgba(30,27,75,0.16), rgba(30,27,75,0.03))", boxShadow: "-4px 0 10px rgba(30,27,75,0.12)" }} />
          <div className="flex min-h-0 flex-1 flex-col" style={{ background: "#fffdf8", padding: "44px 40px 32px" }}>
            {showQuiz ? (
              <div className="flex min-h-0 flex-1 flex-col" style={{ animation: "pageIn 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
                {quizSlot}
              </div>
            ) : (
              <>
                {isProse ? (
                  /* 3–4: whole paragraph, grey-out only after read-along */
                  <div className="flex flex-1 items-center" style={{ padding: "4px 2px" }}>
                    <p className="text-[20px] font-bold" style={{ lineHeight: 1.85, color: "#d4d4d8" }}>
                      {sentences.map((s, si) => {
                        const d = si - lineIdx;
                        const color = !usedAudio ? "#3f3f46" : si === lineIdx ? "#1e1b4b" : d < 0 ? "#a1a1aa" : "#c4c4cc";
                        return (
                          <span key={si} style={{ color, borderRadius: 10, transition: "color 0.35s ease" }}>
                            {wordsOf(s).map((w, wi) => (
                              <span key={wi} style={{ background: usedAudio && playing && si === lineIdx && wi === litWord ? "#fde68a" : "transparent", borderRadius: 6, padding: "1px 2px", transition: "background 0.18s ease" }}>
                                {w.t}{" "}
                              </span>
                            ))}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                ) : (
                  /* K–2: stacked lines, current sentence ringed + amber word karaoke */
                  <div className="relative min-h-0 flex-1 overflow-hidden" style={{ minHeight: 396, WebkitMaskImage: MASK, maskImage: MASK }}>
                    <div className="absolute inset-x-0 flex flex-col" style={{ top: "50%", transform: `translateY(${-(lineIdx * LINE_H + LINE_H / 2)}px)`, transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)" }}>
                      {sentences.map((s, i) => {
                        const cur = i === lineIdx;
                        const d = i - lineIdx;
                        return (
                          <div
                            key={i}
                            style={{
                              height: LINE_H,
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              alignContent: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              borderRadius: 16,
                              padding: "10px 18px",
                              lineHeight: 1.4,
                              fontWeight: 800,
                              background: cur ? "#eef2ff" : "transparent",
                              boxShadow: cur ? "inset 0 0 0 2px #c7d2fe" : "none",
                              color: cur ? "#1e1b4b" : d < 0 ? "#a1a1aa" : "#c4c4cc",
                              fontSize: cur ? 26 : 20,
                              opacity: cur ? 1 : Math.abs(d) === 1 ? 0.78 : 0.32,
                              transform: cur ? "scale(1)" : "scale(0.97)",
                              transition: "background 0.45s ease, box-shadow 0.45s ease, color 0.45s ease, font-size 0.45s ease, opacity 0.45s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                            }}
                          >
                            {cur
                              ? wordsOf(s).map((w, wi) => (
                                  <span key={wi} style={{ display: "inline-block", borderRadius: 7, padding: "1px 3px", margin: "0 4px 0 0", background: playing && wi === litWord ? "#fde68a" : "transparent", transition: "background 0.18s ease" }}>
                                    {w.t}
                                  </span>
                                ))
                              : s.text}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-between gap-4" style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid #f0ece1" }}>
                  <button
                    onClick={isProse ? toggleProse : () => playLine(0)}
                    className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full text-[15px] font-extrabold transition hover:-translate-y-0.5 active:scale-95"
                    style={{ height: 52, padding: "0 20px", background: playing ? "#6d28d9" : "#ede9fe", color: playing ? "#fff" : "#6d28d9" }}
                  >
                    <FluentIcon name="speaker" size={20} />
                    {isProse ? (playing ? "Stop reading" : "Read it to me") : "Play again"}
                  </button>

                  <button
                    onClick={finish}
                    className="inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full font-extrabold text-white transition hover:-translate-y-0.5 active:scale-95"
                    style={{ height: 60, minWidth: 208, padding: "0 30px", fontSize: 21, fontFamily: "var(--font-baloo, inherit)", background: "linear-gradient(90deg,#4338ca,#7c3aed)", boxShadow: "0 8px 22px rgba(67,56,202,0.35)" }}
                  >
                    <span className="flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: "rgba(255,255,255,0.2)" }}>
                      <ArrowRight className="h-[17px] w-[17px]" strokeWidth={3} />
                    </span>
                    Take the quiz
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// A single carrot that floats from the answer area to the top-bar counter.
function Flyer({ sx, sy, dx, dy, delay }: { sx: number; sy: number; dx: number; dy: number; delay: number }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), delay + 20);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <FluentIcon name="carrot" size={28} />
  );
}
