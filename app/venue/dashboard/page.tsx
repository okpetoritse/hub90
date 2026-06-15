'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useVenueManager } from '@/app/hooks/useVenueManager'
import { useVenueStore } from '@/app/store/useVenueStore'
import { BarChart3, Users, TrendingUp, DollarSign, Settings, Plus } from 'lucide-react'
import Link from 'next/link'

export default function VenueDashboardPage() {
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const { userVenues, fetchUserVenues } = useVenueStore()
  const { createNewVenue } = useVenueManager(userEmail)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user?.email) {
        setUserEmail(data.user.email)
        await fetchUserVenues(data.user.email)
      }
      setLoading(false)
    }
    getUser()
  }, [fetchUserVenues])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!userEmail) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to access your dashboard</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Venue Dashboard</h1>
            <p className="text-gray-600">Manage and grow your venues</p>
          </div>
          <Link
            href="/venue/create"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            New Venue
          </Link>
        </div>

        {userVenues.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Venues Yet</h2>
            <p className="text-gray-600 mb-6">Create your first venue to start earning</p>
            <Link
              href="/venue/create"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Create Your First Venue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userVenues.map((venue) => (
              <div key={venue.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{venue.venue_name}</h3>
                    <p className="text-gray-600 text-sm">{venue.location}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      venue.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {venue.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b">
                  <div className="text-center">
                    <Users size={20} className="mx-auto text-blue-500 mb-2" />
                    <div className="text-lg font-bold">{venue.followers_count}</div>
                    <div className="text-xs text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <DollarSign size={20} className="mx-auto text-green-500 mb-2" />
                    <div className="text-lg font-bold">₦{venue.revenue_total.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Revenue</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp size={20} className="mx-auto text-purple-500 mb-2" />
                    <div className="text-lg font-bold">{venue.rating.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>

                {venue.description && (
                  <p className="text-sm text-gray-600 mb-4">{venue.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/venue/${venue.id}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-center text-sm"
                  >
                    View Public Page
                  </Link>
                  <Link
                    href={`/venue/dashboard/${venue.id}`}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded text-center text-sm flex items-center justify-center gap-2"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}