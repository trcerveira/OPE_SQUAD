import { describe, it, expect } from "vitest";
import { isAdmin, SUPER_ADMINS } from "../admins";

// ============================================================
// Tests for access control (isAdmin only — beta removed)
// ============================================================

describe("isAdmin", () => {
  it("returns true for the main super admin", () => {
    expect(isAdmin("trcerveira@gmail.com")).toBe(true);
  });

  it("is case-insensitive (uppercase/lowercase)", () => {
    expect(isAdmin("TRCERVEIRA@GMAIL.COM")).toBe(true);
    expect(isAdmin("TrCerveira@Gmail.Com")).toBe(true);
  });

  it("returns false for a non-admin email", () => {
    expect(isAdmin("user@example.com")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isAdmin(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAdmin(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isAdmin("")).toBe(false);
  });
});

describe("SUPER_ADMINS list", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(SUPER_ADMINS)).toBe(true);
    expect(SUPER_ADMINS.length).toBeGreaterThan(0);
  });

  it("contains the founder's email", () => {
    expect(SUPER_ADMINS).toContain("trcerveira@gmail.com");
  });
});
