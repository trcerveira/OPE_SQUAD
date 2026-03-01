import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasBetaAccess } from '@/lib/config/admins'

// Protected routes — only authenticated users WITH beta access
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
    // 1. Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // 2. Check beta access
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress

    if (!hasBetaAccess(email)) {
      // No beta access — redirect to pending page
      return NextResponse.redirect(new URL('/pending', req.url))
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
