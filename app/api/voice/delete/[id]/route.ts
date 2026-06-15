import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // 1. Updated type definition to Promise
) {
  const supabase = await createClient()
  const { id } = await context.params // 2. Await the promise to get the id
  const commentId = id

  if (!commentId) {
    return NextResponse.json({ error: 'Missing comment ID' }, { status: 400 })
  }

  try {
    // Get the voice comment to get file path
    const { data: comment, error: fetchError } = await supabase
      .from('voice_comments')
      .select('voice_url')
      .eq('id', commentId)
      .single()

    if (fetchError) throw fetchError

    // Delete file from storage
    if (comment.voice_url) {
      await supabase.storage.from('voice-comments').remove([comment.voice_url])
    }

    // Delete record
    const { error } = await supabase
      .from('voice_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}