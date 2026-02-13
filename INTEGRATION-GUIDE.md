# 🎉 Readee Welcome Page — Integration Guide

This guide walks you through adding the onboarding welcome flow to your existing Readee Next.js app.

---

## What's Included

| File | Purpose |
|------|---------|
| `app/welcome/page.tsx` | The 5-step onboarding page (name → color → interests → done!) |
| `app/components/ProfileContext.tsx` | React context that stores & provides the child's profile everywhere |
| `app/components/OnboardingGuard.tsx` | Auto-redirects to `/welcome` if they haven't onboarded yet |
| `supabase-migration-profiles.sql` | SQL to create a `profiles` table in Supabase (optional for now) |

---

## Step-by-Step Integration

### 1. Copy the files into your project

```bash
# From your project root:
cp app/welcome/page.tsx        <your-project>/app/welcome/page.tsx
cp app/components/ProfileContext.tsx   <your-project>/app/components/ProfileContext.tsx
cp app/components/OnboardingGuard.tsx  <your-project>/app/components/OnboardingGuard.tsx
```

### 2. Update your root `layout.tsx`

Open `app/layout.tsx` and wrap your app with the `ProfileProvider` and `OnboardingGuard`:

```tsx
// app/layout.tsx
import { ProfileProvider } from "./components/ProfileContext";
import { OnboardingGuard } from "./components/OnboardingGuard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ProfileProvider>
          <OnboardingGuard>
            {children}
          </OnboardingGuard>
        </ProfileProvider>
      </body>
    </html>
  );
}
```

**That's it!** The app will now:
- Redirect first-time visitors to `/welcome`
- Let them go through the onboarding flow
- Save their profile to `localStorage`
- Redirect back to the home page when done
- Skip the welcome page on future visits

### 3. Use profile data anywhere in your app

```tsx
"use client";
import { useProfile } from "@/app/components/ProfileContext";

export default function SomePage() {
  const { profile } = useProfile();

  if (!profile) return null;

  return (
    <div>
      <h1>Hey {profile.name}!</h1>
      <p>Your favorite color: {profile.favoriteColor}</p>
      <p>Your interests: {profile.interests.join(", ")}</p>
    </div>
  );
}
```

### 4. (Optional) Theme the app with the child's color

You can use `profile.favoriteColorHex` to dynamically style any part of the app:

```tsx
const { profile } = useProfile();
const color = profile?.favoriteColorHex || "#74C0FC";

<nav style={{ borderBottom: `3px solid ${color}` }}>
  ...
</nav>
```

### 5. (Optional) Connect to Supabase

When you're ready to persist profiles in the database:

1. Run `supabase-migration-profiles.sql` in the Supabase SQL Editor
2. Uncomment the Supabase save block in `app/welcome/page.tsx` (search for "OPTIONAL: Save to Supabase")
3. Profiles will be saved to both `localStorage` (for speed) and Supabase (for persistence)

---

## How It Works

```
First visit → OnboardingGuard checks localStorage
            → No profile found → Redirect to /welcome
            → Child completes 4 steps
            → Profile saved to localStorage
            → Redirect to home page

Return visit → OnboardingGuard checks localStorage
             → Profile found → Render app normally
             → Profile data available via useProfile() hook
```

---

## Adding a "Reset Profile" Option

If you want to let users redo onboarding (useful for testing):

```tsx
import { useProfile } from "@/app/components/ProfileContext";
import { useRouter } from "next/navigation";

function ResetButton() {
  const { clearProfile } = useProfile();
  const router = useRouter();

  return (
    <button onClick={() => { clearProfile(); router.push("/welcome"); }}>
      Redo Setup
    </button>
  );
}
```

---

## Customizing

- **Add/remove interests**: Edit the `INTERESTS` array at the top of `welcome/page.tsx`
- **Add/remove colors**: Edit the `COLORS` array at the top of `welcome/page.tsx`
- **Change max interests**: Find `prev.length < 5` in the `toggleInterest` function
- **Public pages**: Add paths to `publicPaths` in `OnboardingGuard.tsx`
- **Mascot**: Customize the `MascotFace` component for a different look

Enjoy building Readee! 📚
