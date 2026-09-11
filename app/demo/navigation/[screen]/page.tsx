import Link from "next/link";

export default async function NavigationPage({ params, searchParams }: {
  params: Promise<{ screen: string }>;
  searchParams: Promise<{ wait?: string; tab?: string }>;
}) {
  const { screen } = await params;
  const { wait, tab } = await searchParams;
  const delay = Math.min(1500, Math.max(0, Number(wait) || 0));
  if (delay) await new Promise(resolve => setTimeout(resolve, delay));
  return <section data-navigation-page={screen} data-navigation-tab={tab ?? "overview"} className="min-h-[60dvh] rounded-2xl border border-violet-100 bg-violet-50/40 p-8">
    <h1 className="text-3xl font-semibold text-violet-900">{screen === "library" ? "Reading library" : screen === "settings" ? "Parent settings" : "Reading journey"}</h1>
    <p className="mt-4 text-zinc-600">Navigation workbench. This preview does not save family data.</p>
    <Link prefetch={false} className="mt-6 inline-block text-violet-700 underline" href={`/demo/navigation/${screen}?tab=details&wait=700`}>Details tab</Link>
    <Link className="ml-6 text-violet-700 underline" href="#navigation-notes">Jump to notes</Link>
    <p id="navigation-notes" className="mt-8">The sidebar and shared note should stay in place as pages change.</p>
  </section>;
}
