import { create } from 'zustand'
import { Venue, VenueStats } from '@/app/types/venue'

interface VenueStore {
  // State
  venues: Venue[]
  currentVenue: Venue | null
  venueStats: VenueStats[]
  userVenues: Venue[]
  loading: boolean
  error: string | null

  // Actions
  fetchVenues: () => Promise<void>
  fetchVenueById: (venueId: string) => Promise<void>
  fetchUserVenues: (creatorEmail: string) => Promise<void>
  fetchVenueStats: (venueId: string) => Promise<void>
  createVenue: (venueData: Partial<Venue>, creatorEmail: string) => Promise<void>
  updateVenue: (venueId: string, updates: Partial<Venue>) => Promise<void>
  followVenue: (venueId: string, followerEmail: string) => Promise<void>
  unfollowVenue: (venueId: string, followerEmail: string) => Promise<void>
  setCurrentVenue: (venue: Venue | null) => void
}

export const useVenueStore = create<VenueStore>((set, get) => ({
  venues: [],
  currentVenue: null,
  venueStats: [],
  userVenues: [],
  loading: false,
  error: null,

  fetchVenues: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/venues')
      if (!response.ok) throw new Error('Failed to fetch venues')
      const data = await response.json()
      set({ venues: data })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  fetchVenueById: async (venueId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/venues/${venueId}`)
      if (!response.ok) throw new Error('Failed to fetch venue')
      const data = await response.json()
      set({ currentVenue: data })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  fetchUserVenues: async (creatorEmail: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/venues?creator=${creatorEmail}`)
      if (!response.ok) throw new Error('Failed to fetch user venues')
      const data = await response.json()
      set({ userVenues: data })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  fetchVenueStats: async (venueId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/venues/${venueId}/stats`)
      if (!response.ok) throw new Error('Failed to fetch venue stats')
      const data = await response.json()
      set({ venueStats: data })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  createVenue: async (venueData: Partial<Venue>, creatorEmail: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...venueData, creator_email: creatorEmail }),
      })
      if (!response.ok) throw new Error('Failed to create venue')
      await get().fetchUserVenues(creatorEmail)
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  updateVenue: async (venueId: string, updates: Partial<Venue>) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/venues/${venueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error('Failed to update venue')
      if (get().currentVenue?.id === venueId) {
        const updated = await response.json()
        set({ currentVenue: updated })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  followVenue: async (venueId: string, followerEmail: string) => {
    try {
      const response = await fetch(`/api/venues/${venueId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerEmail }),
      })
      if (!response.ok) throw new Error('Failed to follow venue')
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  unfollowVenue: async (venueId: string, followerEmail: string) => {
    try {
      const response = await fetch(`/api/venues/${venueId}/unfollow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerEmail }),
      })
      if (!response.ok) throw new Error('Failed to unfollow venue')
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  setCurrentVenue: (venue: Venue | null) => set({ currentVenue: venue }),
}))