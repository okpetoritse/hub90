-- FILE: database/migrations/002_create_voice_comments_table.sql
-- RUN SECOND IN SUPABASE SQL EDITOR

CREATE TABLE IF NOT EXISTS voice_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(100) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  voice_url TEXT NOT NULL, -- Supabase storage path
  duration_seconds NUMERIC,
  transcription TEXT, -- optional AI transcription
  file_size_kb NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INT DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE -- True if user had premium when posted
);

CREATE TABLE IF NOT EXISTS voice_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_comment_id UUID NOT NULL REFERENCES voice_comments(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voice_comment_id, user_email)
);

CREATE TABLE IF NOT EXISTS voice_comment_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_voice_id UUID NOT NULL REFERENCES voice_comments(id) ON DELETE CASCADE,
  reply_text TEXT,
  reply_voice_url TEXT, -- can reply with voice or text
  user_email VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_voice_comments_room ON voice_comments(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_comments_user ON voice_comments(user_email);
CREATE INDEX IF NOT EXISTS idx_voice_comments_created ON voice_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_likes_comment ON voice_likes(voice_comment_id);
CREATE INDEX IF NOT EXISTS idx_voice_replies_parent ON voice_comment_replies(parent_voice_id);