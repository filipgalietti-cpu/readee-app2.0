import { redirect, notFound } from "next/navigation";
import { loadJourneySnapshot } from "@/lib/journey/load.server";
import JourneyClient from "./_components/JourneyClient";

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; completed?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  if (params.child && !/^[0-9a-f-]{36}$/i.test(params.child)) notFound();
  const snapshot = await loadJourneySnapshot(params.child);
  if (!snapshot) {
    if (params.child) notFound();
    redirect("/placement/setup");
  }
  return (
    <JourneyClient
      key={`${snapshot.child.id}:${params.completed ?? ""}`}
      snapshot={snapshot}
      completed={params.completed}
      checkout={params.checkout}
    />
  );
}
