import { redirect } from "next/navigation";

// The old account page was replaced by the consolidated Settings page
// (profile, readers, plan & billing, notifications, privacy). Redirect any
// old links / bookmarks there.
export default function AccountPage() {
  redirect("/settings");
}
