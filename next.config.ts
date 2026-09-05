import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Several client components (BookWizard, LeveledWizard, LessonWizard,
  // AssignmentWizard, AskReadeeWizard, ParentLetterEditor, etc.)
  // import a credit-estimator helper or a TypeScript type from a
  // server-side build-* module that itself imports @google/genai. The
  // bundler walks the import graph and tries to bundle
  // google-auth-library, which pulls node:net / child_process / fs
  // and breaks the build. Marking these packages as serverExternal
  // keeps them out of the client chunking entirely; they're loaded
  // as require() at runtime on the server only.
  serverExternalPackages: [
    "@google/genai",
    "google-auth-library",
    "gaxios",
    "node-fetch",
    "gcp-metadata",
  ],
  turbopack: {
    root: __dirname,
  },
  // Allow Next/Image optimization for Supabase Storage assets.
  // Every story cover, question image, and daily-archive thumbnail
  // lives under the storage subpath of our project's Supabase host;
  // without this allowlist Next/Image would refuse to serve them.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rwlvjtowmfrrqeqvwolo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // B2B (schools/teachers) retired — B2C only. 308-redirect the dead
  // marketing routes to home so indexed URLs and stale links never 404.
  async redirects() {
    // V2 lesson assets (audio + images) are gitignored: the factory writes them
    // locally and scripts/v2-assets-upload.ts mirrors them to Supabase Storage.
    // In production the app-relative paths every lesson definition carries are
    // redirected to the bucket (images as webp), so the runners and the
    // definitions never change. Dev serves the local files.
    const storage = process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public` : null;
    const useBucket = storage && (process.env.V2_ASSETS === "bucket" || (process.env.NODE_ENV === "production" && process.env.V2_ASSETS !== "local"));
    const assetRedirects = useBucket
      ? [
          { source: "/audio/lessons-v2/:path*", destination: `${storage}/audio/lessons-v2/:path*`, permanent: false },
          { source: "/audio/quizzes-v2/:path*", destination: `${storage}/audio/quizzes-v2/:path*`, permanent: false },
          { source: "/audio/warmups-v2/:path*", destination: `${storage}/audio/warmups-v2/:path*`, permanent: false },
          { source: "/images/lessons-v2/:path(.*)\\.png", destination: `${storage}/images/lessons-v2/:path*.webp`, permanent: false },
        ]
      : [];
    return [
      ...assetRedirects,
      { source: "/schools", destination: "/", permanent: true },
      { source: "/schools/:path*", destination: "/", permanent: true },
      { source: "/teachers", destination: "/", permanent: true },
      { source: "/privacy-for-schools", destination: "/", permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Pin the real org/project slugs so source-map upload always targets the
  // right place. Without these the plugin falls back to SENTRY_ORG /
  // SENTRY_PROJECT env vars, which were misconfigured ("readee" instead of
  // "readee-5u" / "javascript-nextjs") — so uploads 404'd and every prod
  // stack trace stayed minified. Auth still comes from SENTRY_AUTH_TOKEN.
  org: "readee-5u",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
