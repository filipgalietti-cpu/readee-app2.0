/** Presentation only: every reference word appears once, in order. Page turns
 * never restart recording, change timing, or contribute a scored response. */
export function readingPages(text: string, wordsPerPage = 24) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const pages: { text: string; endWord: number }[] = [];
  for (let start = 0; start < words.length; ) {
    let end = Math.min(words.length, start + wordsPerPage);
    // Prefer a sentence ending near the boundary, without tiny pages.
    for (let i = end - 1; i >= start + Math.floor(wordsPerPage * 0.6); i--) {
      if (/[.!?]["”']?$/.test(words[i])) {
        end = i + 1;
        break;
      }
    }
    pages.push({ text: words.slice(start, end).join(" "), endWord: end });
    start = end;
  }
  return pages;
}
