import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Testes do syncUserProfile (optimizado com select-before-upsert)
// ============================================================

// Mock encadeável do Supabase — suporta .select().eq().maybeSingle() e .upsert()
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle, eq: mockEq }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockUpsert = vi.fn().mockResolvedValue({ error: null });

// from() devolve objecto que suporta ambos os padrões
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  upsert: mockUpsert,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({ from: mockFrom }),
}));

const { syncUserProfile } = await import("../user-profiles");

describe("syncUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defeito: sem perfil existente → sempre faz upsert
    mockMaybeSingle.mockResolvedValue({ data: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle, eq: mockEq });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("chama o upsert com os dados correctos (sem perfil existente)", async () => {
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
        user_id:            "user_abc123",
        email:              "telmo@exemplo.com",
        name:               "Telmo Cerveira",
        genius_complete:    true,
        manifesto_complete: false,
        voz_dna_complete:   false,
      }),
      { onConflict: "user_id" }
    );
  });

  it("NÃO chama upsert quando os dados são iguais ao perfil existente", async () => {
    // Perfil já existe com os mesmos dados
    mockMaybeSingle.mockResolvedValue({
      data: {
        email:              "telmo@exemplo.com",
        name:               "Telmo Cerveira",
        genius_complete:    true,
        manifesto_complete: false,
        voz_dna_complete:   false,
      },
    });

    await syncUserProfile({
      userId: "user_abc123",
      email: "telmo@exemplo.com",
      name: "Telmo Cerveira",
      geniusComplete: true,
      manifestoComplete: false,
      vozDNAComplete: false,
    });

    // Não deve fazer upsert quando nada mudou (optimização)
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("faz upsert quando o email mudou", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        email:              "antigo@email.com",
        name:               "Telmo",
        genius_complete:    false,
        manifesto_complete: false,
        voz_dna_complete:   false,
      },
    });

    await syncUserProfile({
      userId: "user_abc123",
      email:  "novo@email.com",
      name:   "Telmo",
      geniusComplete:    false,
      manifestoComplete: false,
      vozDNAComplete:    false,
    });

    expect(mockUpsert).toHaveBeenCalled();
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
