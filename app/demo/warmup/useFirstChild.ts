"use client";

/**
 * Demo helper: when the tester is signed in, load their first reader so the
 * warm-up demos exercise the REAL experience (name greeting, own outfit).
 * Journey wiring will pass these props from its own child context instead.
 */
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type DemoChild = {
  name?: string;
  greetingAudioUrl?: string | null;
  outfitId?: string | null;
  /** True once the signed-in check + reader fetch have settled. */
  ready: boolean;
};

export function useFirstChild(): DemoChild {
  const [child, setChild] = useState<DemoChild>({ ready: false });
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChild({ ready: true }); return; }
      const { data } = await supabase
        .from("children")
        .select("first_name, greeting_audio_url, equipped_items")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!data) { setChild({ ready: true }); return; }
      // greeting_audio_url now holds a private-bucket PATH; serve it through
      // the ownership-checked signing route so <audio>/new Audio() still works.
      const gp = data.greeting_audio_url;
      const greetingAudioUrl = gp
        ? gp.startsWith("http")
          ? gp // legacy public URL (pre-migration) — still plays
          : `/api/child-audio?path=${encodeURIComponent(gp)}`
        : null;
      setChild({
        ready: true,
        name: data.first_name ?? undefined,
        greetingAudioUrl,
        outfitId: (data.equipped_items as { outfit?: string } | null)?.outfit ?? null,
      });
    })();
  }, []);
  return child;
}
