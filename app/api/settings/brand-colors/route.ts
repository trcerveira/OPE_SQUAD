import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Validates whether a value is a valid hex colour (#RRGGBB)
function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const { brand_bg, brand_surface, brand_accent, brand_text } = body

  // Validate all colours
  const colors = { brand_bg, brand_surface, brand_accent, brand_text }
  for (const [key, value] of Object.entries(colors)) {
    if (value && !isValidHex(value)) {
      return NextResponse.json(
        { error: `Invalid colour: ${key} must be a hex value (#RRGGBB)` },
        { status: 400 }
      )
    }
  }

  const supabase = createServerClient()

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id:       userId,
      brand_bg:      brand_bg      || '#0A0E1A',
      brand_surface: brand_surface || '#111827',
      brand_accent:  brand_accent  || '#BFD64B',
      brand_text:    brand_text    || '#F0ECE4',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('Error saving brand colours:', error)
    return NextResponse.json({ error: 'Error saving' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
