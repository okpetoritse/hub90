import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const userEmail = request.nextUrl.searchParams.get('userEmail')

  try {
    if (userEmail) {
      // Get user's purchased sticker packs
      const { data, error } = await supabase
        .from('user_sticker_packs')
        .select(
          `
          id,
          user_email,
          pack_id,
          purchased_at,
          is_favorite,
          sticker_packs:pack_id(*)
        `
        )
        .eq('user_email', userEmail)

      if (error) throw error
      return NextResponse.json(data)
    } else {
      // Get all active sticker packs
      const { data, error } = await supabase
        .from('sticker_packs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json(data)
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}