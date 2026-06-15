import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { venueId: string } }
) {
  const supabase = await createClient()
  const venueId = params.venueId

  try {
    const { data, error } = await supabase
      .from('viewing_centers')
      .select('*')
      .eq('id', venueId)
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { venueId: string } }
) {
  const supabase = await createClient()
  const venueId = params.venueId
  const updates = await request.json()

  // Don't allow direct status changes
  delete updates.status
  delete updates.verification_status

  try {
    const { data, error } = await supabase
      .from('viewing_centers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', venueId)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { venueId: string } }
) {
  const supabase = await createClient()
  const venueId = params.venueId

  try {
    const { error } = await supabase
      .from('viewing_centers')
      .update({ status: 'inactive' })
      .eq('id', venueId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}