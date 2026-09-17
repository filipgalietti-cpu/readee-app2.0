import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  exchangeError: null as Error | null,
  track: vi.fn(),
  update: vi.fn(),
  user: {
    id: "parent-1",
    app_metadata: { provider: "google" },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: async () => ({ error: state.exchangeError }),
      getUser: async () => ({ data: { user: state.user } }),
    },
    from: () => ({
      update: (value: unknown) => {
        state.update(value);
        return {
          eq: () => ({ eq: async () => ({ error: null }) }),
        };
      },
    }),
  }),
}));

vi.mock("@/lib/analytics/funnel.server", () => ({
  trackFunnel: state.track,
}));

import { GET } from "@/app/auth/callback/route";

const request = (query: string, cookie?: string) =>
  new Request(`https://learn.readee.app/auth/callback?${query}`, {
    headers: {
      "x-forwarded-host": "learn.readee.app",
      ...(cookie ? { cookie } : {}),
    },
  });

describe("auth callback continuity", () => {
  beforeEach(() => {
    state.exchangeError = null;
    state.track.mockClear();
    state.update.mockClear();
  });

  it("lands a new parent in placement and records attribution once", async () => {
    const attribution = encodeURIComponent(
      JSON.stringify({ utm_source: "newsletter", ref: "home-hero", child_name: "blocked" }),
    );
    const response = await GET(
      request(
        "code=valid&next=%2Fplacement%2Fsetup&signup_role=parent&ref=homepage-cta",
        `readee_attr=${attribution}`,
      ),
    );

    expect(response.headers.get("location")).toBe("https://learn.readee.app/placement/setup");
    expect(state.track).toHaveBeenCalledOnce();
    expect(state.track).toHaveBeenCalledWith(
      "funnel.signup_complete",
      "parent-1",
      expect.objectContaining({
        $insert_id: "signup:parent-1",
        provider: "google",
        role: "parent",
        intended_destination: "/placement/setup",
        signup_ref: "homepage-cta",
        attribution_utm_source: "newsletter",
        attribution_ref: "home-hero",
      }),
    );
    expect(state.track.mock.calls[0][2]).not.toHaveProperty("attribution_child_name");
  });

  it("does not count a returning Google login as a signup", async () => {
    const response = await GET(request("code=valid&next=%2Fplacement%2Fsetup"));

    expect(response.headers.get("location")).toBe("https://learn.readee.app/placement/setup");
    expect(state.track).not.toHaveBeenCalled();
  });

  it("falls back safely when next is external", async () => {
    const response = await GET(request("code=valid&next=%2F%2Fevil.example&signup_role=parent"));

    expect(response.headers.get("location")).toBe("https://learn.readee.app/dashboard");
  });
});
