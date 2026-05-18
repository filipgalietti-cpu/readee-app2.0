import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { OUTFITS } from "@/app/_components/Bunny/outfits";

export const dynamic = "force-static";

export const metadata = {
  title: "Bunny outfits — preview",
  robots: { index: false, follow: false },
};

const REACTIONS = [
  {
    state: "correct" as const,
    title: "Correct answer",
    sub: "Plays when a kid answers a question correctly.",
    tint: "#DDF0E5",
    border: "#A8D2A4",
    accent: "#3F8E5C",
    duration: "5.0s loop",
    phases: ["breathing", "celebration hop", "breathing"],
    weights: [28, 44, 28],
  },
  {
    state: "incorrect" as const,
    title: "Incorrect answer",
    sub: "Plays when a kid answers a question incorrectly.",
    tint: "#FFE9D7",
    border: "#F2C58F",
    accent: "#C8722B",
    duration: "5.0s loop",
    phases: ["breathing", "head scratch", "breathing"],
    weights: [28, 44, 28],
  },
  {
    state: "levelup" as const,
    title: "Lesson complete",
    sub: "Plays at the end of a lesson and on level-ups.",
    tint: "#ECE7FF",
    border: "#C9BEFF",
    accent: "#4A3BCC",
    duration: "6.5s loop",
    phases: ["breathing", "dance + confetti", "breathing"],
    weights: [22, 56, 22],
  },
];

export default function BunnyShowcase() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50/60 via-white to-rose-50/40">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-700 shadow-sm">
            Bunny outfits preview
          </div>
          <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
            10 collectible <span className="text-violet-600">Readee bunnies.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
            Same bunny, ten skins. Locked anatomy across the set — only
            shirts, hats, and capes change. Pick one in the shop, see it
            celebrate, scratch its head, and dance at the end of every lesson.
          </p>
        </header>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">Outfits</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {OUTFITS.map((outfit) => {
              const isRare = outfit.rarity === "rare";
              const isStarter = outfit.rarity === "starter";
              return (
                <div
                  key={outfit.id}
                  className="relative flex flex-col rounded-2xl border-2 p-4 pb-5"
                  style={{
                    background: outfit.tint,
                    borderColor: outfit.border,
                    boxShadow: isRare
                      ? `0 12px 28px -8px ${outfit.border}`
                      : "0 6px 14px -8px rgba(40,30,60,.18)",
                  }}
                >
                  {isRare && (
                    <span className="absolute left-3 top-3 z-10 rounded-md bg-violet-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                      Rare
                    </span>
                  )}
                  {isStarter && (
                    <span
                      className="absolute left-3 top-3 z-10 rounded-md border bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-violet-700"
                      style={{ borderColor: outfit.border }}
                    >
                      Starter
                    </span>
                  )}
                  <div className="relative aspect-[1/1.05] w-full">
                    <Bunny outfitId={outfit.id} showRareSparkle={isRare} />
                  </div>
                  <div className="mt-1 text-center">
                    <div className="text-[13px] font-bold tracking-tight text-zinc-900">{outfit.name}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-zinc-500">
                      {isStarter ? "free" : `${outfit.price} carrots`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">Reaction states</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Each loop plays{" "}
            <span className="font-mono text-xs">breathing → action → breathing</span>{" "}
            so the full cycle is visible without triggering anything.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {REACTIONS.map((rx) => (
              <div
                key={rx.state}
                className="flex flex-col gap-3 rounded-3xl border-2 p-5"
                style={{ background: rx.tint, borderColor: rx.border }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold tracking-tight text-zinc-900">{rx.title}</div>
                    <div className="mt-0.5 text-xs text-zinc-600">{rx.sub}</div>
                  </div>
                  <span
                    className="rounded-full border bg-white/70 px-2 py-1 font-mono text-[10px] font-bold"
                    style={{ color: rx.accent, borderColor: rx.border }}
                  >
                    {rx.duration}
                  </span>
                </div>
                <div className="relative min-h-0 flex-1 aspect-[1/1.05]">
                  <BunnyReaction outfitId="classic" state={rx.state} />
                </div>
                <div>
                  <div
                    className="flex h-1.5 overflow-hidden rounded-full"
                    style={{ background: "rgba(255,255,255,.55)", border: `1px solid ${rx.border}` }}
                  >
                    <span style={{ flex: rx.weights[0], background: "rgba(110,91,255,.18)" }} />
                    <span style={{ flex: rx.weights[1], background: rx.accent }} />
                    <span style={{ flex: rx.weights[2], background: "rgba(110,91,255,.18)" }} />
                  </div>
                  <div className="mt-1 flex justify-between font-mono text-[9.5px] text-zinc-500">
                    <span>{rx.phases[0]}</span>
                    <span className="font-bold" style={{ color: rx.accent }}>
                      {rx.phases[1]}
                    </span>
                    <span>{rx.phases[2]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">
            QA sheet — all {OUTFITS.length} bunnies dancing
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Every outfit looping the lesson-complete dance. Use this to spot
            anatomy bugs (tail not attached, hat clipping ears, hands
            disconnected, etc.) and report by <span className="font-mono text-[12px]">outfit_id</span>.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {OUTFITS.map((outfit) => (
              <div
                key={outfit.id}
                className="flex flex-col gap-2 rounded-2xl border-2 p-3"
                style={{ background: outfit.tint, borderColor: outfit.border }}
              >
                <div className="text-center">
                  <div className="text-[13px] font-bold tracking-tight text-zinc-900">
                    {outfit.name}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500 select-all">
                    {outfit.id}
                  </div>
                </div>
                <div className="relative aspect-[1/1.1] w-full">
                  <BunnyReaction outfitId={outfit.id} state="levelup" />
                </div>
                <div className="text-center font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                  levelup · {outfit.unlock.type}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
