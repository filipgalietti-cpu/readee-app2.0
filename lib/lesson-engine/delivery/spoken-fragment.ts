/** Locate a displayed sentence inside the longer recorded instruction. Only a
 * complete contiguous phrase matches; individual repeated words never suffice. */
export function spokenFragmentIndex(text: string, caption: string, activeWord: number): number {
  if (activeWord < 0) return -1;
  if (text === caption) return activeWord;
  const words = (s: string) =>
    s.split(/\s+/).map((w) => w.toLowerCase().replace(/[^a-z0-9']/g, ""));
  const target = words(text),
    spoken = words(caption);
  if (!target.length || target.every((w) => !w)) return -1;
  for (let start = 0; start + target.length <= spoken.length; start++) {
    if (
      activeWord >= start &&
      activeWord < start + target.length &&
      target.every((w, i) => w === spoken[start + i])
    )
      return activeWord - start;
  }
  return -1;
}
