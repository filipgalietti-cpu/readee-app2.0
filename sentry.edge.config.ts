import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,
  // Framework noise, not bugs. Next.js throws this when a client sends a
  // Next-Router-State-Tree header it cannot parse — a tab still running the
  // previous deploy's JS, or a proxy that mangled the header. Next recovers by
  // falling back to a full render, so the visitor sees the page and there is
  // nothing in our code to fix (Sentry JAVASCRIPT-NEXTJS-J).
  ignoreErrors: ["The router state header was sent but could not be parsed"],
});
