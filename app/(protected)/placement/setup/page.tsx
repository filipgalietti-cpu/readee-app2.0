import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import ParentReaderSetup from "../../dashboard/_components/ParentReaderSetup";

export default async function ReaderSetupPage() {
  const parent = await requireProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .select("id")
    .eq("parent_id", parent.id)
    .limit(1);
  if (error) throw new Error("Could not load reader setup.");
  if (data?.length) redirect(`/placement/ready?child=${encodeURIComponent(data[0].id)}`);
  return <ParentReaderSetup parentId={parent.id} />;
}
