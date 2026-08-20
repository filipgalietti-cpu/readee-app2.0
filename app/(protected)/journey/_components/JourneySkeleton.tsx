"use client";

/**
 * Full-page skeleton for the Reading Journey — mirrors JourneyMap's layout (sky
 * gradient, top-right stat chips, centered title, and a winding column of node
 * placeholders) so the page loads as a calm silhouette, then reveals the real
 * map. Uses the same negative top margin as JourneyMap to fill under the nav.
 */
export default function JourneySkeleton() {
  const nodes = Array.from({ length: 7 }, (_, i) => i);
  return (
    <div
      style={{ position: "relative", minHeight: "100vh", overflowX: "clip", marginTop: -8, paddingTop: 8 }}
      aria-hidden
    >
      {/* Same sky gradient as the real map */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: "linear-gradient(180deg,#cfe8fd 0%,#dbeafe 22%,#fdf3d0 46%,#d9f2dd 66%,#fde9c4 86%,#f8d3e2 100%)",
        }}
      />

      {/* Stats chips, top-right */}
      <div className="fixed right-4 top-[86px] z-[70] flex items-center gap-2">
        <div className="h-8 w-20 animate-pulse rounded-full bg-white/70" />
        <div className="h-8 w-20 animate-pulse rounded-full bg-white/70" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-white/70" />
      </div>

      <div className="relative z-[1] mx-auto flex max-w-3xl flex-col items-center px-4 pt-12">
        {/* Grand title block */}
        <div className="h-11 w-[320px] max-w-[80%] animate-pulse rounded-2xl bg-white/70" />
        <div className="mt-3 h-4 w-48 animate-pulse rounded-full bg-white/60" />

        {/* Winding road of node placeholders */}
        <div className="relative mt-12 w-full">
          {/* faint centre rail */}
          <div className="absolute left-1/2 top-0 h-full w-3 -translate-x-1/2 rounded-full bg-white/40" />
          <div className="relative flex flex-col gap-10">
            {nodes.map((i) => {
              const align = i % 2 === 0 ? "justify-start" : "justify-end";
              const isBig = i === 2;
              return (
                <div key={i} className={`flex ${i % 3 === 1 ? "justify-center" : align}`}>
                  {i % 3 === 0 && (
                    <div className="mr-3 hidden h-14 w-40 animate-pulse rounded-2xl bg-white/60 sm:block" />
                  )}
                  <div
                    className="animate-pulse rounded-full bg-white/75 ring-4 ring-white/40"
                    style={{ width: isBig ? 76 : 64, height: isBig ? 76 : 64 }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
