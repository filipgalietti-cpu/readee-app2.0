/** Keep closing quotation marks with their sentence; never narrate punctuation alone. */
export function spokenSentences(text: string): string[] {
  const chunks = (text.match(/[^.!?]+[.!?]+["'”’]*|[^.!?]+$/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter((sentence) => /[\p{L}\p{N}]/u.test(sentence));
  const sentences: string[] = [];
  for (const chunk of chunks) {
    const last = sentences.at(-1);
    // These periods belong to name titles, not to sentence endings.
    if (last && /(?:^|\s)(?:Dr|Mr|Mrs|Ms|Prof)\.$/i.test(last))
      sentences[sentences.length - 1] = last + " " + chunk;
    else sentences.push(chunk);
  }
  return sentences;
}
