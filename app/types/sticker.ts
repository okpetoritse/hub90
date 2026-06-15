export interface StickerPack {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  currency: string
  image_url: string | null
  thumbnail_url: string | null
  is_active: boolean
  is_free: boolean
  created_at: string
  updated_at: string
}

export interface Sticker {
  id: string
  pack_id: string
  name: string
  emoji: string | null
  image_url: string
  animation_type: string | null
  haptic_pattern: string | null
  created_at: string
}

export interface UserStickerPack {
  id: string
  user_email: string
  pack_id: string
  purchased_at: string
  is_favorite: boolean
}