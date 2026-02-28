// ============================================================
// Access Control — OPE_SQUAD
// ============================================================
// SECURITY: emails read from environment variables, not hard-coded.
//
// Configure in .env.local and in the Vercel Dashboard:
//   SUPER_ADMINS=trcerveira@gmail.com
//   BETA_USERS=trcerveira@gmail.com,other@email.com
//
// Fallback: if the variable does not exist, uses the default values below.
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
 * Checks whether an email belongs to a super admin.
 * Super admins have access to the /admin panel.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMINS.includes(email.toLowerCase().trim());
}

/**
 * Checks whether an email has beta access.
 * Used by the middleware to protect all dashboard routes.
 */
export function hasBetaAccess(email: string | null | undefined): boolean {
  if (!email) return false;
  // Super admins always have beta access
  const normalised = email.toLowerCase().trim();
  return BETA_USERS.includes(normalised) || SUPER_ADMINS.includes(normalised);
}
