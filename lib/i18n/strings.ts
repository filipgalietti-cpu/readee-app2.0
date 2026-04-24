/**
 * Tiny i18n dictionary for practice/reader UI strings.
 *
 * We deliberately DON'T pull in a full i18n framework (next-intl, etc.)
 * — the app's UI has maybe 50 localizable strings total, and the win is
 * in the CONTENT (passages, questions). A small hand-curated dictionary
 * keeps us lean.
 *
 * Usage:
 *   import { t } from "@/lib/i18n/strings";
 *   t("practice.check", language)  // "Check" or "Comprobar"
 *
 * When a string is missing for a non-English locale, we fall back to
 * English silently — better than crashing a kid's practice session.
 */

export type Locale = "en" | "es";

type Dict = Record<string, Record<Locale, string>>;

const DICT: Dict = {
  "practice.check": { en: "Check", es: "Comprobar" },
  "practice.next": { en: "Next", es: "Siguiente" },
  "practice.finish": { en: "Finish", es: "Terminar" },
  "practice.hint": { en: "Hint", es: "Pista" },
  "practice.correct": { en: "Correct!", es: "¡Correcto!" },
  "practice.try_again": { en: "Try again", es: "Inténtalo de nuevo" },
  "practice.type_answer": { en: "Type your answer", es: "Escribe tu respuesta" },
  "practice.accepted": { en: "Accepted:", es: "Aceptado:" },
  "practice.question_of": { en: "Question {n} of {total}", es: "Pregunta {n} de {total}" },
  "practice.great_work": { en: "Great work!", es: "¡Bien hecho!" },
  "practice.almost": { en: "Almost there!", es: "¡Casi lo tienes!" },
  "practice.score": { en: "{correct} / {total}", es: "{correct} / {total}" },
  "practice.play_audio": { en: "Play audio", es: "Reproducir audio" },

  "journey.today": { en: "Today", es: "Hoy" },
  "journey.review": { en: "Today's review", es: "Repaso de hoy" },
  "journey.mastered": { en: "Mastered", es: "Dominado" },
  "journey.due": { en: "Due now", es: "Ahora" },

  "nav.dashboard": { en: "Dashboard", es: "Panel" },
  "nav.practice": { en: "Practice", es: "Practicar" },
  "nav.stories": { en: "Stories", es: "Historias" },
  "nav.journey": { en: "Reading Journey", es: "Viaje de Lectura" },

  "common.back": { en: "Back", es: "Atrás" },
  "common.loading": { en: "Loading...", es: "Cargando..." },
  "common.save": { en: "Save", es: "Guardar" },
  "common.cancel": { en: "Cancel", es: "Cancelar" },
};

export function t(
  key: string,
  locale: Locale = "en",
  replacements?: Record<string, string | number>,
): string {
  const entry = DICT[key];
  let raw: string;
  if (!entry) {
    raw = key;
  } else {
    raw = entry[locale] ?? entry.en ?? key;
  }
  if (!replacements) return raw;
  return Object.entries(replacements).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    raw,
  );
}

export const SUPPORTED_LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "es", label: "Spanish", native: "Español" },
];
