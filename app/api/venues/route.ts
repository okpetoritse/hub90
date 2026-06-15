import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const creator = request.nextUrl.searchParams.get('creator')
  const verified = request.nextUrl.searchParams.get('verified')

  try {
    let query = supabase
      .from('viewing_centers')
      .select('*')
      .eq('status', 'active')

    if (creator) {
      query = query.eq('creator_email', creator)
    }

    if (verified === 'true') {
      query = query.eq('is_verified', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const {
    venue_name,
    location,
    creator_email,
    venue_type,
    description,
    capacity,
    phone_number,
    tags,
  } = body

  if (!venue_name || !creator_email) {
    return NextResponse.json(
      { error: 'Missing required fields: venue_name, creator_email' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase
      .from('viewing_centers')
      .insert([
        {
          venue_name,
          location: location || 'Virtual',
          creator_email,
          venue_type: venue_type || 'virtual',
          description,
          capacity,
          phone_number,
          tags,
          is_certified: false,
          status: 'pending',
          verification_status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}