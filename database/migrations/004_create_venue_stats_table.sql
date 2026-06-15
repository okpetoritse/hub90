-- FILE: database/migrations/004_create_creator_profiles.sql
-- RUN FOURTH IN SUPABASE SQL EDITOR

CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  follower_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  content_count INT DEFAULT 0,
  earnings_total NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_badge VARCHAR(50), -- 'silver', 'gold', 'platinum'
  links TEXT[], -- social media links
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_email VARCHAR(255) NOT NULL REFERENCES creator_profiles(user_email) ON DELETE CASCADE,
  follower_email VARCHAR(255) NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(creator_email, follower_email)
);

CREATE TABLE IF NOT EXISTS creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_email VARCHAR(255) NOT NULL REFERENCES creator_profiles(user_email) ON DELETE CASCADE,
  source VARCHAR(50), -- 'tips', 'sponsorship', 'content_share'
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_email VARCHAR(255) NOT NULL,
  voice_comment_id UUID NOT NULL REFERENCES voice_comments(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  tips_received NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipper_email VARCHAR(255) NOT NULL,
  receiver_email VARCHAR(255) NOT NULL,
  content_id UUID, -- can be voice_content_id or creator_id
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  message TEXT,
  payment_ref VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_creator_profiles_username ON creator_profiles(username);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_email ON creator_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_creator_followers_creator ON creator_followers(creator_email);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator ON creator_earnings(creator_email);
CREATE INDEX IF NOT EXISTS idx_voice_content_creator ON voice_content(creator_email);
CREATE INDEX IF NOT EXISTS idx_voice_content_published ON voice_content(is_published);
CREATE INDEX IF NOT EXISTS idx_tips_receiver ON tips(receiver_email);
CREATE INDEX IF NOT EXISTS idx_tips_tipper ON tips(tipper_email);