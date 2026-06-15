import { useState, useRef, useCallback } from 'react'
import { VoiceRecorder } from '@/app/lib/voice'
import { HapticManager } from '@/app/lib/haptics'

export const useVoiceRecording = () => {
  const recorderRef = useRef<VoiceRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      if (!recorderRef.current) {
        recorderRef.current = new VoiceRecorder()
      }
      await recorderRef.current.startRecording()
      setIsRecording(true)
      setDuration(0)
      HapticManager.soft()

      // Timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      HapticManager.error()
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    try {
      if (!recorderRef.current) return null

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      const audioBlob = await recorderRef.current.stopRecording()
      setIsRecording(false)
      HapticManager.success()
      return audioBlob
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording')
      HapticManager.error()
      return null
    }
  }, [])

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRecording(false)
    setDuration(0)
    HapticManager.soft()
  }, [])

  return {
    isRecording,
    duration,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}