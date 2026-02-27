// Configuração de administradores do OPB Crew
// Para adicionar um novo admin, basta adicionar o email à lista abaixo.

export const SUPER_ADMINS: string[] = [
  "trcerveira@gmail.com", // Telmo Cerveira — Fundador
]

// Lista de beta testers autorizados
// Para dar acesso a alguém, adiciona o email aqui.
export const BETA_USERS: string[] = [
  "trcerveira@gmail.com",         // Telmo Cerveira — Fundador
  "miguel.rodrigues@imomaster.com", // Miguel Rodrigues — Beta Tester
  "geral@arm-lda.com",              // Beta Tester
]

/**
 * Verifica se um email pertence a um super admin.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return SUPER_ADMINS.includes(email.toLowerCase())
}

/**
 * Verifica se um email tem acesso beta.
 * Uso: hasBetaAccess(user.emailAddresses[0].emailAddress)
 */
export function hasBetaAccess(email: string | null | undefined): boolean {
  if (!email) return false
  return BETA_USERS.includes(email.toLowerCase())
}
