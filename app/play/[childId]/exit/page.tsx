import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import ExitForm from "./_components/ExitForm";

export const dynamic = "force-dynamic";

export default async function PlayExitPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const profile = await requireProfile();

  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("parent_pin_hash")
    .eq("id", profile.id)
    .single();
  const hasPin = !!(profileRow as any)?.parent_pin_hash;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/30">
      <div className="mx-auto max-w-md px-6 py-16">
        <Link
          href={`/play/${childId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {/* eslint-disable-next-line react/no-unescaped-entities */}reading
        </Link>

        <div className="mt-8 rounded-3xl border-2 border-indigo-200 bg-white p-8 shadow-sm dark:border-indigo-900/40 dark:bg-slate-900">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Grown-up only
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
            {hasPin
              ? "Enter your PIN to leave reading time and go back to your account."
              : "Enter your account password to leave reading time and go back to your account."}
          </p>

          <div className="mt-6">
            <ExitForm hasPin={hasPin} childId={childId} />
          </div>
        </div>

        {!hasPin && (
          <p className="mt-4 text-center text-[11px] text-zinc-500 dark:text-slate-400">
            Tip: set a 4-digit grown-up PIN in your{" "}
            <span className="font-semibold">Account</span> settings so you
            don&apos;t have to type your full password to switch back.
          </p>
        )}
      </div>
    </div>
  );
}
