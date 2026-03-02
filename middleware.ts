import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Protected routes — only authenticated users
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
  '/machine(.*)',
  '/design(.*)',
  '/calendario(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Run on everything except static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
