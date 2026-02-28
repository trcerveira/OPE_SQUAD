// ============================================================
// Controle de Acesso — OPB Crew
// ============================================================
// SEGURANÇA: emails lidos de variáveis de ambiente, não hard-coded no código.
//
// Configurar em .env.local e no Vercel Dashboard:
//   SUPER_ADMINS=trcerveira@gmail.com
//   BETA_USERS=trcerveira@gmail.com,outro@email.com
//
// Fallback: se a var não existir, usa os valores por defeito abaixo.
// ============================================================

function parseEmailList(envVar: string | undefined, defaults: string[]): string[] {
  if (!envVar) return defaults.map(e => e.toLowerCase().trim());
  return envVar
    .split(",")
    .map(e => e.toLowerCase().trim())
    .filter(Boolean);
}

export const SUPER_ADMINS: string[] = parseEmailList(
  process.env.SUPER_ADMINS,
  ["trcerveira@gmail.com"]
);

export const BETA_USERS: string[] = parseEmailList(
  process.env.BETA_USERS,
  [
    "trcerveira@gmail.com",
    "miguel.rodrigues@imomaster.com",
    "geral@arm-lda.com",
    "cleciofwise@hotmail.com",
    "bruno@pulsifyai.com",
  ]
);

/**
 * Verifica se um email pertence a um super admin.
 * Super admins têm acesso ao painel /admin.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMINS.includes(email.toLowerCase().trim());
}

/**
 * Verifica se um email tem acesso beta.
 * Usado pelo middleware para proteger todas as rotas do dashboard.
 */
export function hasBetaAccess(email: string | null | undefined): boolean {
  if (!email) return false;
  // Super admins têm sempre acesso beta
  const normalised = email.toLowerCase().trim();
  return BETA_USERS.includes(normalised) || SUPER_ADMINS.includes(normalised);
}
