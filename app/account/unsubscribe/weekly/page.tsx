import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function UnsubscribeWeeklyPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; t?: string }>;
}) {
  const { u: parentId, t: token } = await searchParams;
  if (!parentId || !token) notFound();

  // Minimal validation — decoding the token recovers the parent id
  // we embedded. Not a security boundary (the uid is in the URL
  // already); it's here so random UUIDs don't get unsubscribed.
  let decodedId: string | null = null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    decodedId = decoded.split(":")[0] ?? null;
  } catch {
    decodedId = null;
  }
  if (decodedId !== parentId) notFound();

  const admin = supabaseAdmin();
  await admin
    .from("profiles")
    .update({ email_weekly_digest: false })
    .eq("id", parentId);

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
        <Check className="h-7 w-7" />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-white">
        You&apos;re unsubscribed
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
        You won&apos;t get the weekly Readee family digest anymore. Your
        account and your child&apos;s progress are untouched — this only
        affects email.
      </p>
      <p className="mt-6 text-xs text-zinc-400">
        Changed your mind?{" "}
        <Link href="/account" className="font-semibold text-indigo-600 hover:underline">
          Re-enable in Account settings
        </Link>
        .
      </p>
    </div>
  );
}
