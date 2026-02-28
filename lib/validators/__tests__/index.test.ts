import { describe, it, expect } from "vitest";
import {
  GenerateSchema,
  DeleteContentSchema,
  VozDNASchema,
  WaitlistSchema,
  validateInput,
} from "../index";

// ============================================================
// Tests for Validation Schemas (Zod)
// ============================================================

describe("GenerateSchema", () => {
  it("accepts valid input", () => {
    const result = GenerateSchema.safeParse({
      platform: "instagram",
      topic: "Como criar conteúdo viral",
    });
    expect(result.success).toBe(true);
  });

  it("accepts input with optional vozDNA", () => {
    const result = GenerateSchema.safeParse({
      platform: "linkedin",
      topic: "Estratégias para solopreneurs",
      vozDNA: {
        arquetipo: "O Criador",
        tomEmTresPalavras: ["directo", "autêntico", "prático"],
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid platform", () => {
    const result = GenerateSchema.safeParse({
      platform: "tiktok",
      topic: "Tema qualquer",
    });
    expect(result.success).toBe(false);
    // Zod v4 — enum message includes valid options
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("platform");
    }
  });

  it("rejects topic that is too short", () => {
    const result = GenerateSchema.safeParse({
      platform: "instagram",
      topic: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejects topic that is too long (501 chars)", () => {
    const result = GenerateSchema.safeParse({
      platform: "twitter",
      topic: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid platforms", () => {
    const platforms = ["instagram", "linkedin", "twitter", "email"];
    for (const platform of platforms) {
      const result = GenerateSchema.safeParse({ platform, topic: "Valid topic" });
      expect(result.success).toBe(true);
    }
  });
});

describe("DeleteContentSchema", () => {
  it("accepts a valid UUID", () => {
    const result = DeleteContentSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a string that is not a UUID", () => {
    const result = DeleteContentSchema.safeParse({ id: "not-a-uuid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("UUID");
    }
  });

  it("rejects missing id", () => {
    const result = DeleteContentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("VozDNASchema", () => {
  const validVozDNA = {
    arquetipo: "O Criador",
    tomEmTresPalavras: ["directo", "autêntico", "prático"],
    vocabularioActivo: ["transformar", "criar", "escalar"],
    vocabularioProibido: ["impossível", "difícil"],
    frasesAssinatura: ["Um negócio, uma pessoa, muito impacto."],
    regrasEstilo: ["Frases curtas. Sempre."],
  };

  it("accepts valid vozDNA", () => {
    const result = VozDNASchema.safeParse({ vozDNA: validVozDNA });
    expect(result.success).toBe(true);
  });

  it("accepts with optional descricaoArquetipo", () => {
    const result = VozDNASchema.safeParse({
      vozDNA: { ...validVozDNA, descricaoArquetipo: "Alguém que cria coisas novas" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty arquetipo", () => {
    const result = VozDNASchema.safeParse({
      vozDNA: { ...validVozDNA, arquetipo: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty vocabularioActivo", () => {
    const result = VozDNASchema.safeParse({
      vozDNA: { ...validVozDNA, vocabularioActivo: [] },
    });
    expect(result.success).toBe(false);
  });
});

describe("WaitlistSchema", () => {
  it("accepts valid email and name", () => {
    const result = WaitlistSchema.safeParse({
      email: "telmo@exemplo.com",
      name: "Telmo Cerveira",
    });
    expect(result.success).toBe(true);
  });

  it("accepts without name (optional)", () => {
    const result = WaitlistSchema.safeParse({ email: "telmo@exemplo.com" });
    expect(result.success).toBe(true);
  });

  it("normalises email to lowercase", () => {
    const result = WaitlistSchema.safeParse({ email: "TELMO@EXEMPLO.COM" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("telmo@exemplo.com");
    }
  });

  it("rejects invalid email", () => {
    const result = WaitlistSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects name that is too short", () => {
    const result = WaitlistSchema.safeParse({ email: "x@x.com", name: "A" });
    expect(result.success).toBe(false);
  });
});

describe("validateInput (helper)", () => {
  it("returns success: true when valid", () => {
    const result = validateInput(DeleteContentSchema, {
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  it("returns success: false with error message when invalid", () => {
    const result = validateInput(DeleteContentSchema, { id: "not-a-uuid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe("string");
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});
