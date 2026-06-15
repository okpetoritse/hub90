'use client'

import React, { useState } from 'react'
import { useVoiceRecording } from '@/app/hooks/useVoiceRecording'
import { useVoiceStore } from '@/app/store/useVoiceStore'
import { useHaptics } from '@/app/hooks/useHaptics'
import { Mic, Square, X, Send } from 'lucide-react'

interface VoiceRecorderProps {
  roomId: string
  userEmail: string
  username: string
  onRecordingComplete?: () => void
}

export default function VoiceRecorder({
  roomId,
  userEmail,
  username,
  onRecordingComplete,
}: VoiceRecorderProps) {
  const { isRecording, duration, startRecording, stopRecording, cancelRecording } =
    useVoiceRecording()
  const { uploadVoiceComment, loading } = useVoiceStore()
  const { soft, success, error: errorHaptic } = useHaptics()
  const [showRecorder, setShowRecorder] = useState(false)

  const handleStart = async () => {
    soft()
    await startRecording()
  }

  const handleStop = async () => {
    const audioBlob = await stopRecording()
    if (!audioBlob) {
      errorHaptic()
      return
    }

    try {
      success()
      await uploadVoiceComment(roomId, userEmail, username, audioBlob)
      setShowRecorder(false)
      onRecordingComplete?.()
    } catch (err) {
      errorHaptic()
      console.error('Upload failed:', err)
    }
  }

  const handleCancel = () => {
    soft()
    cancelRecording()
    setShowRecorder(false)
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!showRecorder) {
    return (
      <button
        onClick={() => {
          soft()
          setShowRecorder(true)
        }}
        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        title="Record voice message"
      >
        <Mic size={20} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="flex items-center gap-4 max-w-md mx-auto">
        {!isRecording ? (
          <>
            <button
              onClick={handleStart}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              title="Start recording"
            >
              <Mic size={24} />
            </button>
            <span className="text-gray-600">Ready to record</span>
          </>
        ) : (
          <>
            <button
              onClick={handleStop}
              disabled={loading}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
            >
              <Square size={24} />
            </button>
            <span className="text-gray-600 font-mono font-bold">{formatDuration(duration)}</span>
          </>
        )}

        <button
          onClick={handleCancel}
          disabled={loading}
          className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors disabled:opacity-50"
          title="Cancel recording"
        >
          <X size={20} />
        </button>

        {isRecording && (
          <div className="flex-1 flex items-center gap-1">
            <div className="w-1 h-6 bg-red-500 rounded animate-pulse"></div>
            <div className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-5 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
    </div>
  )
}