/** Spoken-word comparison: never drops words, negation, or numbers. */
const small = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function numberWords(n: number): string {
  if (n < 20) return small[n];
  if (n < 100) return `${tens[Math.floor(n / 10)]} ${n % 10 ? small[n % 10] : ""}`;
  if (n < 1000)
    return `${small[Math.floor(n / 100)]} hundred ${n % 100 ? numberWords(n % 100) : ""}`;
  return String(n);
}
export function speechTokens(text: string): string[] {
  return (
    text
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/\bhoney[ -]+bees\b/g, "honeybees")
      .replace(/\bgrey\b/g, "gray")
      // ASR cannot distinguish these exact homophones from sound alone.
      .replace(/\bneigh\b/g, "nay")
      .replace(/\bweak\b/g, "week")
      .replace(
        /\b(\d)(?:st|nd|rd|th)\b/g,
        (_, n) =>
          [
            "zeroth",
            "first",
            "second",
            "third",
            "fourth",
            "fifth",
            "sixth",
            "seventh",
            "eighth",
            "ninth",
          ][Number(n)],
      )
      .replace(/\b\d{1,3}\b/g, (n) => numberWords(Number(n)))
      .replace(/\b(?:can't)\b/g, "cannot")
      .replace(/\bdon't\b/g, "do not")
      .replace(/\bit's\b/g, "it is")
      .replace(/\byou're\b/g, "you are")
      .replace(/\bthat's\b/g, "that is")
      .replace(/\blet's\b/g, "let us")
      .replace(/\bhundred and\b/g, "hundred")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}
/** Require the authored words in order. Only the supplied proper name may differ in ASR spelling. */
export function speechMatchesScript(
  script: string,
  transcript: string,
  names: string[] = [],
): boolean {
  const expected = speechTokens(script),
    actual = speechTokens(transcript);
  const nameTokens = new Set(names.flatMap(speechTokens));
  if (!expected.length || expected.length !== actual.length) return false;
  return expected.every((word, i) => word === actual[i] || nameTokens.has(word));
}
