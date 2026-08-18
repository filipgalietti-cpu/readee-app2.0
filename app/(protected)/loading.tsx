import { SkeletonPage } from "@/app/_components/Skeleton";

/**
 * Group-level loading skeleton for ALL protected routes. Next.js shows this
 * instantly on navigation (and prefetches it on link hover) so going
 * back-and-forth paints structure immediately instead of freezing on the
 * destination's server work. Routes with their own loading.tsx (e.g.
 * /daily) override this with a shape-matched skeleton.
 */
export default function Loading() {
  return <SkeletonPage cards={4} />;
}
