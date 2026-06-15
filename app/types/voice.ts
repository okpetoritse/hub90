export interface VoiceComment {
  id: string
  room_id: string
  user_email: string
  username: string | null
  voice_url: string
  duration_seconds: number | null
  transcription: string | null
  file_size_kb: number | null
  created_at: string
  likes_count: number
  is_premium: boolean
}

export interface VoiceCommentReply {
  id: string
  parent_voice_id: string
  reply_text: string | null
  reply_voice_url: string | null
  user_email: string
  username: string | null
  created_at: string
}

export interface VoiceLike {
  id: string
  voice_comment_id: string
  user_email: string
  created_at: string
}