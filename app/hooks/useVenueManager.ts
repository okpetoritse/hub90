import { useCallback, useState } from 'react'
import { useVenueStore } from '@/app/store/useVenueStore'
import { Venue } from '@/app/types/venue'

export const useVenueManager = (creatorEmail: string) => {
  const {
    createVenue,
    updateVenue,
    fetchUserVenues,
    followVenue,
    unfollowVenue,
    userVenues,
  } = useVenueStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createNewVenue = useCallback(
    async (venueData: Partial<Venue>) => {
      setLoading(true)
      setError(null)
      try {
        await createVenue(venueData, creatorEmail)
        await fetchUserVenues(creatorEmail)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create venue')
        return false
      } finally {
        setLoading(false)
      }
    },
    [creatorEmail, createVenue, fetchUserVenues]
  )

  const updateVenueInfo = useCallback(
    async (venueId: string, updates: Partial<Venue>) => {
      setLoading(true)
      setError(null)
      try {
        await updateVenue(venueId, updates)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update venue')
        return false
      } finally {
        setLoading(false)
      }
    },
    [updateVenue]
  )

  const follow = useCallback(
    async (venueId: string, followerEmail: string) => {
      try {
        await followVenue(venueId, followerEmail)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to follow')
        return false
      }
    },
    [followVenue]
  )

  const unfollow = useCallback(
    async (venueId: string, followerEmail: string) => {
      try {
        await unfollowVenue(venueId, followerEmail)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to unfollow')
        return false
      }
    },
    [unfollowVenue]
  )

  return {
    loading,
    error,
    userVenues,
    createNewVenue,
    updateVenueInfo,
    follow,
    unfollow,
  }
}