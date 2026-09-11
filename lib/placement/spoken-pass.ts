/** Explicit requests to pass; hesitation and silence are never a scored answer. */
export function isSpokenPass(text: string): boolean {
  const words = text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return /\b(?:i )?(?:dont|do not) know\b|\bdunno\b|\b(?:im|i am) not sure\b|\bnot sure\b|\b(?:skip|pass)(?: this| it| word| one)?\b|\bnext one\b/.test(
    words,
  );
}
