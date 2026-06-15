import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const formData = await request.formData()

  const roomId = formData.get('roomId') as string
  const userEmail = formData.get('userEmail') as string
  const username = formData.get('username') as string
  const audioFile = formData.get('audio') as File

  if (!roomId || !userEmail || !audioFile) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Upload to Supabase Storage
    const fileName = `${roomId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webm`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-comments')
      .upload(fileName, audioFile)

    if (uploadError) throw uploadError

    // Get duration (you may need to calculate this from the audio file)
    const fileSizeKb = audioFile.size / 1024

    // Save voice comment record
    const { data, error } = await supabase
      .from('voice_comments')
      .insert([
        {
          room_id: roomId,
          user_email: userEmail,
          username: username,
          voice_url: uploadData.path,
          file_size_kb: fileSizeKb,
          created_at: new Date().toISOString(),
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