// ============================================================
// OPB Crew — Tipos TypeScript para todas as tabelas Supabase
// Sincronizado com as migrações 001-010
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export type Platform           = "instagram" | "linkedin" | "twitter" | "email";
export type ContentFormat      = "reel" | "carrossel" | "story" | "post" | "email";
export type SubscriptionStatus = "trial" | "active" | "cancelled" | "past_due";
export type SubscriptionPlan   = "trial" | "monthly" | "yearly";
export type PublishStatus      = "draft" | "scheduled" | "published" | "failed";

export type AuditAction =
  | "content.generate"
  | "content.delete"
  | "voz_dna.generate"
  | "voz_dna.save"
  | "manifesto.generate"
  | "editorial.generate"
  | "calendario.generate"
  | "profile.update"
  | "viral_research.generate";

// ── Tabela: generated_content (migrations 001, 008) ──────────

export interface GeneratedContent {
  id:         string;
  user_id:    string;               // ID Clerk (ex: "user_abc123")
  platform:   string;               // Legacy — mantido para dados antigos
  format:     ContentFormat | null; // Novo (migration 008)
  subtype:    string | null;        // Novo (migration 008)
  topic:      string;
  content:    string;
  deleted_at: string | null;        // Soft delete — null = activo
  created_at: string;
  updated_at: string;
}

export type GeneratedContentInsert = {
  user_id:  string;
  platform: string;    // Legacy (mantido para não quebrar queries antigas)
  format:   ContentFormat;
  subtype:  string;
  topic:    string;
  content:  string;
};

// ── Tabela: user_profiles (migrations 003, 007) ──────────────

export interface UserProfile {
  user_id:            string;
  email:              string;
  name:               string | null;
  genius_complete:    boolean;
  manifesto_complete: boolean;
  voz_dna_complete:   boolean;
  // Cores da marca (migration 007)
  brand_bg:           string | null;
  brand_surface:      string | null;
  brand_accent:       string | null;
  brand_text:         string | null;
  created_at:         string;
  updated_at:         string;
}

// ── Tabela: user_voice_profiles (migration 009) ──────────────

export interface VozDNA {
  arquetipo:           string;
  descricaoArquetipo?: string;
  tomEmTresPalavras:   string[];
  vocabularioActivo:   string[];
  vocabularioProibido: string[];
  frasesAssinatura:    string[];
  regrasEstilo:        string[];
}

export interface GeniusProfile {
  hendricksZone?:        string;
  wealthProfile?:        string;
  kolbeMode?:            string;
  fascinationAdvantage?: string;
  strengthsTop5?:        string[];
  sullivanUnique?:       string;
  hormoziOffer?:         string;
  [key: string]: unknown;
}

export interface UserVoiceProfile {
  user_id:            string;
  voz_dna:            VozDNA | null;
  genius_profile:     GeniusProfile | null;
  manifesto_answers:  Record<string, string> | null;
  editorial_lines:    unknown | null;
  voz_dna_version:    number;
  genius_version:     number;
  manifesto_version:  number;
  created_at:         string;
  updated_at:         string;
}

// ── Tabela: subscriptions (migration 004 — V2 Stripe) ────────

export interface Subscription {
  id:                 string;
  user_id:            string;
  stripe_customer_id: string | null;
  stripe_sub_id:      string | null;
  plan:               SubscriptionPlan;
  status:             SubscriptionStatus;
  trial_ends_at:      string | null;
  current_period_end: string | null;
  cancelled_at:       string | null;
  created_at:         string;
  updated_at:         string;
}

// ── Tabela: published_content (migration 005 — V2) ───────────

export interface PublishedContent {
  id:                   string;
  user_id:              string;
  generated_content_id: string | null;
  platform:             Platform;
  status:               PublishStatus;
  scheduled_for:        string | null;
  published_at:         string | null;
  social_post_id:       string | null;
  error_message:        string | null;
  created_at:           string;
  updated_at:           string;
}

export interface EngagementMetrics {
  id:                   string;
  published_content_id: string;
  likes:                number;
  comments:             number;
  shares:               number;
  views:                number;
  clicks:               number;
  synced_at:            string;
}

// ── Tabela: waitlist (migration 006) ─────────────────────────

export interface WaitlistEntry {
  id:         string;
  email:      string;
  nome:       string | null;
  created_at: string;
}

// ── Tabela: audit_log (migration 010) ────────────────────────

export interface AuditLog {
  id:         string;
  user_id:    string;
  action:     AuditAction;
  metadata:   Record<string, unknown> | null;
  success:    boolean;
  error_msg:  string | null;
  created_at: string;
}

// ── Tabela: rate_limits (migration 010) ──────────────────────

export interface RateLimit {
  id:         string;
  user_id:    string;
  endpoint:   string;
  created_at: string;
}
