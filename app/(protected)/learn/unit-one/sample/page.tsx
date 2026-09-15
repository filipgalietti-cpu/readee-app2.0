import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { unitOneEnabled } from "@/lib/approved-unit/access";
import Sample from "@/app/components/approved-unit/Sample";
export default async function LessonSample({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const parent = await requireProfile();
  if (!unitOneEnabled()) notFound();
  const { child } = await searchParams;
  let backHref = "/explore";
  if (child) {
    const db = await createClient();
    const { data } = await db
      .from("children")
      .select("id")
      .eq("id", child)
      .eq("parent_id", parent.id)
      .maybeSingle();
    if (!data) notFound();
    backHref = `/explore?child=${data.id}`;
  }
  return <Sample backHref={backHref} />;
}
