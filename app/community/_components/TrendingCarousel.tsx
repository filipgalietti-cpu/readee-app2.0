"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, Sparkles } from "lucide-react";

type Card = {
  id: string;
  slug: string | null;
  title: string;
  image_url: string | null;
  grade_level: string;
  topic: string;
  view_count: number;
  display_byline: string | null;
  display_state: string | null;
  genre: { label: string; cls: string };
};

/**
 * Auto-rotating trending strip. Horizontal scroll-snap container that
 * advances one card every ~4s. Pauses on hover/focus and on touch
 * interaction. The rotation IS the social-media liveliness Filip
 * wanted — feels like the page is moving even when the user isn't.
 */
export default function TrendingCarousel({ items }: { items: Card[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Honor prefers-reduced-motion — accessibility first.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    if (items.length <= 1) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const cardWidth = el.firstElementChild?.getBoundingClientRect().width ?? 180;
      const gap = 12;
      const step = cardWidth + gap;
      // If we're near the end, snap back to the start.
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(id);
  }, [paused, reduced, items.length]);

  if (items.length === 0) return null;

  return (
    <div
      className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 scroll-smooth"
        style={{ width: "max-content" }}
      >
        {items.map((p) => (
          <li key={p.id} className="w-44 flex-shrink-0 snap-start">
            <Link
              href={`/community/${p.slug}`}
              className="group relative block overflow-hidden rounded-2xl shadow-md ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-violet-300 to-indigo-500 text-white">
                  <Sparkles className="h-10 w-10" />
                </div>
              )}

              {/* Top floating bubbles */}
              <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-1.5">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm ${p.genre.cls}`}
                >
                  {p.genre.label}
                </span>
                <span className="rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-extrabold text-zinc-900 shadow-sm">
                  {p.grade_level}
                </span>
              </div>

              {/* Bottom gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2.5 pb-2 pt-10">
                <div className="line-clamp-2 text-[12px] font-extrabold leading-tight text-white">
                  {p.title}
                </div>
                <div className="mt-1 flex items-center justify-between gap-1 text-[10px] font-semibold text-white/85">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-2.5 w-2.5" />
                    {p.view_count.toLocaleString()}
                  </span>
                  {p.display_state && (
                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white">
                      {p.display_state}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
