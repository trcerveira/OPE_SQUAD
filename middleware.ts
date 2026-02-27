import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasBetaAccess } from '@/lib/config/admins'

// Rotas protegidas — só utilizadores autenticados E com acesso beta
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/content(.*)',
  '/genius(.*)',
  '/manifesto(.*)',
  '/voz-dna(.*)',
  '/editorial(.*)',
  '/settings(.*)',
  '/admin(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // 1. Verifica autenticação manualmente (evita o bug do auth.protect() em dev mode)
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // 2. Verifica se tem acesso beta
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress

    if (!hasBetaAccess(email)) {
      // Sem acesso — redireciona para a landing page (lista de espera)
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Corre em tudo excepto ficheiros estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
