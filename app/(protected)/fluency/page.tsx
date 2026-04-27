import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FluencyRecorder from "./_components/FluencyRecorder";
import FluencyHistory from "./_components/FluencyHistory";
import { Mic, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const SAMPLE_PASSAGES: { grade: string; title: string; text: string }[] = [
  {
    grade: "K",
    title: "My Cat",
    text: "I have a cat. My cat is black. My cat likes to nap on the rug. I love my cat.",
  },
  {
    grade: "1st",
    title: "The Big Game",
    text: "Sam ran fast. He ran to the big game. The team was ready to play. Sam kicked the ball and the crowd cheered. It was a great day.",
  },
  {
    grade: "2nd",
    title: "Helping Mom",
    text: "On Saturday morning, I helped Mom in the garden. We planted bright flowers and watered the small bushes. The sun was warm and the bees were busy. By lunch we were tired but proud of our work.",
  },
  {
    grade: "3rd",
    title: "The Old Treehouse",
    text: "Behind our house stood an old treehouse my grandfather built when my dad was a boy. The wood was weathered, and a long ladder of crooked planks led up the trunk. Climbing inside felt like stepping into a different time. From the window, you could see the whole neighborhood.",
  },
  {
    grade: "4th",
    title: "How a Volcano Erupts",
    text: "Deep beneath the earth's surface, hot melted rock called magma collects in chambers. As pressure builds, the magma pushes upward, searching for a way out. When it finally reaches a crack in the crust, it bursts through with tremendous force. This eruption sends ash, rock, and lava into the sky, sometimes for many miles.",
  },
];

export default async function FluencyHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pull the kids the user has access to (their own children OR
  // students in their classrooms — we union both).
  const { data: ownKids } = await supabase
    .from("children")
    .select("id, first_name, grade")
    .eq("parent_id", user.id);

  const { data: taughtMemberships } = await supabase
    .from("classroom_memberships")
    .select("children(id, first_name, grade), classrooms!inner(teacher_id)")
    .eq("classrooms.teacher_id", user.id);

  const taught = ((taughtMemberships ?? []) as any[])
    .map((m) => m.children)
    .filter(Boolean) as { id: string; first_name: string; grade: string }[];

  const all = [...((ownKids ?? []) as any[]), ...taught];
  const dedup = Array.from(new Map(all.map((c) => [c.id, c])).values()) as {
    id: string;
    first_name: string;
    grade: string;
  }[];

  if (dedup.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Fluency check</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Add a kid (parent) or have students in a classroom (teacher) to use
          fluency check.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
        <Sparkles className="h-4 w-4" />
        Reading-buddy AI
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        <Mic className="-mb-1 mr-1 inline h-7 w-7 text-violet-600" />
        Fluency check
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
        Pick a passage, tap record, read it aloud. Readee.ai listens
        word-by-word and tells you what to practice. Replaces the running-record
        assessment teachers used to do 1:1.
      </p>

      <div className="mt-6">
        <FluencyRecorder kids={dedup} samplePassages={SAMPLE_PASSAGES} />
      </div>

      <div className="mt-12">
        <FluencyHistory kids={dedup} />
      </div>
    </div>
  );
}
