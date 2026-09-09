import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { eventFiltersIntegration } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";

function options() {
  let config: any;
  const code = ts.transpileModule(readFileSync("instrumentation-client.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports: {}, process: { env: { NODE_ENV: "production" } }, require: (name: string) => name === "@sentry/nextjs" ? { init: (o: any) => { config = o; } } : {} });
  return config;
}
describe("Sentry noise filters", () => {
  const config = options();
  function filtered(message: string, filename: string) {
    const integration = eventFiltersIntegration();
    return integration.processEvent!({ message, exception: { values: [{ type: "Error", value: message, stacktrace: { frames: [{ filename }] } }] } }, {}, { getOptions: () => config } as any);
  }
  it("drops extension and injected-script errors without using allowUrls", () => {
    expect(config.allowUrls).toBeUndefined();
    expect(filtered("Cannot read properties of undefined (reading 'M_ID')", "app:///executors/200.js")).toBeNull();
    expect(filtered("extension broke", "chrome-extension://abc/inject.js")).toBeNull();
    expect(filtered("Can't find variable: zaloJSV2", "https://learn.readee.app/signup")).toBeNull();
  });
  it("retains an app failure even when the source is rewritten to app:///", () => {
    expect(filtered("placement.save failed", "app:///_next/static/chunks/app.js")).not.toBeNull();
  });
  it("leaves session replay off", () => {
    expect(config.replaysSessionSampleRate).toBe(0);
    expect(config.replaysOnErrorSampleRate).toBe(0);
  });
});
