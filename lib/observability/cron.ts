import { reportFailure } from "./critical";

/** Include failures returned as JSON, which framework exception capture cannot see. */
export function withCronReporting<Args extends unknown[]>(route: string, run: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    const requestId = crypto.randomUUID();
    try {
      const response = await run(...args);
      // Authentication/validation failures are expected and do not page the owner.
      if (response.status >= 400 && response.status < 500) return response;
      let failed = response.status >= 500;
      if (!failed && response.headers.get("content-type")?.includes("application/json")) {
        try { const body = await response.clone().json(); failed = body?.ok === false || body?.success === false; }
        catch { /* Preserve the original response, including non-JSON bodies. */ }
      }
      if (failed) reportFailure("cron.response", { code: `http_${response.status}` }, { route, requestId });
      return response;
    } catch (error) {
      reportFailure("cron.run", error, { route, requestId });
      return Response.json({ ok: false, error: "The scheduled job failed.", requestId }, { status: 500 });
    }
  };
}
