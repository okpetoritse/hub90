import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { venueId: string } }
) {
  const supabase = await createClient()
  const venueId = params.venueId
  const days = request.nextUrl.searchParams.get('days') || '30'

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const { data, error } = await supabase
      .from('venue_stats')
      .select('*')
      .eq('venue_id', venueId)
      .gte('created_at', startDate.toISOString())
      .order('match_date', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { venueId: string } }
) {
  const supabase = await createClient()
  const venueId = params.venueId
  const statsData = await request.json()

  try {
    const { data, error } = await supabase
      .from('venue_stats')
      .insert([
        {
          venue_id: venueId,
          ...statsData,
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