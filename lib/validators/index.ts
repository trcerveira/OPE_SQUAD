import { z } from "zod";

// ============================================================
// OPB Crew — Schemas de Validação (Zod)
// Cobertura: TODAS as API routes com input do utilizador
// ============================================================

// ── Enums reutilizáveis ──────────────────────────────────────

export const PlatformSchema = z.enum(["instagram", "linkedin", "twitter", "email"]);

export const FormatSchema = z.enum(["reel", "carrossel", "story", "post", "email"]);

// ── POST /api/generate — gerar conteúdo ─────────────────────

export const GenerateSchema = z.object({
  format:  FormatSchema.optional().default("post"),
  subtype: z.string().min(1).max(100).trim().optional().default("instagram"),
  // Retrocompatibilidade com o campo antigo "platform"
  platform: PlatformSchema.optional(),
  topic: z
    .string({ required_error: "O tema é obrigatório" })
    .min(3, "O tema deve ter pelo menos 3 caracteres")
    .max(500, "O tema não pode ter mais de 500 caracteres")
    .trim(),
  vozDNA: z
    .object({
      arquetipo:            z.string().optional(),
      descricaoArquetipo:   z.string().optional(),
      tomEmTresPalavras:    z.array(z.string()).optional(),
      vocabularioActivo:    z.array(z.string()).optional(),
      vocabularioProibido:  z.array(z.string()).optional(),
      frasesAssinatura:     z.array(z.string()).optional(),
      regrasEstilo:         z.array(z.string()).optional(),
    })
    .optional(),
});

// ── DELETE /api/content?id=xxx — apagar conteúdo ────────────

export const DeleteContentSchema = z.object({
  id: z
    .string({ required_error: "O id é obrigatório" })
    .uuid("O id deve ser um UUID válido"),
});

// ── POST /api/voz-dna (guardar DNA gerado) ──────────────────

export const VozDNASchema = z.object({
  vozDNA: z.object({
    arquetipo:            z.string().min(1),
    descricaoArquetipo:   z.string().optional(),
    tomEmTresPalavras:    z.array(z.string()).min(1).max(5),
    vocabularioActivo:    z.array(z.string()).min(1).max(20),
    vocabularioProibido:  z.array(z.string()).min(1).max(20),
    frasesAssinatura:     z.array(z.string()).max(10),
    regrasEstilo:         z.array(z.string()).max(10),
  }),
});

// ── POST /api/voz-dna (respostas das 8 perguntas → Claude) ──

export const VozDNAAnswersSchema = z.object({
  answers: z.object({
    tom:                z.string().min(1, "Campo 'tom' é obrigatório").max(1000),
    personagem:         z.string().min(1, "Campo 'personagem' é obrigatório").max(1000),
    emocao:             z.string().min(1, "Campo 'emocao' é obrigatório").max(1000),
    vocabularioActivo:  z.string().min(1, "Campo 'vocabularioActivo' é obrigatório").max(1000),
    vocabularioProibido:z.string().min(1, "Campo 'vocabularioProibido' é obrigatório").max(1000),
    frasesAssinatura:   z.string().min(1, "Campo 'frasesAssinatura' é obrigatório").max(1000),
    estrutura:          z.string().min(1, "Campo 'estrutura' é obrigatório").max(1000),
    posicao:            z.string().min(1, "Campo 'posicao' é obrigatório").max(1000),
  }),
});

// ── POST /api/manifesto ──────────────────────────────────────

export const ManifestoSchema = z.object({
  answers: z.object({
    especialidade: z.string().min(1).max(2000),
    personalidade: z.string().min(1).max(2000),
    irritacoes:    z.string().min(1).max(2000),
    publicoAlvo:   z.string().min(1).max(2000),
    transformacao: z.string().min(1).max(2000),
    resultados:    z.string().min(1).max(2000),
    crencas:       z.string().min(1).max(2000),
    proposito:     z.string().min(1).max(2000),
    visao:         z.string().min(1).max(2000),
  }),
});

// ── POST /api/viral-research ─────────────────────────────────

export const ViralResearchSchema = z.object({
  platform: z.string().min(1).max(50).trim(),
  topic:    z.string().min(3, "O tema deve ter pelo menos 3 caracteres").max(500).trim(),
});

// ── POST /api/editorial ──────────────────────────────────────

export const EditorialSchema = z.object({
  // Todos opcionais — a rota busca do Clerk se não enviados
  manifesto:    z.any().optional(),
  vozDNA:       z.any().optional(),
  geniusProfile:z.any().optional(),
});

// ── POST /api/calendario ─────────────────────────────────────

export const CalendarioSchema = z.object({
  form: z.object({
    dias:       z.number().int().min(1).max(90),
    formatos:   z.array(z.string()).min(1, "Selecciona pelo menos 1 formato"),
    objectivo:  z.string().min(1).max(100),
    dataInicio: z.string().min(1),
  }),
  editorialLines: z.array(z.any()).optional(),
});

// ── POST /api/generate-caption ───────────────────────────────

export const GenerateCaptionSchema = z.object({
  headline: z.string().min(1, "Headline é obrigatório").max(500).trim(),
  body:     z.string().max(2000).trim().optional(),
  platform: z.string().min(1).max(50).default("Instagram"),
  niche:    z.string().max(200).trim().optional(),
});

// ── POST /api/settings/brand-colors ─────────────────────────

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser formato #RRGGBB");

export const BrandColorsSchema = z.object({
  brand_bg:      hexColor.optional(),
  brand_surface: hexColor.optional(),
  brand_accent:  hexColor.optional(),
  brand_text:    hexColor.optional(),
});

// ── POST /api/waitlist ───────────────────────────────────────

export const WaitlistSchema = z.object({
  email: z
    .string({ required_error: "O email é obrigatório" })
    .email("Email inválido")
    .toLowerCase()
    .trim(),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").trim().optional(),
});

// ── Tipos TypeScript inferidos ───────────────────────────────

export type GenerateInput        = z.infer<typeof GenerateSchema>;
export type VozDNAInput          = z.infer<typeof VozDNASchema>;
export type VozDNAAnswersInput   = z.infer<typeof VozDNAAnswersSchema>;
export type ManifestoInput       = z.infer<typeof ManifestoSchema>;
export type ViralResearchInput   = z.infer<typeof ViralResearchSchema>;
export type CalendarioInput      = z.infer<typeof CalendarioSchema>;
export type GenerateCaptionInput = z.infer<typeof GenerateCaptionSchema>;
export type BrandColorsInput     = z.infer<typeof BrandColorsSchema>;
export type WaitlistInput        = z.infer<typeof WaitlistSchema>;

// ── Função auxiliar ──────────────────────────────────────────

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Zod v4: usa .issues em vez de .errors
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message ?? "Input inválido" };
}
