'use client'

import React, { useState } from 'react'
import { VoiceComment } from '@/app/types/voice'
import { Play, Pause, Heart } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useHaptics } from '@/app/hooks/useHaptics'
import { DESIGN_SYSTEM } from '@/app/styles/design-system'

interface VoiceMessageProps {
  comment: VoiceComment
  userEmail: string
  voiceUrl: string
}

export default function VoiceMessage({ comment, userEmail, voiceUrl }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(comment.likes_count || 0)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const supabase = createClient()
  const { soft, success } = useHaptics()

  const handlePlayPause = async () => {
    soft()
    
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error('Failed to play audio:', error)
      }
    }
  }

  const handleLike = async () => {
    soft()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (isLiked) {
        // Unlike
        await supabase
          .from('voice_likes')
          .delete()
          .eq('voice_id', comment.id)
          .eq('user_id', user.id)
        
        setIsLiked(false)
        setLikes(likes - 1)
      } else {
        // Like
        await supabase
          .from('voice_likes')
          .insert({
            voice_id: comment.id,
            user_id: user.id
          })
        
        setIsLiked(true)
        setLikes(likes + 1)
        success()
      }
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            color: DESIGN_SYSTEM.colors.secondary,
            fontWeight: 'bold',
            fontSize: 'clamp(11px, 2.5vw, 12px)',
          }}>
            🎤 {comment.user_email?.split('@')[0] || 'Anonymous'}
          </div>
          <div style={{
            color: DESIGN_SYSTEM.colors.textSecondary,
            fontSize: 'clamp(10px, 2.5vw, 11px)',
            marginTop: '2px',
          }}>
            {new Date(comment.created_at).toLocaleTimeString()}
          </div>
        </div>
        <button
          onClick={handleLike}
          style={{
            background: isLiked ? DESIGN_SYSTEM.colors.accent : 'transparent',
            border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
            color: isLiked ? DESIGN_SYSTEM.colors.text : DESIGN_SYSTEM.colors.textSecondary,
            borderRadius: DESIGN_SYSTEM.radius.md,
            padding: '4px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: 'clamp(10px, 2.5vw, 11px)',
            fontWeight: 'bold',
            transition: 'all 150ms ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          {likes}
        </button>
      </div>

      {/* Audio Player */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(8px, 2vw, 12px)',
      }}>
        <button
          onClick={handlePlayPause}
          style={{
            background: DESIGN_SYSTEM.colors.secondary,
            color: DESIGN_SYSTEM.colors.dark,
            border: 'none',
            borderRadius: DESIGN_SYSTEM.radius.md,
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 'clamp(11px, 2.5vw, 12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            minHeight: '44px',
            minWidth: '44px',
            justifyContent: 'center',
            transition: 'all 150ms ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <audio
          ref={audioRef}
          src={voiceUrl}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />

        <div style={{
          flex: 1,
          background: DESIGN_SYSTEM.colors.surfaceLight,
          borderRadius: DESIGN_SYSTEM.radius.md,
          padding: '8px 12px',
          fontSize: 'clamp(11px, 2.5vw, 12px)',
          color: DESIGN_SYSTEM.colors.textSecondary,
        }}>
          {isPlaying ? '🔊 Playing...' : '🔇 Voice message'}
        </div>
      </div>

      {/* Transcription if available */}
      {comment.transcription && (
        <div style={{
          fontSize: 'clamp(11px, 2.5vw, 12px)',
          color: DESIGN_SYSTEM.colors.textSecondary,
          fontStyle: 'italic',
          padding: '8px 12px',
          background: DESIGN_SYSTEM.colors.surfaceLight,
          borderRadius: DESIGN_SYSTEM.radius.md,
        }}>
          📝 "{comment.transcription}"
        </div>
      )}
    </div>
  )
}