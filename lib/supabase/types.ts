// ============================================================
// OPB Crew — Tipos da Base de Dados Supabase
// Reflecte todas as tabelas definidas em supabase/migrations/
// ============================================================

// --- ENUMS ---

export type Platform = "instagram" | "linkedin" | "twitter" | "email";
export type SubscriptionStatus = "trial" | "active" | "cancelled" | "past_due";
export type SubscriptionPlan = "trial" | "monthly" | "yearly";
export type PublishStatus = "draft" | "scheduled" | "published" | "failed";

// --- INTERFACES ---

// Tabela: generated_content (Migration 001)
export interface GeneratedContent {
  id: string;
  user_id: string;        // ID Clerk (user_xxxxxxx)
  platform: Platform;
  topic: string;
  content: string;
  created_at: string;
}

// Tabela: user_profiles (Migration 003)
export interface UserProfile {
  user_id: string;        // ID Clerk (user_xxxxxxx) — PK
  email: string;
  name: string | null;
  genius_complete: boolean;
  manifesto_complete: boolean;
  voz_dna_complete: boolean;
  created_at: string;
  updated_at: string;
}

// Tabela: subscriptions (Migration 004 — V2 Stripe)
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_sub_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

// Tabela: published_content (Migration 005 — V2 Auto-Publish)
export interface PublishedContent {
  id: string;
  user_id: string;
  generated_content_id: string | null;
  platform: Platform;
  status: PublishStatus;
  scheduled_for: string | null;
  published_at: string | null;
  social_post_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Tabela: engagement_metrics (Migration 005 — V2 Auto-Publish)
export interface EngagementMetrics {
  id: string;
  published_content_id: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  clicks: number;
  synced_at: string;
}

// --- DATABASE SCHEMA (Supabase SDK v2) ---

export interface Database {
  public: {
    Tables: {
      generated_content: {
        Row: GeneratedContent;
        Insert: Omit<GeneratedContent, "id" | "created_at">;
        Update: Partial<Omit<GeneratedContent, "id">>;
        Relationships: [];
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<UserProfile, "user_id" | "created_at">>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subscription, "id" | "created_at">>;
        Relationships: [
          { foreignKeyName: "subscriptions_user_id_fkey"; columns: ["user_id"]; referencedRelation: "user_profiles"; referencedColumns: ["user_id"] }
        ];
      };
      published_content: {
        Row: PublishedContent;
        Insert: Omit<PublishedContent, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PublishedContent, "id" | "created_at">>;
        Relationships: [
          { foreignKeyName: "published_content_user_id_fkey"; columns: ["user_id"]; referencedRelation: "user_profiles"; referencedColumns: ["user_id"] }
        ];
      };
      engagement_metrics: {
        Row: EngagementMetrics;
        Insert: Omit<EngagementMetrics, "id">;
        Update: Partial<Omit<EngagementMetrics, "id">>;
        Relationships: [
          { foreignKeyName: "engagement_metrics_published_content_id_fkey"; columns: ["published_content_id"]; referencedRelation: "published_content"; referencedColumns: ["id"] }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      platform: Platform;
      subscription_status: SubscriptionStatus;
      publish_status: PublishStatus;
    };
    CompositeTypes: Record<string, never>;
  };
  [key: string]: unknown;
}
