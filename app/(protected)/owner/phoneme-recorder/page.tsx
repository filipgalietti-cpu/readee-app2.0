import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import phonemeDb from "@/scripts/phoneme-database.json";
import PhonemeRecorderClient from "./_components/PhonemeRecorderClient";

export const dynamic = "force-dynamic";

/**
 * Owner tool: record the 45 phoneme clips with a HUMAN voice (Jennifer).
 * The TTS-generated clips ("buh") carry a schwa — pedagogically wrong for
 * blending. Record → preview → upload stages WAVs to audio/phoneme-takes/;
 * then `npx tsx scripts/finalize-phoneme-takes.ts` trims/normalizes/converts
 * and swaps them live (with a backup of the old clips).
 */
export default async function PhonemeRecorderPage() {
  const profile = await requireProfile();
  if (!(await isPlatformAdmin(profile.id))) redirect("/dashboard");

  const phonemes = (phonemeDb as {
    id: string;
    phoneme: string;
    type: string;
    sound: string;
    example: string;
  }[]).map((p) => ({ id: p.id, phoneme: p.phoneme, type: p.type, sound: p.sound, example: p.example }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Phoneme recorder</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
        Use the laptop&apos;s built-in mic in a quiet room (not AirPods). Say each
        sound CLIPPED, no &quot;uh&quot; tail: /b/ is a tight &quot;b&quot;, never &quot;buh&quot;.
        Continuants (/s/ /m/ /f/) can stretch about a second. Record, listen
        back, re-take until it&apos;s right, then upload.
      </p>
      <div className="mt-6">
        <PhonemeRecorderClient phonemes={phonemes} />
      </div>
    </div>
  );
}
