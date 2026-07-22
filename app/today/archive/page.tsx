import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Daily Readee is a signed-in feature. This route only redirects:
// signed-in parents → the in-app /daily archive; logged-out visitors →
// sign up. Kept for backward-compat with old links + "Back to archive".
export const dynamic = "force-dynamic";

export default async function DailyArchivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  redirect(user ? "/daily" : "/signup");
}
