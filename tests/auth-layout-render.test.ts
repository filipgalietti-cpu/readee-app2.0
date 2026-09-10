import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthLayout from "@/app/components/auth/AuthLayout";

const url = vi.hoisted(() => ({ query: "" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(url.query),
}));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href }, children),
}));
vi.mock("next/image", () => ({
  default: () => null,
}));

beforeEach(() => {
  // The test runner uses the classic JSX transform for imported TSX.
  vi.stubGlobal("React", React);
});
afterEach(() => vi.unstubAllGlobals());

describe("auth tab rendering", () => {
  for (const mode of ["signin", "signup"] as const) {
    it.each([
      "",
      "redirect=%2Fdashboard",
      "next=%2Fplacement%3Fchild%3Dtest&as=teacher",
      "redirect=%2Fexplore&tag=one&tag=two",
    ])("keeps %s consistent before and after hydration in " + mode, (query) => {
      url.query = query;
      const render = () => renderToStaticMarkup(
        React.createElement(AuthLayout, { mode, children: "Form" }),
      );
      vi.stubGlobal("window", undefined);
      const server = render();
      vi.stubGlobal("window", { location: { search: query ? `?${query}` : "" } });
      const client = render();
      expect(client).toBe(server);

      const suffix = query ? `?${new URLSearchParams(query).toString()}` : "";
      for (const route of ["/login", "/signup"]) {
        expect(server).toContain(`href="${route}${suffix.replaceAll("&", "&amp;")}"`);
      }
    });
  }
});
