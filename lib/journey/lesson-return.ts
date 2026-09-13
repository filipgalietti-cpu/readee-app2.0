/** Wait for the existing save; never insert/retry from navigation or invent completion. */
export async function savedJourneyHref(
  childId: string,
  standardId: string,
  save: Promise<{ saved: boolean }> | null,
): Promise<string> {
  let saved = false;
  try { saved = (await save)?.saved ?? false; } catch { /* The runner reports save failure. */ }
  const href = `/journey?child=${encodeURIComponent(childId)}`;
  return saved ? `${href}&completed=${encodeURIComponent(standardId)}` : href;
}
