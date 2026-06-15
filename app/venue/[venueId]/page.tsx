'use client'

import React, { useEffect, useState } from 'react'
import { useVenueStore } from '@/app/store/useVenueStore'
import { VenueManager } from '@/app/lib/venues'
import { useHaptics } from '@/app/hooks/useHaptics'
import { createClient } from '@/utils/supabase/client'
import { Heart, MapPin, Users, Star, Share2 } from 'lucide-react'

interface VenuePageProps {
  params: { venueId: string }
}

export default function VenuePublicPage({ params }: VenuePageProps) {
  const { venueId } = params
  const { currentVenue, fetchVenueById } = useVenueStore()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { soft, success } = useHaptics()

  useEffect(() => {
    fetchVenueById(venueId)
    const getUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setUserEmail(data.user?.email || null)
      setLoading(false)
    }
    getUser()
  }, [venueId, fetchVenueById])

  if (loading || !currentVenue) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const handleFollow = async () => {
    soft()
    if (!userEmail) return
    
    try {
      if (isFollowing) {
        // Unfollow
        const response = await fetch(`/api/venues/${venueId}/unfollow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followerEmail: userEmail }),
        })
        if (response.ok) {
          setIsFollowing(false)
          success()
        }
      } else {
        // Follow
        const response = await fetch(`/api/venues/${venueId}/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followerEmail: userEmail }),
        })
        if (response.ok) {
          setIsFollowing(true)
          success()
        }
      }
    } catch (err) {
      console.error('Follow action failed:', err)
    }
  }

  const avatarUrl = VenueManager.getVenueAvatar(currentVenue)
  const badges = VenueManager.getVenueBadges(currentVenue)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      {currentVenue.cover_image_url ? (
        <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 relative">
          <img
            src={currentVenue.cover_image_url}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500" />
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg -mt-32 relative z-10 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div>
              <img
                src={avatarUrl}
                alt={currentVenue.venue_name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{currentVenue.venue_name}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin size={18} />
                      {currentVenue.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={18} className="text-yellow-400" />
                      {currentVenue.rating.toFixed(1)} ({currentVenue.total_reviews} reviews)
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-col gap-2">
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs font-semibold rounded-full text-center"
                    >
                      {badge.replace('-', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {currentVenue.description && (
                <p className="text-gray-700 mb-6">{currentVenue.description}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {currentVenue.followers_count}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    ₦{(currentVenue.revenue_total / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    {currentVenue.capacity || '-'}
                  </div>
                  <div className="text-sm text-gray-600">Capacity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {userEmail && (
            <div className="flex gap-4 mt-8 pt-8 border-t">
              <button
                onClick={handleFollow}
                className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                  isFollowing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Heart size={20} fill={isFollowing ? 'currentColor' : 'none'} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                <Share2 size={20} />
                Share
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Matches Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Upcoming Matches</h2>
          <div className="text-center text-gray-500 py-8">
            No upcoming matches scheduled yet
          </div>
        </div>
      </div>
    </div>
  )
}