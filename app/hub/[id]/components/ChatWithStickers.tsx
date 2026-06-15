'use client'

import React, { useState, useEffect } from 'react'
import { useVoiceStore } from '@/app/store/useVoiceStore'
import VoiceMessage from './VoiceMessage'
import VoiceRecorder from './VoiceRecorder'
import StickerPicker from './StickerPicker'
import { Sticker } from '@/app/types/sticker'
import { Smile } from 'lucide-react'
import { useHaptics } from '@/app/hooks/useHaptics'

interface ChatWithStickersProps {
  roomId: string
  userEmail: string
  username: string
}

export default function ChatWithStickers({
  roomId,
  userEmail,
  username,
}: ChatWithStickersProps) {
  const { voiceComments, fetchVoiceComments } = useVoiceStore()
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [sentStickers, setSentStickers] = useState<Array<{ sticker: Sticker; timestamp: number }>>([])
  const { success } = useHaptics()

  useEffect(() => {
    fetchVoiceComments(roomId)
    const interval = setInterval(() => fetchVoiceComments(roomId), 3000) // Poll every 3s
    return () => clearInterval(interval)
  }, [roomId, fetchVoiceComments])

  const handleStickerSelected = (sticker: Sticker) => {
    success()
    setSentStickers((prev) => [...prev, { sticker, timestamp: Date.now() }])
    setShowStickerPicker(false)

    // Remove sticker after 5 seconds
    setTimeout(() => {
      setSentStickers((prev) => prev.filter((s) => s.timestamp !== Date.now()))
    }, 5000)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Voice Comments */}
        {voiceComments.map((comment) => (
          <VoiceMessage
            key={comment.id}
            comment={comment}
            userEmail={userEmail}
            voiceUrl={comment.voice_url}
          />
        ))}

        {voiceComments.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No voice messages yet. Be the first to speak!
          </div>
        )}
      </div>

      {/* Floating Stickers */}
      <div className="absolute inset-0 pointer-events-none">
        {sentStickers.map((item) => (
          <div
            key={item.timestamp}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 60}%`,
              animation: `float 2s ease-out forwards`,
            }}
          >
            <img
              src={item.sticker.image_url}
              alt="sticker"
              className="w-16 h-16 drop-shadow-lg"
            />
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 flex gap-2 items-center">
        <button
          onClick={() => setShowStickerPicker(true)}
          className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white transition-colors"
          title="Send sticker"
        >
          <Smile size={24} />
        </button>

        <VoiceRecorder
          roomId={roomId}
          userEmail={userEmail}
          username={username}
          onRecordingComplete={() => fetchVoiceComments(roomId)}
        />
      </div>

      {/* Sticker Picker Modal */}
      {showStickerPicker && (
        <StickerPicker
          onStickerSelected={handleStickerSelected}
          userEmail={userEmail}
          onClose={() => setShowStickerPicker(false)}
        />
      )}

      <style jsx>{`
        @keyframes float {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(0.5);
          }
        }
      `}</style>
    </div>
  )
}