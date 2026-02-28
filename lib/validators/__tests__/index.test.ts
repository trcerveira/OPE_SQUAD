import { describe, it, expect } from "vitest";
import {
  GenerateSchema,
  DeleteContentSchema,
  VozDNASchema,
  WaitlistSchema,
  validateInput,
} from "../index";

// ============================================================
// Testes dos Schemas de Validação (Zod)
// ============================================================

describe("GenerateSchema", () => {
  it("aceita input válido", () => {
    const resultado = GenerateSchema.safeParse({
      platform: "instagram",
      topic: "Como criar conteúdo viral",
    });
    expect(resultado.success).toBe(true);
  });

  it("aceita input com vozDNA opcional", () => {
    const resultado = GenerateSchema.safeParse({
      platform: "linkedin",
      topic: "Estratégias para solopreneurs",
      vozDNA: {
        arquetipo: "O Criador",
        tomEmTresPalavras: ["directo", "autêntico", "prático"],
      },
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita plataforma inválida", () => {
    const resultado = GenerateSchema.safeParse({
      platform: "tiktok",
      topic: "Tema qualquer",
    });
    expect(resultado.success).toBe(false);
    // Zod v4 — mensagem de enum inclui as opções válidas
    if (!resultado.success) {
      expect(resultado.error.issues[0].path).toContain("platform");
    }
  });

  it("rejeita topic demasiado curto", () => {
    const resultado = GenerateSchema.safeParse({
      platform: "instagram",
      topic: "ab",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita topic demasiado longo (501 chars)", () => {
    const resultado = GenerateSchema.safeParse({
      platform: "twitter",
      topic: "a".repeat(501),
    });
    expect(resultado.success).toBe(false);
  });

  it("aceita todas as plataformas válidas", () => {
    const plataformas = ["instagram", "linkedin", "twitter", "email"];
    for (const platform of plataformas) {
      const resultado = GenerateSchema.safeParse({ platform, topic: "Tema válido" });
      expect(resultado.success).toBe(true);
    }
  });
});

describe("DeleteContentSchema", () => {
  it("aceita UUID válido", () => {
    const resultado = DeleteContentSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita string que não é UUID", () => {
    const resultado = DeleteContentSchema.safeParse({ id: "nao-e-uuid" });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toContain("UUID");
    }
  });

  it("rejeita id em falta", () => {
    const resultado = DeleteContentSchema.safeParse({});
    expect(resultado.success).toBe(false);
  });
});

describe("VozDNASchema", () => {
  const vozDNAValido = {
    arquetipo: "O Criador",
    tomEmTresPalavras: ["directo", "autêntico", "prático"],
    vocabularioActivo: ["transformar", "criar", "escalar"],
    vocabularioProibido: ["impossível", "difícil"],
    frasesAssinatura: ["Um negócio, uma pessoa, muito impacto."],
    regrasEstilo: ["Frases curtas. Sempre."],
  };

  it("aceita vozDNA válido", () => {
    const resultado = VozDNASchema.safeParse({ vozDNA: vozDNAValido });
    expect(resultado.success).toBe(true);
  });

  it("aceita com descricaoArquetipo opcional", () => {
    const resultado = VozDNASchema.safeParse({
      vozDNA: { ...vozDNAValido, descricaoArquetipo: "Alguém que cria coisas novas" },
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita arquetipo vazio", () => {
    const resultado = VozDNASchema.safeParse({
      vozDNA: { ...vozDNAValido, arquetipo: "" },
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita vocabularioActivo vazio", () => {
    const resultado = VozDNASchema.safeParse({
      vozDNA: { ...vozDNAValido, vocabularioActivo: [] },
    });
    expect(resultado.success).toBe(false);
  });
});

describe("WaitlistSchema", () => {
  it("aceita email e nome válidos", () => {
    const resultado = WaitlistSchema.safeParse({
      email: "telmo@exemplo.com",
      name: "Telmo Cerveira",
    });
    expect(resultado.success).toBe(true);
  });

  it("aceita sem nome (opcional)", () => {
    const resultado = WaitlistSchema.safeParse({ email: "telmo@exemplo.com" });
    expect(resultado.success).toBe(true);
  });

  it("normaliza email para lowercase", () => {
    const resultado = WaitlistSchema.safeParse({ email: "TELMO@EXEMPLO.COM" });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.email).toBe("telmo@exemplo.com");
    }
  });

  it("rejeita email inválido", () => {
    const resultado = WaitlistSchema.safeParse({ email: "nao-e-email" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita nome demasiado curto", () => {
    const resultado = WaitlistSchema.safeParse({ email: "x@x.com", name: "A" });
    expect(resultado.success).toBe(false);
  });
});

describe("validateInput (helper)", () => {
  it("devolve success: true quando válido", () => {
    const resultado = validateInput(DeleteContentSchema, {
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  it("devolve success: false com mensagem de erro quando inválido", () => {
    const resultado = validateInput(DeleteContentSchema, { id: "nao-uuid" });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(typeof resultado.error).toBe("string");
      expect(resultado.error.length).toBeGreaterThan(0);
    }
  });
});
