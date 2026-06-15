export interface Venue {
  id: string
  venue_name: string
  location: string
  venue_type: 'physical' | 'virtual'
  creator_email: string | null
  is_verified: boolean
  verification_status: string
  commission_percentage: number
  bank_account: string | null
  admin_email: string | null
  phone_number: string | null
  logo_url: string | null
  cover_image_url: string | null
  description: string | null
  capacity: number | null
  operating_hours: string | null
  tags: string[] | null
  status: 'active' | 'inactive' | 'pending'
  revenue_total: number
  followers_count: number
  rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface VenueStats {
  id: string
  venue_id: string
  match_date: string
  match_name: string | null
  viewers_count: number
  peak_viewers: number
  revenue_generated: number
  stickers_sold: number
  voice_comments_count: number
  chaos_actions_count: number
  created_at: string
}

export interface VenueFollower {
  id: string
  venue_id: string
  follower_email: string
  followed_at: string
}