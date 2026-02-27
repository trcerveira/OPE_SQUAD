// Configuração de administradores do OPB_CREW
// Para adicionar um novo admin, basta adicionar o email à lista abaixo.

export const SUPER_ADMINS: string[] = [
  "trcerveira@gmail.com", // Telmo Cerveira — Fundador
]

/**
 * Verifica se um email pertence a um super admin.
 * Uso: isAdmin(user.emailAddresses[0].emailAddress)
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return SUPER_ADMINS.includes(email.toLowerCase())
}
