import { scrubErrorEvent } from "./lib/observability/privacy";
import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

// init parses the DSN even when `enabled` is false, logging "Invalid Sentry Dsn"
// to the dev console if the local DSN is malformed — so skip init outside prod.
if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    beforeSend: scrubErrorEvent,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // Navigation noise, not bugs: the browser aborts in-flight fetches /
    // audio.play() when the user clicks away mid-load (surfaced as unhandled
    // rejections, e.g. Safari on /community). Aborting is correct behavior.
    denyUrls: [/\/executors\//, /^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari-(?:web-)?extension:\/\//],
    ignoreErrors: [
      "AbortError",
      "The operation was aborted",
      "The play() request was interrupted",
      // Injected by the Microsoft Office / Outlook SafeLinks browser
      // extension, not by our code: it rejects a promise with a bare string
      // ("Object Not Found Matching Id:2, MethodName:update, ParamCount:4")
      // that lands on window.onunhandledrejection. Nothing in the page is
      // broken and there is no stack to act on (Sentry JAVASCRIPT-NEXTJS-G).
      "Object Not Found Matching Id",
      /(?:Can.t find variable: zaloJSV2|zaloJSV2 is not defined)/,
    ],
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NODE_ENV === "production"
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: true,
  });
}
