import { z } from "zod";

// ============================================================
// OPB Crew — Schemas de Validação (Zod)
// Usados nas API routes para validar input do utilizador
// ============================================================

// Plataformas suportadas
export const PlatformSchema = z.enum(["instagram", "linkedin", "twitter", "email"], {
  errorMap: () => ({ message: "Plataforma inválida. Usa: instagram, linkedin, twitter ou email" }),
});

// POST /api/generate — gerar conteúdo
export const GenerateSchema = z.object({
  platform: PlatformSchema,
  topic: z
    .string({ required_error: "O tema é obrigatório" })
    .min(3, "O tema deve ter pelo menos 3 caracteres")
    .max(500, "O tema não pode ter mais de 500 caracteres")
    .trim(),
  vozDNA: z
    .object({
      arquetipo: z.string().optional(),
      descricaoArquetipo: z.string().optional(),
      tomEmTresPalavras: z.array(z.string()).optional(),
      vocabularioActivo: z.array(z.string()).optional(),
      vocabularioProibido: z.array(z.string()).optional(),
      frasesAssinatura: z.array(z.string()).optional(),
      regrasEstilo: z.array(z.string()).optional(),
    })
    .optional(),
});

// DELETE /api/content?id=xxx — apagar conteúdo
export const DeleteContentSchema = z.object({
  id: z
    .string({ required_error: "O id é obrigatório" })
    .uuid("O id deve ser um UUID válido"),
});

// POST /api/voz-dna — guardar Voz & DNA
export const VozDNASchema = z.object({
  vozDNA: z.object({
    arquetipo: z.string().min(1),
    descricaoArquetipo: z.string().optional(),
    tomEmTresPalavras: z.array(z.string()).min(1).max(5),
    vocabularioActivo: z.array(z.string()).min(1).max(20),
    vocabularioProibido: z.array(z.string()).min(1).max(20),
    frasesAssinatura: z.array(z.string()).max(10),
    regrasEstilo: z.array(z.string()).max(10),
  }),
});

// POST /api/waitlist — lista de espera
export const WaitlistSchema = z.object({
  email: z
    .string({ required_error: "O email é obrigatório" })
    .email("Email inválido")
    .toLowerCase()
    .trim(),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").trim().optional(),
});

// Tipos inferidos dos schemas
export type GenerateInput  = z.infer<typeof GenerateSchema>;
export type VozDNAInput    = z.infer<typeof VozDNASchema>;
export type WaitlistInput  = z.infer<typeof WaitlistSchema>;

// Função auxiliar — valida e devolve erro formatado
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return { success: false, error: firstError?.message ?? "Input inválido" };
}
