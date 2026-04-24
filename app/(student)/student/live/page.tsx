import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/student-session";
import LiveQuizJoin from "./_components/LiveQuizJoin";

export const dynamic = "force-dynamic";

export default async function StudentLiveJoin() {
  const session = await getStudentSession();
  if (!session) redirect("/class");
  return (
    <div className="mx-auto max-w-md py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Join live quiz
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
          Your teacher will say a 6-character code.
        </p>
      </div>
      <div className="mt-6">
        <LiveQuizJoin />
      </div>
    </div>
  );
}
