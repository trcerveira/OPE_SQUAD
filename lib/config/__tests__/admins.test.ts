import { describe, it, expect } from "vitest";
import { isAdmin, hasBetaAccess, SUPER_ADMINS, BETA_USERS } from "../admins";

// ============================================================
// Tests for access control functions (isAdmin and hasBetaAccess)
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

describe("hasBetaAccess", () => {
  it("returns true for the founder", () => {
    expect(hasBetaAccess("trcerveira@gmail.com")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(hasBetaAccess("TRCERVEIRA@GMAIL.COM")).toBe(true);
  });

  it("returns false for email without access", () => {
    expect(hasBetaAccess("stranger@example.com")).toBe(false);
  });

  it("returns false for null", () => {
    expect(hasBetaAccess(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(hasBetaAccess(undefined)).toBe(false);
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

describe("BETA_USERS list", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(BETA_USERS)).toBe(true);
    expect(BETA_USERS.length).toBeGreaterThan(0);
  });

  it("includes all super admins", () => {
    for (const admin of SUPER_ADMINS) {
      expect(hasBetaAccess(admin)).toBe(true);
    }
  });
});
