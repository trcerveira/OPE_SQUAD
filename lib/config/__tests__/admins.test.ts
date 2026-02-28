import { describe, it, expect } from "vitest";
import { isAdmin, hasBetaAccess, SUPER_ADMINS, BETA_USERS } from "../admins";

// ============================================================
// Testes das funções de acesso (isAdmin e hasBetaAccess)
// ============================================================

describe("isAdmin", () => {
  it("devolve true para o super admin principal", () => {
    expect(isAdmin("trcerveira@gmail.com")).toBe(true);
  });

  it("é case-insensitive (maiúsculas/minúsculas)", () => {
    expect(isAdmin("TRCERVEIRA@GMAIL.COM")).toBe(true);
    expect(isAdmin("TrCerveira@Gmail.Com")).toBe(true);
  });

  it("devolve false para email não admin", () => {
    expect(isAdmin("utilizador@exemplo.com")).toBe(false);
  });

  it("devolve false para null", () => {
    expect(isAdmin(null)).toBe(false);
  });

  it("devolve false para undefined", () => {
    expect(isAdmin(undefined)).toBe(false);
  });

  it("devolve false para string vazia", () => {
    expect(isAdmin("")).toBe(false);
  });
});

describe("hasBetaAccess", () => {
  it("devolve true para o fundador", () => {
    expect(hasBetaAccess("trcerveira@gmail.com")).toBe(true);
  });

  it("é case-insensitive", () => {
    expect(hasBetaAccess("TRCERVEIRA@GMAIL.COM")).toBe(true);
  });

  it("devolve false para email sem acesso", () => {
    expect(hasBetaAccess("estranho@exemplo.com")).toBe(false);
  });

  it("devolve false para null", () => {
    expect(hasBetaAccess(null)).toBe(false);
  });

  it("devolve false para undefined", () => {
    expect(hasBetaAccess(undefined)).toBe(false);
  });
});

describe("SUPER_ADMINS lista", () => {
  it("é um array não vazio", () => {
    expect(Array.isArray(SUPER_ADMINS)).toBe(true);
    expect(SUPER_ADMINS.length).toBeGreaterThan(0);
  });

  it("contém o email do fundador", () => {
    expect(SUPER_ADMINS).toContain("trcerveira@gmail.com");
  });
});

describe("BETA_USERS lista", () => {
  it("é um array não vazio", () => {
    expect(Array.isArray(BETA_USERS)).toBe(true);
    expect(BETA_USERS.length).toBeGreaterThan(0);
  });

  it("inclui todos os super admins", () => {
    for (const admin of SUPER_ADMINS) {
      expect(hasBetaAccess(admin)).toBe(true);
    }
  });
});
