/**
 * Supabase auth rejections a parent can fix themselves.
 *
 * These are shown next to the field they concern and never reported as
 * failures: a weak password is not an outage. Anything not listed here is
 * unexpected and still goes to Sentry.
 */
export type SignupRejection = { field: "email" | "password" | "general"; message: string };

type AuthLikeError = { code?: unknown; message?: unknown; reasons?: unknown };

export function signupRejection(error: unknown): SignupRejection | null {
  const e = (error && typeof error === "object" ? error : {}) as AuthLikeError;
  const code = typeof e.code === "string" ? e.code : "";
  switch (code) {
    case "weak_password":
      return { field: "password", message: weakPasswordMessage(e) };
    case "user_already_exists":
    case "email_exists":
      return { field: "general", message: "This email is already registered. Please sign in instead." };
    case "email_address_invalid":
    case "validation_failed":
      return { field: "email", message: "Please enter a valid email address." };
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return { field: "general", message: "Too many attempts. Please wait a minute and try again." };
    case "signup_disabled":
      return { field: "general", message: "Signups are paused right now. Please try again later." };
    default:
      return null;
  }
}

// Supabase names the required sets by spelling them out, e.g.
// "...one character of each: abcdefghijklmnopqrstuvwxyz, 0123456789".
const CHARACTER_SETS: Array<[RegExp, string]> = [
  [/abcdefghijklmnopqrstuvwxyz/, "a lowercase letter"],
  [/ABCDEFGHIJKLMNOPQRSTUVWXYZ/, "an uppercase letter"],
  [/0123456789/, "a number"],
  [/[!@#$%^&*]{4,}/, "a symbol"],
];

/** Turn Supabase's weak-password message into a sentence a parent can act on. */
export function weakPasswordMessage(error: { message?: unknown; reasons?: unknown }): string {
  const message = typeof error.message === "string" ? error.message : "";
  const reasons = Array.isArray(error.reasons) ? error.reasons.map(String) : [];
  const length = message.match(/at least (\d+) characters/);
  if (length || reasons.includes("length")) return `Use at least ${length ? length[1] : 8} characters.`;
  if (message.includes("one character of each") || reasons.includes("characters")) {
    const needs = CHARACTER_SETS.filter(([set]) => set.test(message)).map(([, name]) => name);
    return needs.length ? `Include ${list(needs)}.` : "Mix letters, numbers and symbols.";
  }
  if (message.includes("easy to guess") || reasons.includes("pwned")) {
    return "That password shows up in known data breaches. Please choose a different one.";
  }
  return "Please choose a stronger password.";
}

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
