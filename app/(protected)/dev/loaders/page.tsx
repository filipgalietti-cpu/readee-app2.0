import { OrganicLoader, type OrganicLoaderVariant } from "@/components/loaders/OrganicLoader";
import { OrganicLoaderDefs } from "@/components/loaders/OrganicLoaderDefs";

export const metadata = { title: "Organic loaders, gallery" };

const VARIANTS: { id: OrganicLoaderVariant; label: string }[] = [
  { id: 1,  label: "Morphing blob" },
  { id: 2,  label: "Three metaballs" },
  { id: 3,  label: "Pulsing breath" },
  { id: 4,  label: "Orbiting blobs" },
  { id: 5,  label: "Viscous bar" },
  { id: 6,  label: "Lava droplet" },
  { id: 7,  label: "Drifting cloud" },
  { id: 8,  label: "Path morph" },
  { id: 9,  label: "Jelly ring" },
  { id: 10, label: "Trailing comet" },
  { id: 11, label: "Noise blob" },
  { id: 12, label: "Stacked petals" },
  { id: 13, label: "Gooey eight" },
  { id: 14, label: "Dripping blob" },
  { id: 15, label: "Gradient sweep" },
  { id: 16, label: "Bubble swarm" },
  { id: 17, label: "Heartbeat" },
  { id: 18, label: "Split & merge" },
  { id: 19, label: "Gradient ribbon" },
  { id: 20, label: "Aurora puddle" },
];

export default function LoadersGalleryPage() {
  return (
    <div className="min-h-[100dvh] bg-zinc-50 px-8 py-12">
      <OrganicLoaderDefs />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Organic loaders
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          20 indeterminate loaders in the Readee gradient. Pick one and call
          <code className="mx-1 rounded bg-zinc-200 px-1.5 py-0.5 text-xs font-mono">
            {"<OrganicLoader variant={n} />"}
          </code>
          where it&apos;s needed.
        </p>

        <div className="mt-10 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
          {VARIANTS.map(({ id, label }) => (
            <div
              key={id}
              className="aspect-square max-w-[240px] overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm"
            >
              <div className="flex h-full w-full flex-col items-center justify-between p-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {String(id).padStart(2, "0")}
                </div>
                <OrganicLoader variant={id} aria-label={label} />
                <div className="text-xs font-semibold text-zinc-700">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
