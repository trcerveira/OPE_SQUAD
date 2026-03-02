import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateInput, BrandColorsSchema } from '@/lib/validators'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const validation = validateInput(BrandColorsSchema, rawBody)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const { brand_bg, brand_surface, brand_accent, brand_text } = validation.data

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
