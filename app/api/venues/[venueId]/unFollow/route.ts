import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { venueId: string } }
) {
  const supabase = await createClient()
  const venueId = params.venueId
  const { followerEmail } = await request.json()

  if (!followerEmail) {
    return NextResponse.json({ error: 'Missing followerEmail' }, { status: 400 })
  }

  try {
    // Check if already following
    const { data: existing } = await supabase
      .from('venue_followers')
      .select('id')
      .eq('venue_id', venueId)
      .eq('follower_email', followerEmail)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already following this venue' },
        { status: 400 }
      )
    }

    // Add follower
    const { error: insertError } = await supabase
      .from('venue_followers')
      .insert([
        {
          venue_id: venueId,
          follower_email: followerEmail,
          followed_at: new Date().toISOString(),
        },
      ])

    if (insertError) throw insertError

    // Update followers count
    const { data: followers } = await supabase
      .from('venue_followers')
      .select('id', { count: 'exact' })
      .eq('venue_id', venueId)

    await supabase
      .from('viewing_centers')
      .update({ followers_count: followers?.length || 0 })
      .eq('id', venueId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}