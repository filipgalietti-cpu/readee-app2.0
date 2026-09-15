export async function unitRequestBody(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) throw Error("origin");
  if (!req.headers.get("content-type")?.startsWith("application/json")) throw Error("body");
  const reader = req.body?.getReader();
  if (!reader) throw Error("body");
  let n = 0,
    text = "";
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    n += value.length;
    if (n > 262144) {
      await reader.cancel();
      throw Error("size");
    }
    text += decoder.decode(value, { stream: true });
  }
  return JSON.parse(text + decoder.decode());
}
