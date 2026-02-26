// Tipos da base de dados Supabase
// Reflecte a tabela generated_content criada no Supabase

export interface GeneratedContent {
  id: string;
  user_id: string;
  platform: string;
  topic: string;
  content: string;
  created_at: string;
}

// Formato exigido pelo Supabase SDK v2
export interface Database {
  public: {
    Tables: {
      generated_content: {
        Row: GeneratedContent;
        Insert: Omit<GeneratedContent, "id" | "created_at">;
        Update: Partial<Omit<GeneratedContent, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  // Campo obrigatório pelo SDK
  [key: string]: unknown;
}
