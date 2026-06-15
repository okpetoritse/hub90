-- FILE: database/migrations/003_create_venues_complete.sql
-- RUN THIRD IN SUPABASE SQL EDITOR

-- Modify existing viewing_centers table to support user-created venues
ALTER TABLE IF EXISTS viewing_centers ADD COLUMN IF NOT EXISTS (
  venue_type VARCHAR(50) DEFAULT 'physical', -- 'physical' or 'virtual'
  creator_email VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(50) DEFAULT 'pending',
  commission_percentage NUMERIC DEFAULT 15,
  bank_account VARCHAR(100),
  admin_email VARCHAR(100),
  phone_number VARCHAR(20),
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  capacity INT,
  operating_hours VARCHAR(100), -- e.g., "10:00-23:00"
  tags TEXT[], -- array of tags
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'pending'
  revenue_total NUMERIC DEFAULT 0,
  followers_count INT DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES viewing_centers(id) ON DELETE CASCADE,
  staff_email VARCHAR(255) NOT NULL,
  staff_name VARCHAR(100),
  role VARCHAR(50), -- 'manager', 'moderator', 'streamer'
  permissions TEXT[], -- array of permissions
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES viewing_centers(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  match_name VARCHAR(255),
  viewers_count INT DEFAULT 0,
  peak_viewers INT DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  stickers_sold INT DEFAULT 0,
  voice_comments_count INT DEFAULT 0,
  chaos_actions_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES viewing_centers(id) ON DELETE CASCADE,
  follower_email VARCHAR(255) NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, follower_email)
);

CREATE TABLE IF NOT EXISTS venue_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES viewing_centers(id) ON DELETE CASCADE,
  reviewer_email VARCHAR(255) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_match_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES viewing_centers(id) ON DELETE CASCADE,
  match_name VARCHAR(255) NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  league VARCHAR(100), -- 'Premier League', 'La Liga', etc
  team1 VARCHAR(100),
  team2 VARCHAR(100),
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'live', 'finished'
  expected_viewers INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_viewing_centers_creator ON viewing_centers(creator_email);
CREATE INDEX IF NOT EXISTS idx_viewing_centers_verified ON viewing_centers(is_verified);
CREATE INDEX IF NOT EXISTS idx_viewing_centers_type ON viewing_centers(venue_type);
CREATE INDEX IF NOT EXISTS idx_venue_staff_venue ON venue_staff(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_stats_venue ON venue_stats(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_stats_date ON venue_stats(match_date);
CREATE INDEX IF NOT EXISTS idx_venue_followers_venue ON venue_followers(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_followers_follower ON venue_followers(follower_email);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue ON venue_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_schedules_venue ON venue_match_schedules(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_schedules_date ON venue_match_schedules(scheduled_date);