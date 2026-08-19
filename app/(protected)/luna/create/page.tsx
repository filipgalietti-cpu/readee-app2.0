import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Luna is now one page — /luna is the make-a-story surface. Forward here. */
export default async function LunaCreateRedirect({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const { child } = await searchParams;
  redirect(child ? `/luna?child=${child}` : "/luna");
}
