import { requireProfile } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import RoleFlipButtons from "./RoleFlipButtons";
import Link from "next/link";

/**
 * Dev-only page to flip your own profile.role between 'educator' and
 * 'parent' so you can test both sides of the Classroom flow on a single
 * account. Disabled in production unless ALLOW_DEV_ROLE_FLIP=1.
 */
export default async function ClassroomDevPage() {
  const profile = await requireProfile();

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_ROLE_FLIP !== "1") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Classroom — dev helpers
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
        Quick role-flip controls so you can dogfood both sides of the teacher
        flow on a single account.
      </p>

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Your role</h2>
        <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-slate-400">
          role ={" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-300">
            {profile.role}
          </span>
        </p>

        <div className="mt-4">
          <RoleFlipButtons currentRole={profile.role} />
        </div>

        <ul className="mt-5 list-disc space-y-1 pl-5 text-xs text-zinc-500 dark:text-slate-400">
          <li>
            As <strong>educator</strong>:{" "}
            <Link href="/classroom" className="text-indigo-600 underline">
              /classroom
            </Link>{" "}
            — create classes, invite students, assign work
          </li>
          <li>
            As <strong>parent</strong>:{" "}
            <Link href="/classroom-join" className="text-indigo-600 underline">
              /classroom-join
            </Link>{" "}
            — enter a join code to add your child to a teacher&apos;s class
          </li>
        </ul>
      </section>
    </div>
  );
}
