/**
 * Client-safe slice of lib/ai/translate.
 *
 * The full module imports node:crypto + @google/genai + the supabase
 * admin client, which transitively pull google-auth-library and its
 * node:net dependency into the bundle. Client components only need
 * the language list + the LanguageCode type, so those live here so
 * the chain stays server-only.
 *
 * The full module re-exports these so existing server-side imports
 * keep working without churn.
 */

export const SUPPORTED_LANGUAGES = [
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "zh", name: "Mandarin", nativeName: "中文" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "ht", name: "Haitian Creole", nativeName: "Kreyòl Ayisyen" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "tl", name: "Tagalog", nativeName: "Tagalog" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
