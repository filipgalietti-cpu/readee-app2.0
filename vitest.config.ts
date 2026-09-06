import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      // Next resolves "server-only" internally as a build-time guard; under
      // vitest it does not exist, so modules carrying it would be untestable.
      // Aliasing keeps the guard real in the build and out of the way in tests.
      "server-only": path.resolve(__dirname, "./tests/stubs/server-only.ts"),
    },
  },
});
