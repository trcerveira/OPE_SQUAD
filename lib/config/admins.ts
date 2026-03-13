// ============================================================
// Access Control — OPE_SQUAD
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

// Beta whitelist — only these users can access the dashboard
// Reads from BETA_USERS env var (comma-separated); falls back to hardcoded defaults
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
 * Only users in BETA_USERS can access the dashboard.
 */
export function hasBetaAccess(email: string | null | undefined): boolean {
  if (!email) return false;
  return BETA_USERS.includes(email.toLowerCase().trim());
}
