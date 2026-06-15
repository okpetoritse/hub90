import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { userEmail, packId } = await request.json()

  if (!userEmail || !packId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Check if already purchased
    const { data: existing, error: checkError } = await supabase
      .from('user_sticker_packs')
      .select('id')
      .eq('user_email', userEmail)
      .eq('pack_id', packId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already purchased this pack' },
        { status: 400 }
      )
    }

    // Insert purchase
    const { data, error } = await supabase
      .from('user_sticker_packs')
      .insert([
        {
          user_email: userEmail,
          pack_id: packId,
          purchased_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}