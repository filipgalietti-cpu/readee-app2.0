/** Production permits blob: media, not data: media. Keep the policy intact. */
export function namePreviewBlobUrl(dataUrl: string): string {
  const match = /^data:audio\/mpeg;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid pronunciation preview.");
  const bytes = Uint8Array.from(atob(match[1]), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
}
