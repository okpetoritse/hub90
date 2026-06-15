import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { commentId, userEmail } = await request.json()

  if (!commentId || !userEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Check if already liked
    const { data: existing } = await supabase
      .from('voice_likes')
      .select('id')
      .eq('voice_comment_id', commentId)
      .eq('user_email', userEmail)
      .single()

    if (existing) {
      // Unlike
      const { error } = await supabase
        .from('voice_likes')
        .delete()
        .eq('voice_comment_id', commentId)
        .eq('user_email', userEmail)

      if (error) throw error
    } else {
      // Like
      const { error } = await supabase.from('voice_likes').insert([
        {
          voice_comment_id: commentId,
          user_email: userEmail,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error
    }

    // Update likes count
    const { data: likeCount } = await supabase
      .from('voice_likes')
      .select('id', { count: 'exact' })
      .eq('voice_comment_id', commentId)

    await supabase
      .from('voice_comments')
      .update({ likes_count: likeCount?.length || 0 })
      .eq('id', commentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}