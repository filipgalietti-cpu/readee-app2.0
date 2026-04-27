import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FluencyRecorder from "./_components/FluencyRecorder";
import FluencyHistory from "./_components/FluencyHistory";
import { Mic, Sparkles, GraduationCap } from "lucide-react";

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

export default async function FluencyHubPage({
  searchParams,
}: {
  searchParams: Promise<{ assignment?: string; child?: string }>;
}) {
  const { assignment: assignmentId, child: queryChildId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If we got an ?assignment=, the kid is fulfilling a teacher assignment
  // — lock the passage to that one and route the analyze call with the id.
  let assignedPassage: {
    text: string;
    title: string;
    grade: string;
    childId: string;
  } | null = null;

  if (assignmentId) {
    const { data: a } = await supabase
      .from("assignments")
      .select("id, kind, source_id, classroom_id, title")
      .eq("id", assignmentId)
      .maybeSingle();
    if (a && (a as any).kind === "fluency") {
      const passageId = (a as any).source_id;
      const { data: p } = await supabase
        .from("fluency_passages")
        .select("text, title, grade_level")
        .eq("id", passageId)
        .maybeSingle();
      if (p) {
        let childId = queryChildId ?? null;
        if (!childId) {
          const { data: m } = await supabase
            .from("classroom_memberships")
            .select("child_id, children!inner(parent_id)")
            .eq("classroom_id", (a as any).classroom_id)
            .eq("children.parent_id", user.id)
            .limit(1);
          childId = ((m ?? []) as any[])[0]?.child_id ?? null;
        }
        if (childId) {
          assignedPassage = {
            text: (p as any).text,
            title: (p as any).title ?? "Fluency reading",
            grade: (p as any).grade_level ?? "2nd",
            childId,
          };
        }
      }
    }
  }

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

  if (dedup.length === 0 && !assignedPassage) {
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
        {assignedPassage
          ? "Your teacher assigned this. Read it aloud — Readee.ai listens and gives feedback."
          : "Pick a passage, tap record, read it aloud. Readee.ai listens word-by-word."}
      </p>

      {assignedPassage && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
          <GraduationCap className="h-3 w-3" />
          From your teacher
        </div>
      )}

      <div className="mt-6">
        <FluencyRecorder
          kids={dedup}
          samplePassages={SAMPLE_PASSAGES}
          assignedPassage={assignedPassage}
          assignmentId={assignmentId ?? null}
        />
      </div>

      {!assignedPassage && (
        <div className="mt-12">
          <FluencyHistory kids={dedup} />
        </div>
      )}
    </div>
  );
}
