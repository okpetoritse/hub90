'use client'

import React from 'react'
import { Venue } from '@/app/types/venue'
import { VenueManager } from '@/app/lib/venues'
import Link from 'next/link'
import { MapPin, Users, Star, CheckCircle } from 'lucide-react'

interface VenueCardProps {
  venue: Venue
  showActions?: boolean
}

export default function VenueCard({ venue, showActions = false }: VenueCardProps) {
  const avatarUrl = VenueManager.getVenueAvatar(venue)
  const score = VenueManager.calculateVenueScore(venue)
  const badges = VenueManager.getVenueBadges(venue)

  return (
    <Link href={`/venue/${venue.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer h-full">
        {/* Cover Image */}
        <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
          {venue.cover_image_url ? (
            <img
              src={venue.cover_image_url}
              alt="cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
          )}
          {venue.is_verified && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
              <CheckCircle size={20} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Avatar & Name */}
          <div className="flex items-start gap-3 mb-3">
            <img
              src={avatarUrl}
              alt={venue.venue_name}
              className="w-12 h-12 rounded-full border-2 border-white shadow-md"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg">{venue.venue_name}</h3>
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <MapPin size={14} />
                {venue.location}
              </div>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {badges.slice(0, 2).map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                >
                  {badge.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {venue.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{venue.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3 py-3 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm font-bold">{venue.followers_count}</div>
              <div className="text-xs text-gray-600">
                <Users size={12} className="inline" /> Followers
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold flex items-center justify-center gap-1">
                <Star size={14} className="text-yellow-400" />
                {venue.rating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold">{score}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
          </div>

          {/* CTA Button */}
          {showActions && (
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">
              View Venue
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}