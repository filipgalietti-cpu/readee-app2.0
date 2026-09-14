import { expect, it } from "vitest";
import { signupRejection, weakPasswordMessage } from "@/lib/auth/signup-rejection";

const SYMBOLS = "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~";

it("names the character sets Supabase spells out", () => {
  const message = `Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789, ${SYMBOLS}.`;
  expect(weakPasswordMessage({ message, reasons: ["characters"] })).toBe(
    "Include a lowercase letter, an uppercase letter, a number and a symbol.",
  );
  expect(weakPasswordMessage({ message: "Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, 0123456789." }))
    .toBe("Include a lowercase letter and a number.");
});

it("reads the minimum length from the message, and falls back to the reason", () => {
  expect(weakPasswordMessage({ message: "Password should be at least 10 characters." })).toBe("Use at least 10 characters.");
  expect(weakPasswordMessage({ message: "", reasons: ["length"] })).toBe("Use at least 8 characters.");
});

it("explains a breached password without repeating Supabase's wording", () => {
  expect(weakPasswordMessage({ message: "Password is known to be weak and easy to guess, please choose a different one." }))
    .toBe("That password shows up in known data breaches. Please choose a different one.");
  expect(weakPasswordMessage({ reasons: ["pwned"] })).toContain("data breaches");
  expect(weakPasswordMessage({})).toBe("Please choose a stronger password.");
});

it("routes each expected rejection to the field the parent can fix", () => {
  expect(signupRejection({ code: "weak_password", message: "Password should be at least 6 characters.", reasons: ["length"] }))
    .toEqual({ field: "password", message: "Use at least 6 characters." });
  expect(signupRejection({ code: "user_already_exists", message: "User already registered" })?.field).toBe("general");
  expect(signupRejection({ code: "email_address_invalid" })?.field).toBe("email");
  expect(signupRejection({ code: "over_email_send_rate_limit" })?.message).toContain("wait a minute");
});

it("leaves unexpected errors to the failure report", () => {
  expect(signupRejection({ code: "unexpected_failure", message: "boom" })).toBeNull();
  expect(signupRejection(new Error("network"))).toBeNull();
  expect(signupRejection(null)).toBeNull();
});
