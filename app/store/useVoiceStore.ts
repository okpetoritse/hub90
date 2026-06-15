import { create } from 'zustand'
import { VoiceComment } from '@/app/types/voice'

interface VoiceStore {
  // State
  voiceComments: VoiceComment[]
  isRecording: boolean
  recordingDuration: number
  loading: boolean
  error: string | null
  selectedComment: VoiceComment | null

  // Actions
  fetchVoiceComments: (roomId: string) => Promise<void>
  uploadVoiceComment: (
    roomId: string,
    userEmail: string,
    username: string,
    audioBlob: Blob
  ) => Promise<void>
  setIsRecording: (recording: boolean) => void
  setRecordingDuration: (duration: number) => void
  likeVoiceComment: (commentId: string, userEmail: string) => Promise<void>
  deleteVoiceComment: (commentId: string) => Promise<void>
  setSelectedComment: (comment: VoiceComment | null) => void
}

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  voiceComments: [],
  isRecording: false,
  recordingDuration: 0,
  loading: false,
  error: null,
  selectedComment: null,

  fetchVoiceComments: async (roomId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/voice?roomId=${roomId}`)
      if (!response.ok) throw new Error('Failed to fetch voice comments')
      const data = await response.json()
      set({ voiceComments: data })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  uploadVoiceComment: async (
    roomId: string,
    userEmail: string,
    username: string,
    audioBlob: Blob
  ) => {
    set({ loading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('roomId', roomId)
      formData.append('userEmail', userEmail)
      formData.append('username', username)
      formData.append('audio', audioBlob)

      const response = await fetch('/api/voice/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('Failed to upload voice comment')
      await get().fetchVoiceComments(roomId)
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  setIsRecording: (recording: boolean) => set({ isRecording: recording }),
  setRecordingDuration: (duration: number) => set({ recordingDuration: duration }),

  likeVoiceComment: async (commentId: string, userEmail: string) => {
    try {
      const response = await fetch('/api/voice/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userEmail }),
      })
      if (!response.ok) throw new Error('Failed to like comment')
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  deleteVoiceComment: async (commentId: string) => {
    try {
      const response = await fetch(`/api/voice/delete/${commentId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete comment')
      set((state) => ({
        voiceComments: state.voiceComments.filter((v) => v.id !== commentId),
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  setSelectedComment: (comment: VoiceComment | null) => set({ selectedComment: comment }),
}))