// ============================================================
// Access Control — OPE_SQUAD
// ============================================================
// Only super admins are needed now (for /admin panel).
// All dashboard routes are open to any authenticated user.
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

/**
 * Checks whether an email belongs to a super admin.
 * Super admins have access to the /admin panel.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMINS.includes(email.toLowerCase().trim());
}
