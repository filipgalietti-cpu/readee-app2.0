import { BADGES, TIER, type BadgeTier } from "@/app/_components/Badge/badges";
import { Badge } from "@/app/_components/Badge/Badge";

export const dynamic = "force-static";

export const metadata = {
  title: "Achievement badges — preview",
  robots: { index: false, follow: false },
};

const TIER_ORDER: BadgeTier[] = ["bronze", "silver", "gold", "platinum"];

export default function BadgesShowcase() {
  const byTier = new Map<BadgeTier, typeof BADGES>();
  for (const t of TIER_ORDER) byTier.set(t, []);
  for (const b of BADGES) {
    byTier.get(b.tier)!.push(b);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-700 shadow-sm">
            Achievement badges
          </div>
          <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
            {BADGES.length} medals to earn.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
            Bronze, Silver, Gold, and Legendary (purple). Each badge has a
            unique illustration sitting on a tier-colored medal frame.
            Floating animation + tier-specific glow + sparkle ring on
            Legendary.
          </p>
        </header>

        {TIER_ORDER.map((tier) => {
          const list = byTier.get(tier) ?? [];
          if (list.length === 0) return null;
          const style = TIER[tier];
          return (
            <section key={tier} className="mt-16">
              <div className="mb-6 flex items-baseline justify-between">
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-zinc-900">
                  {style.tag}
                </h2>
                <span className="text-sm font-semibold text-zinc-400">
                  {list.length} {list.length === 1 ? "badge" : "badges"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {list.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col rounded-2xl border-2 p-4 pb-5"
                    style={{ background: style.card, borderColor: style.cardBorder }}
                  >
                    <div className="relative aspect-[1/1.1] w-full">
                      <Badge badgeId={badge.id} />
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-[13px] font-bold tracking-tight text-zinc-900">
                        {badge.name}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-snug text-zinc-600">
                        {badge.desc}
                      </div>
                      <div className="mt-1 select-all font-mono text-[10px] text-zinc-500">
                        {badge.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
