import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Testes do syncUserProfile
// Mock do Supabase para não depender de ligação real
// ============================================================

// Mock do módulo server do Supabase
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({ from: mockFrom }),
}));

// Import depois do mock
const { syncUserProfile } = await import("../user-profiles");

describe("syncUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({ error: null });
  });

  it("chama o upsert com os dados correctos", async () => {
    await syncUserProfile({
      userId: "user_abc123",
      email: "telmo@exemplo.com",
      name: "Telmo Cerveira",
      geniusComplete: true,
      manifestoComplete: false,
      vozDNAComplete: false,
    });

    expect(mockFrom).toHaveBeenCalledWith("user_profiles");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user_abc123",
        email: "telmo@exemplo.com",
        name: "Telmo Cerveira",
        genius_complete: true,
        manifesto_complete: false,
        voz_dna_complete: false,
      }),
      { onConflict: "user_id" }
    );
  });

  it("funciona com email vazio (fallback)", async () => {
    await expect(
      syncUserProfile({
        userId: "user_abc123",
        email: "",
        name: "Telmo",
        geniusComplete: false,
        manifestoComplete: false,
        vozDNAComplete: false,
      })
    ).resolves.not.toThrow();
  });

  it("inclui updated_at no upsert", async () => {
    await syncUserProfile({
      userId: "user_xyz",
      email: "x@x.com",
      name: "X",
      geniusComplete: false,
      manifestoComplete: false,
      vozDNAComplete: false,
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ updated_at: expect.any(String) }),
      expect.any(Object)
    );
  });

  it("não lança excepção quando Supabase devolve erro", async () => {
    mockUpsert.mockResolvedValue({ error: new Error("DB error") });

    // syncUserProfile não deve lançar — apenas faz log do erro
    await expect(
      syncUserProfile({
        userId: "user_err",
        email: "err@x.com",
        name: "Erro",
        geniusComplete: false,
        manifestoComplete: false,
        vozDNAComplete: false,
      })
    ).resolves.not.toThrow();
  });
});
