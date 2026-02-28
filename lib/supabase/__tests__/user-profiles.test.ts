import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Tests for syncUserProfile (optimised with select-before-upsert)
// ============================================================

// Chainable Supabase mock — supports .select().eq().maybeSingle() and .upsert()
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle, eq: mockEq }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockUpsert = vi.fn().mockResolvedValue({ error: null });

// from() returns an object that supports both patterns
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
    // Default: no existing profile → always upserts
    mockMaybeSingle.mockResolvedValue({ data: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle, eq: mockEq });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("calls upsert with correct data (no existing profile)", async () => {
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

  it("does NOT call upsert when data is unchanged", async () => {
    // Profile already exists with the same data
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

    // Must not upsert when nothing changed (optimisation)
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("calls upsert when email changed", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        email:              "old@email.com",
        name:               "Telmo",
        genius_complete:    false,
        manifesto_complete: false,
        voz_dna_complete:   false,
      },
    });

    await syncUserProfile({
      userId: "user_abc123",
      email:  "new@email.com",
      name:   "Telmo",
      geniusComplete:    false,
      manifestoComplete: false,
      vozDNAComplete:    false,
    });

    expect(mockUpsert).toHaveBeenCalled();
  });

  it("works with empty email (fallback)", async () => {
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

  it("includes updated_at in upsert", async () => {
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

  it("does not throw when Supabase returns an error", async () => {
    mockUpsert.mockResolvedValue({ error: new Error("DB error") });

    await expect(
      syncUserProfile({
        userId: "user_err",
        email: "err@x.com",
        name: "Error",
        geniusComplete: false,
        manifestoComplete: false,
        vozDNAComplete: false,
      })
    ).resolves.not.toThrow();
  });
});
