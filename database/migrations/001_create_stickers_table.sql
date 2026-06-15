-- FILE: database/migrations/001_create_stickers_table.sql
-- RUN THIS FIRST IN SUPABASE SQL EDITOR

CREATE TABLE IF NOT EXISTS sticker_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'celebration', 'reaction', 'team', 'player'
  price NUMERIC DEFAULT 0, -- 0 for free
  currency VARCHAR(3) DEFAULT 'NGN',
  image_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_free BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES sticker_packs(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  image_url TEXT NOT NULL,
  animation_type VARCHAR(50), -- 'bounce', 'spin', 'fade', 'pop'
  haptic_pattern VARCHAR(100), -- vibration pattern name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sticker_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  pack_id UUID NOT NULL REFERENCES sticker_packs(id),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  UNIQUE(user_email, pack_id)
);

CREATE TABLE IF NOT EXISTS sticker_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  sticker_id UUID NOT NULL REFERENCES stickers(id),
  room_id VARCHAR(100),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stickers_pack_id ON stickers(pack_id);
CREATE INDEX IF NOT EXISTS idx_user_sticker_packs_email ON user_sticker_packs(user_email);
CREATE INDEX IF NOT EXISTS idx_sticker_usage_logs_email ON sticker_usage_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_sticker_usage_logs_room ON sticker_usage_logs(room_id);