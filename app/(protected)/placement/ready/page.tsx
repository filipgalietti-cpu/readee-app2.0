import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { Glyph } from "@/app/_components/Glyph";

export default async function ReaderHandoff({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const parent = await requireProfile();
  const { child: childId } = await searchParams;
  if (!childId) redirect("/dashboard");
  const supabase = await createClient();
  const { data: child, error } = await supabase.from("children").select("id, first_name").eq("id", childId).eq("parent_id", parent.id).maybeSingle();
  if (error) throw new Error("Could not load the reader handoff.");
  if (!child) redirect("/dashboard");
  const name = child.first_name?.trim() || "Reader";
  return <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 px-6 py-8 text-center">
    <img src="/images/ui/bunny-reading.png" width={192} height={192} alt="" className="h-40 w-40 object-contain sm:h-48 sm:w-48" />
    <h1 className="mt-6 max-w-xl text-3xl font-semibold text-zinc-900 sm:text-4xl">Over to you, {name}.</h1>
    <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-600">Grown-up, hand the device to your reader. Stay nearby to help with the microphone.</p>
    <div className="mt-6 w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 text-left shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)]">
      <p className="font-semibold text-zinc-900">Luna will read with you first.</p><p className="mt-2 text-sm leading-relaxed text-zinc-600">You’ll read some words and a story, then answer a few questions. Take your time. You don’t need to know every word.</p>
    </div>
    <Link href={`/placement?child=${encodeURIComponent(child.id)}`} className="mt-8 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)] hover:from-violet-700 hover:to-violet-600">I’m ready<Glyph name="arrow-right" size={22} /></Link>
    <Link href="/dashboard" className="mt-6 text-sm font-semibold text-violet-700 underline underline-offset-4">We’ll come back later</Link>
  </main>;
}
