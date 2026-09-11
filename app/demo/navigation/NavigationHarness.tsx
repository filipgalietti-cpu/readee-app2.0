"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SidebarShell from "@/app/_components/SidebarShell";
import TosGate from "@/app/_components/TosGate";

/** Exercises the real shared shell. No accounts or child records are created. */
function SharedControls({ children }: { children: React.ReactNode }) {
  const [note, setNote] = useState("");
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => { if (host.current) host.current.dataset.navigationReady = "true"; }, []);
  return <div ref={host} data-navigation-ready="false" className="px-6 py-8">
    <nav aria-label="Navigation test" className="mb-6 flex flex-wrap gap-6">
      <Link prefetch={false} href="/demo/navigation/journey">Journey preview</Link>
      <Link prefetch={false} href="/demo/navigation/library?wait=900">Library preview</Link>
      <Link prefetch={false} href="/demo/navigation/settings?wait=600">Settings preview</Link>
      <Link prefetch={false} href="/demo/placement-run?grade=1">Reading preview</Link>
      <Link prefetch={false} href="/demo/navigation/shop?child=reader-a">Shop preview</Link>
      <Link prefetch={false} href="/demo/navigation/shop?child=reader-b">Second reader shop</Link>
      <Link prefetch={false} href="/demo/navigation/daily">Daily preview</Link>
    </nav>
    <label className="mb-6 block text-sm text-zinc-600">Shared-layout test note
      <input aria-label="Shared-layout test note" className="ml-3 rounded-lg border border-violet-200 p-2" value={note} onChange={e => setNote(e.target.value)} />
    </label>
    {children}
  </div>;
}

export default function NavigationHarness({ children }: { children: React.ReactNode }) {
  return <TosGate><SidebarShell initialOpen><SharedControls>{children}</SharedControls></SidebarShell></TosGate>;
}
