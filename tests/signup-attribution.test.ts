import { describe, expect, it } from "vitest";
import { signupAttributionFromCookie } from "@/lib/analytics/signup-attribution";

describe("signup attribution", () => {
  it("reads only bounded marketing fields from the shared-domain cookie", () => {
    const value = encodeURIComponent(
      JSON.stringify({
        utm_source: "newsletter",
        ref: "hero",
        landing: "/reading-assessment",
        email: "parent@example.com",
        child_name: "Do not collect",
      }),
    );

    expect(signupAttributionFromCookie(`other=1; readee_attr=${value}; theme=light`)).toEqual({
      attribution_utm_source: "newsletter",
      attribution_ref: "hero",
      attribution_landing: "/reading-assessment",
    });
  });

  it.each([null, "readee_attr=not-json", `readee_attr=${"x".repeat(1_201)}`])(
    "ignores malformed attribution: %s",
    (header) => {
      expect(signupAttributionFromCookie(header)).toEqual({});
    },
  );
});
