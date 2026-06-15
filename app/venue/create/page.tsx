'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useVenueManager } from '@/app/hooks/useVenueManager'
import { createClient } from '@/utils/supabase/client'
import { MapPin, Users, Phone, Mail } from 'lucide-react'

export default function CreateVenuePage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createNewVenue } = useVenueManager(userEmail)

  const [formData, setFormData] = useState({
    venue_name: '',
    location: '',
    venue_type: 'virtual' as 'physical' | 'virtual',
    description: '',
    capacity: '',
    phone_number: '',
  })

  // Get user email on mount
  React.useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user?.email) {
        setUserEmail(data.user.email)
      } else {
        setError('Please log in first')
        router.push('/')
      }
    }
    getUser()
  }, [router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || '' : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.venue_name.trim()) {
      setError('Venue name is required')
      setLoading(false)
      return
    }

    try {
      const success = await createNewVenue(formData)
      if (success) {
        router.push('/venue/dashboard')
      } else {
        setError('Failed to create venue')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Create Your Venue</h1>
        <p className="text-gray-600 mb-8">
          Start your own Hub90 community and begin earning today
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Venue Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Name *
            </label>
            <input
              type="text"
              name="venue_name"
              value={formData.venue_name}
              onChange={handleChange}
              placeholder="e.g., Lagos Sports Hub"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Venue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Type
            </label>
            <select
              name="venue_type"
              value={formData.venue_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="virtual">Virtual (Online Community)</option>
              <option value="physical">Physical Location</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Virtual venues are online communities. Physical venues are actual locations.
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline mr-2" size={18} />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Victoria Island, Lagos"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell fans about your venue..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline mr-2" size={18} />
              Seating Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g., 50"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline mr-2" size={18} />
              Contact Phone
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="e.g., +234 8012345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Creating Venue...' : 'Create Venue'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have a venue?{' '}
          <a href="/venue/dashboard" className="text-blue-500 hover:underline">
            Go to Dashboard
          </a>
        </p>
      </div>
    </div>
  )
}