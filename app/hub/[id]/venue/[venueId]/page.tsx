'use client'

import { notFound } from 'next/navigation'

export default function VenuePage({ 
  params 
}: { 
  params: Promise<{ venueId: string }> 
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0e27] to-[#1a1a2e]">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white mb-4">
          Venue Details
        </h1>
        <p className="text-gray-400">
          Venue page coming soon...
        </p>
      </div>
    </div>
  )
}