'use client'

import React, { useEffect, useState } from 'react'
import { useStickerStore } from '@/app/store/useStickerStore'
import { Sticker, StickerPack } from '@/app/types/sticker'
import { useHaptics } from '@/app/hooks/useHaptics'
import { StickerManager } from '@/app/lib/stickers'
import { X } from 'lucide-react'

interface StickerPickerProps {
  onStickerSelected: (sticker: Sticker) => void
  userEmail: string
  onClose: () => void
}

export default function StickerPicker({
  onStickerSelected,
  userEmail,
  onClose,
}: StickerPickerProps) {
  const { stickerPacks, allStickers, fetchStickerPacks, fetchAllStickers, loading } =
    useStickerStore()
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const { soft, success } = useHaptics()

  useEffect(() => {
    fetchStickerPacks()
    fetchAllStickers()
  }, [fetchStickerPacks, fetchAllStickers])

  const packStickers = selectedPack
    ? allStickers.filter((s) => s.pack_id === selectedPack)
    : allStickers.slice(0, 6) // Show first 6

  const handleStickerClick = (sticker: Sticker) => {
    soft()
    onStickerSelected(sticker)
    success()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-lg shadow-2xl max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Stickers</h3>
          <button
            onClick={() => {
              soft()
              onClose()
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pack Selection */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => {
              soft()
              setSelectedPack(null)
            }}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              !selectedPack
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {stickerPacks.map((pack) => (
            <button
              key={pack.id}
              onClick={() => {
                soft()
                setSelectedPack(pack.id)
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedPack === pack.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {pack.name}
            </button>
          ))}
        </div>

        {/* Stickers Grid */}
        {loading ? (
          <div className="text-center py-8">Loading stickers...</div>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {packStickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleStickerClick(sticker)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={sticker.name}
              >
                <img
                  src={StickerManager.getStickerImageUrl(sticker.image_url)}
                  alt={sticker.name}
                  className="w-12 h-12"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = '/stickers/default.png'
                  }}
                />
                <div className="text-xs mt-1 text-center">{sticker.emoji || '🎉'}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}