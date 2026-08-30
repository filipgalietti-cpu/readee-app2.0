"use client";

import WarmupArcade from "@/app/components/warmup/WarmupArcade";
import { soundSwitchHunt } from "@/app/data/warmups-v2/sound-switch-hunt";

// Warm-Up Arcade pilot · /demo/warmup/sound-switch-hunt
export default function Page() {
  return <WarmupArcade warmup={soundSwitchHunt} />;
}
