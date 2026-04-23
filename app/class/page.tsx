import Link from "next/link";
import { redirect } from "next/navigation";
import ClassCodeEntry from "./_components/ClassCodeEntry";

export const dynamic = "force-dynamic";

export default async function ClassLanding({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const sp = await searchParams;
  const code = (sp.code ?? "").trim().toUpperCase();
  if (code && /^[A-Z0-9]{6}$/.test(code)) {
    redirect(`/class/${code}`);
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-md px-5 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Class sign-in
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
          Type your class code to get to the name picker.
        </p>
      </div>
      <div className="mt-8">
        <ClassCodeEntry />
      </div>
      <div className="mt-8 text-center text-xs text-zinc-400">
        Teacher?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
}
