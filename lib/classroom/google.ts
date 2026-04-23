import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Server-side helpers for the Google Classroom integration.
 *
 * Requires these env vars (set in Vercel + local .env):
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 *   NEXT_PUBLIC_APP_URL (or APP_URL) — used to build the redirect URI
 *
 * Google Cloud Console setup (one-time, by the operator):
 *   1. Enable the Classroom API in the GCP project
 *   2. Under APIs & Services → OAuth consent screen, add scopes:
 *        - https://www.googleapis.com/auth/classroom.courses.readonly
 *        - https://www.googleapis.com/auth/classroom.rosters.readonly
 *        - email, profile, openid
 *   3. Under Credentials, add an OAuth 2.0 Client ID (Web application)
 *      with redirect URI <APP_URL>/api/classroom/google/callback
 *   4. Both scopes are "sensitive" — submit the app for verification
 *      before opening to external teachers. Until then, add each test
 *      teacher to the Test Users list.
 */

export const GOOGLE_CLASSROOM_SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "openid",
  "email",
  "profile",
].join(" ");

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "https://learn.readee.app"
  ).replace(/\/$/, "");
}

export function googleRedirectUri(): string {
  return `${appBaseUrl()}/api/classroom/google/callback`;
}

export function googleAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: required("GOOGLE_OAUTH_CLIENT_ID"),
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: GOOGLE_CLASSROOM_SCOPES,
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not configured.`);
  return v;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: required("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: required("GOOGLE_OAUTH_CLIENT_SECRET"),
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  scope: string;
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: required("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: required("GOOGLE_OAUTH_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getConnection(profileId: string): Promise<{
  profile_id: string;
  google_email: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
  scope: string;
} | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("google_classroom_connections")
    .select("profile_id, google_email, access_token, refresh_token, expires_at, scope")
    .eq("profile_id", profileId)
    .maybeSingle();
  return (data as any) ?? null;
}

export async function getValidAccessToken(profileId: string): Promise<string | null> {
  const conn = await getConnection(profileId);
  if (!conn) return null;

  const now = Date.now();
  const expiresMs = new Date(conn.expires_at).getTime();
  // Refresh a minute before expiry to avoid mid-request timeouts.
  if (expiresMs - now > 60_000) return conn.access_token;
  if (!conn.refresh_token) return null;

  const refreshed = await refreshAccessToken(conn.refresh_token);
  const newExpires = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  const admin = supabaseAdmin();
  await admin
    .from("google_classroom_connections")
    .update({
      access_token: refreshed.access_token,
      expires_at: newExpires,
      scope: refreshed.scope,
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", profileId);
  return refreshed.access_token;
}

export async function upsertConnection(input: {
  profile_id: string;
  google_email: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
  scope: string;
}): Promise<void> {
  const admin = supabaseAdmin();
  await admin
    .from("google_classroom_connections")
    .upsert(
      {
        ...input,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id" },
    );
}

export async function listCourses(profileId: string): Promise<
  { id: string; name: string; section?: string; courseState?: string }[]
> {
  const token = await getValidAccessToken(profileId);
  if (!token) throw new Error("Not connected to Google Classroom.");
  const res = await fetch(
    "https://classroom.googleapis.com/v1/courses?teacherId=me&courseStates=ACTIVE",
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Classroom courses failed: ${res.status} ${text}`);
  }
  const body = (await res.json()) as {
    courses?: { id: string; name: string; section?: string; courseState?: string }[];
  };
  return body.courses ?? [];
}

export async function listCourseStudents(
  profileId: string,
  courseId: string,
): Promise<{ userId: string; name: string }[]> {
  const token = await getValidAccessToken(profileId);
  if (!token) throw new Error("Not connected to Google Classroom.");
  const students: { userId: string; name: string }[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(
      `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/students`,
    );
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const res = await fetch(url.toString(), {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google Classroom roster failed: ${res.status} ${text}`);
    }
    const body = (await res.json()) as {
      students?: {
        userId: string;
        profile?: { name?: { fullName?: string; givenName?: string; familyName?: string } };
      }[];
      nextPageToken?: string;
    };
    for (const s of body.students ?? []) {
      const fullName =
        s.profile?.name?.fullName ??
        [s.profile?.name?.givenName, s.profile?.name?.familyName].filter(Boolean).join(" ") ??
        "Student";
      students.push({ userId: s.userId, name: fullName });
    }
    pageToken = body.nextPageToken;
  } while (pageToken);
  return students;
}
