import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Valida se um valor é uma cor hex válida (#RRGGBB)
function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await req.json()
  const { brand_bg, brand_surface, brand_accent, brand_text } = body

  // Valida todas as cores
  const colors = { brand_bg, brand_surface, brand_accent, brand_text }
  for (const [key, value] of Object.entries(colors)) {
    if (value && !isValidHex(value)) {
      return NextResponse.json(
        { error: `Cor inválida: ${key} deve ser um hex (#RRGGBB)` },
        { status: 400 }
      )
    }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('user_profiles')
    .update({
      brand_bg:      brand_bg      || '#0A0E1A',
      brand_surface: brand_surface || '#111827',
      brand_accent:  brand_accent  || '#BFD64B',
      brand_text:    brand_text    || '#F0ECE4',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao guardar cores:', error)
    return NextResponse.json({ error: 'Erro ao guardar' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
