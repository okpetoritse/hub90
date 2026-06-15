import { create } from 'zustand'
import { Sticker, StickerPack, UserStickerPack } from '@/app/types/sticker'

interface StickerStore {
  // State
  stickerPacks: StickerPack[]
  userStickers: UserStickerPack[]
  allStickers: Sticker[]
  loading: boolean
  error: string | null

  // Actions
  fetchStickerPacks: () => Promise<void>
  fetchUserStickers: (userEmail: string) => Promise<void>
  fetchAllStickers: () => Promise<void>
  purchaseStickerPack: (userEmail: string, packId: string) => Promise<void>
  setStickerFavorite: (userEmail: string, packId: string, isFavorite: boolean) => Promise<void>
  getStickersByPack: (packId: string) => Sticker[]
}

export const useStickerStore = create<StickerStore>((set, get) => ({
  stickerPacks: [],
  userStickers: [],
  allStickers: [],
  loading: false,
  error: null,

  fetchStickerPacks: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/stickers')
      if (!response.ok) throw new Error('Failed to fetch sticker packs')
      const data = await response.json()
      set({ stickerPacks: data })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  fetchUserStickers: async (userEmail: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/stickers?userEmail=${userEmail}`)
      if (!response.ok) throw new Error('Failed to fetch user stickers')
      const data = await response.json()
      set({ userStickers: data })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  fetchAllStickers: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/stickers/all')
      if (!response.ok) throw new Error('Failed to fetch stickers')
      const data = await response.json()
      set({ allStickers: data })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  purchaseStickerPack: async (userEmail: string, packId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/stickers/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, packId }),
      })
      if (!response.ok) throw new Error('Failed to purchase sticker pack')
      await get().fetchUserStickers(userEmail)
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  setStickerFavorite: async (userEmail: string, packId: string, isFavorite: boolean) => {
    try {
      const response = await fetch('/api/stickers/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, packId, isFavorite }),
      })
      if (!response.ok) throw new Error('Failed to update favorite')
      await get().fetchUserStickers(userEmail)
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  getStickersByPack: (packId: string) => {
    return get().allStickers.filter((s) => s.pack_id === packId)
  },
}))