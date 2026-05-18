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
};

export default withSentryConfig(nextConfig, {
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
