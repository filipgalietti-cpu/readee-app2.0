import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // One-off dev/authoring/upload tooling — not shipped product code. Linting
    // it buried the real app findings under ~575 script errors, making
    // `npm run lint` useless. Product code (app/, lib/) is still linted.
    "scripts/**",
  ]),
]);

export default eslintConfig;
