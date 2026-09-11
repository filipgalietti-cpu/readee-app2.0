import Link from "next/link";
import { previewLessons } from "@/lib/lessons/preview-catalog";
import { Glyph } from "@/app/_components/Glyph";

export default function ExplorePage() {
  const samples = previewLessons;
  return <main className="container-page py-8 sm:py-12"><div className="mx-auto max-w-4xl">
    <div className="flex items-center gap-6"><img src="/images/ui/bunny-reading.png" alt="" width={128} height={128} className="h-24 w-24 shrink-0 object-contain sm:h-32 sm:w-32" /><div><h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">Take a look around.</h1><p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-600">Try a free lesson sample from our K–4 reading curriculum. Choose any starting point to see how lessons work.</p></div></div>
    <div className="mt-8 divide-y divide-violet-100 overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)]">
      {samples.map((lesson) => <Link key={lesson.standardId} href={`/learn?standard=${encodeURIComponent(lesson.standardId)}&preview=1`} className="flex items-center justify-between gap-4 p-6 transition hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-600"><div><p className="text-sm font-semibold text-violet-700">{lesson.grade}</p><h2 className="mt-1 text-xl font-semibold text-zinc-900">{lesson.title}</h2><p className="mt-1 text-sm text-zinc-500">Try this lesson</p></div><Glyph name="arrow-right" size={24} className="shrink-0 text-violet-600" /></Link>)}
    </div>
    <p className="mt-4 text-sm text-zinc-500">Samples don’t set a reading level or save child progress.</p>
    <div className="mt-8 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"><div><h2 className="text-xl font-semibold text-zinc-900">Ready for a personal starting point?</h2><p className="mt-2 text-sm text-zinc-600">Set up your reader, then let Luna guide the assessment.</p></div><Link href="/dashboard" className="mt-4 inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3 font-semibold text-white hover:from-violet-700 hover:to-violet-600 sm:mt-0">Set up my reader</Link></div>
  </div></main>;
}
