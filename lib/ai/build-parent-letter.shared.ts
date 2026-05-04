/**
 * Client-safe slice of build-parent-letter.
 *
 * The full build-parent-letter module imports server-only deps
 * (@google/genai, supabase admin client, Vertex auth via
 * google-auth-library, which pulls node:net + child_process). Client
 * components (ParentLetterEditor) only need the supported-languages
 * list — that has no node-only imports and lives here so the editor
 * renders without dragging the server surface into the browser bundle.
 *
 * The full module re-exports this so existing server-side imports
 * keep working without churn.
 */

export const SUPPORTED_LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "zh", label: "Mandarin (Simplified Chinese)" },
  { code: "vi", label: "Vietnamese" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
  { code: "ht", label: "Haitian Creole" },
  { code: "pt", label: "Portuguese" },
  { code: "tl", label: "Tagalog" },
  { code: "ru", label: "Russian" },
  { code: "ko", label: "Korean" },
];
