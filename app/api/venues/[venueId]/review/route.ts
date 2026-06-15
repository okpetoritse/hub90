import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ venueId: string }> }
) {
  const supabase = await createClient()
  const { venueId } = await context.params;
  const { reviewerEmail, rating, reviewText } = await request.json()

  if (!reviewerEmail || !rating) {
    return NextResponse.json(
      { error: 'Missing required fields: reviewerEmail, rating' },
      { status: 400 }
    )
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'Rating must be between 1 and 5' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase
      .from('venue_reviews')
      .insert([
        {
          venue_id: venueId,
          reviewer_email: reviewerEmail,
          rating,
          review_text: reviewText,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error

    // Update venue rating
    const { data: reviews } = await supabase
      .from('venue_reviews')
      .select('rating')
      .eq('venue_id', venueId)

    const avgRating =
      reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    await supabase
      .from('viewing_centers')
      .update({
        rating: avgRating,
        total_reviews: reviews?.length || 0,
      })
      .eq('id', venueId)

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ venueId: string }> }
) {
  const supabase = await createClient()
  const { venueId } = await context.params

  try {
    const { data, error } = await supabase
      .from('venue_reviews')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}