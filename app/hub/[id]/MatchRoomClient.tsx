'use client'

import { useEffect, useState, useRef } from 'react'
import '@livekit/components-styles'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant, useTracks, useTrackVolume } from '@livekit/components-react'
import { Track } from 'livekit-client'
import { useAudioStore } from '../../store/useAudioStore'
import HapticVisualizer from '../../components/HapticVisualizer'
import VoiceRecorder from './components/VoiceRecorder'
import VoiceMessage from './components/VoiceMessage'
import ChatInput from './components/ChatInput'
import { useHaptics } from '@/app/hooks/useHaptics'
import { useVenueStore } from '@/app/store/useVenueStore'
import { useVoiceStore } from '@/app/store/useVoiceStore'
import { createClient } from '@/utils/supabase/client'
import { DESIGN_SYSTEM } from '@/app/styles/design-system'
import { HapticManager } from '@/app/lib/haptics'
import PartyEffect from '@/app/components/PartyEffect'
import JustificationModal from '@/app/components/JustificationModal'
import { useWalletBalance } from '@/app/hooks/useWalletBalance'

const DigitalChaosPanel = dynamic(() => import('../../components/DigitalChaosPanel'), { ssr: false })

interface MatchRoomClientProps {
  roomId: string
  venueName: string
  userEmail: string
}

// ============================================
// CHILD COMPONENT - Inside LiveKitRoom
// ============================================
function MatchRoomContent({ roomId, venueName, userEmail }: MatchRoomClientProps) {
  const router = useRouter()
  const [chat, setChat] = useState<any[]>([])
  const [viewersCount, setViewersCount] = useState(0)
  const supabase = createClient()
  const { soft } = useHaptics()
  const { currentVenue, fetchVenueById } = useVenueStore()
  const { voiceComments, fetchVoiceComments } = useVoiceStore()
  const [username, setUsername] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ✅ THESE HOOKS ARE NOW INSIDE LiveKitRoom
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant()
  const tracks = useTracks([Track.Source.Microphone])
  const volume = useTrackVolume(tracks.length > 0 ? tracks[0] : undefined)
  const setVolume = useAudioStore((state) => state.setVolume)

  // Party Effect State
  const [partyTrigger, setPartyTrigger] = useState(false)
  const [partyType, setPartyType] = useState<'megaphone' | 'flare'>('megaphone')

  // ✅ USE REAL-TIME WALLET HOOK
  const { balance: walletBalance, user, updateBalanceOptimistic } = useWalletBalance()

  // ✅ JUSTIFICATION MODAL STATE
  const [showJustificationModal, setShowJustificationModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: string; cost: number } | null>(null)
  const [justificationLoading, setJustificationLoading] = useState(false)

  // Update audio volume
  useEffect(() => {
    if (isMicrophoneEnabled && volume !== undefined) setVolume(volume)
    else setVolume(0)
  }, [volume, isMicrophoneEnabled, setVolume])

  // Initialize
  useEffect(() => {
    const testUsername = `Fan_${Math.floor(Math.random() * 1000)}`
    setUsername(testUsername)
    localStorage.setItem('hub90_username', testUsername)

    fetchVenueById(roomId)
    fetchVoiceComments(roomId)
    const voiceInterval = setInterval(() => fetchVoiceComments(roomId), 3000)

    // Subscribe to chat
    const channel = supabase
      .channel('live-stadium')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fan_reactions' },
        (payload) => {
          const newReaction = payload.new
          setChat((prev) => [...prev, {
            id: newReaction.id,
            user: newReaction.user_id ? 'Fan' : 'Anonymous',
            text: newReaction.message,
            type: newReaction.reaction_type
          }])
        }
      )
      .subscribe()

    // Simulate viewers
    const viewerInterval = setInterval(() => {
      setViewersCount((prev) => Math.max(1, prev + Math.random() * 5 - 2))
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(voiceInterval)
      clearInterval(viewerInterval)
    }
  }, [roomId, supabase, fetchVenueById, fetchVoiceComments])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, voiceComments])

  // ✅ OPEN JUSTIFICATION MODAL WHEN USER CLICKS MEGAPHONE/FLARE
  const handlePremiumActionClick = (itemType: string, cost: number) => {
    setPendingAction({ type: itemType, cost })
    setShowJustificationModal(true)
  }

  // ✅ EXECUTE PAYMENT AFTER JUSTIFICATION SELECTED - WITH INSTANT FEEDBACK
  const handleJustificationConfirm = async (justification: string) => {
    if (!pendingAction || !user) {
      toast.error('Error: Missing payment details')
      return
    }

    setJustificationLoading(true)
    const cost = pendingAction.cost
    const toastId = toast.loading(`Processing ${pendingAction.type}...`)

    try {
      console.log('💳 Processing:', pendingAction.type)
      console.log('💰 Cost: ₦' + cost)
      console.log('👤 User:', user.id)

      // ⚡ INSTANT OPTIMISTIC UPDATE - Show balance change immediately
      const expectedNewBalance = walletBalance - cost
      updateBalanceOptimistic(expectedNewBalance)
      console.log('⚡ Optimistic update:', expectedNewBalance)

      // Step 1: Deduct from wallet via API
      const deductRes = await fetch('/api/wallet/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          itemType: pendingAction.type,
          cost: cost
        })
      })

      const deductData = await deductRes.json()
      console.log('💰 Deduct response:', deductData)

      if (!deductRes.ok) {
        toast.error(deductData.error || 'Payment failed', { id: toastId })
        setJustificationLoading(false)
        return
      }

      console.log('✅ Wallet deducted successfully')

      // Step 2: Record reaction with justification
      const reactionType = pendingAction.type === 'Global Flare' ? 'FLARE' : 'MEGAPHONE'
      
      console.log('📝 Recording reaction:', { reactionType, justification, cost })

      const { error: insertError } = await supabase
        .from('fan_reactions')
        .insert({
          match_id: parseInt(roomId) || 0,
          reaction_type: reactionType,
          message: justification,
          amount_paid_ngn: cost,
          user_id: user.id,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        toast.error('Failed to record reaction', { id: toastId })
        console.error('Insert error:', insertError)
        setJustificationLoading(false)
        return
      }

      console.log('✅ Reaction recorded')

      // Step 3: Success - show party effect
      toast.success(`${pendingAction.type} activated! 🎉`, { id: toastId })

      if (pendingAction.type === 'Global Flare') {
        setPartyType('flare')
        setPartyTrigger(true)
        HapticManager.flare()
        setTimeout(() => setPartyTrigger(false), 3000)
      } else if (pendingAction.type === 'Megaphone') {
        setPartyType('megaphone')
        setPartyTrigger(true)
        HapticManager.megaphone()
        setTimeout(() => setPartyTrigger(false), 2000)
      }

      // Step 4: Close modal & clean up
      setShowJustificationModal(false)
      setPendingAction(null)
      setJustificationLoading(false)

      console.log('✅ Payment complete!')

    } catch (err) {
      console.error('❌ Error:', err)
      toast.error('Network error: ' + (err instanceof Error ? err.message : 'Unknown'), { id: toastId })
      setJustificationLoading(false)
    }
  }

  return (
    <>
      {/* ✅ JUSTIFICATION MODAL */}
      <JustificationModal
        isOpen={showJustificationModal}
        type={(pendingAction?.type === 'Global Flare' ? 'flare' : 'megaphone') as 'megaphone' | 'flare'}
        amount={pendingAction?.cost || 0}
        onClose={() => {
          setShowJustificationModal(false)
          setPendingAction(null)
        }}
        onConfirm={handleJustificationConfirm}
        loading={justificationLoading}
      />

      <PartyEffect 
        trigger={partyTrigger} 
        type={partyType}
        onComplete={() => setPartyTrigger(false)}
      />
      <RoomAudioRenderer />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: DESIGN_SYSTEM.colors.background,
        color: DESIGN_SYSTEM.colors.text,
        overflow: 'hidden',
        fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
      }}>
        {/* HEADER */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'clamp(12px, 3vw, 16px)',
          borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border}`,
          background: `linear-gradient(180deg, ${DESIGN_SYSTEM.colors.surface} 0%, ${DESIGN_SYSTEM.colors.surfaceLight} 100%)`,
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: DESIGN_SYSTEM.colors.secondary,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ff1a1a',
                animation: 'pulse 2s infinite',
              }}></span>
              Live Match
            </div>
            <h1 style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 800,
              marginBottom: '4px',
              background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              ⚽ {venueName}
            </h1>
            {currentVenue && (
              <div style={{
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                color: DESIGN_SYSTEM.colors.textSecondary,
                marginTop: '4px',
              }}>
                ⭐ {currentVenue.rating.toFixed(1)} • 👥 {currentVenue.followers_count}
              </div>
            )}
          </div>

          {/* ✅ WALLET BALANCE DISPLAY - REAL-TIME */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(12px, 3vw, 20px)',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              padding: '10px 16px',
              borderRadius: DESIGN_SYSTEM.radius.md,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
              color: '#000',
              fontWeight: 'bold',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              minHeight: '44px',
              transition: 'all 200ms ease-out',
            }}>
              <span>💰</span>
              <span>₦{walletBalance.toLocaleString()}</span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '4px',
              minWidth: '60px',
            }}>
              <div style={{
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                color: DESIGN_SYSTEM.colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Viewers
              </div>
              <div style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                fontWeight: 'bold',
                color: DESIGN_SYSTEM.colors.secondary,
              }}>
                {Math.round(viewersCount)}
              </div>
            </div>

            <Link
              href="/"
              style={{
                padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
                background: DESIGN_SYSTEM.colors.accent,
                color: DESIGN_SYSTEM.colors.text,
                border: 'none',
                borderRadius: DESIGN_SYSTEM.radius.md,
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                fontWeight: 'bold',
                cursor: 'pointer',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'all 150ms ease-out',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff3333'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = DESIGN_SYSTEM.colors.accent
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Exit
            </Link>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 'clamp(8px, 2vw, 12px)',
          padding: 'clamp(8px, 2vw, 12px)',
          overflow: 'hidden',
        } as any}>
          {/* LEFT: Video & Chat */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 2vw, 12px)',
            minHeight: 0,
            overflow: 'hidden',
          }}>
            {/* Video Area */}
            <div style={{
              aspectRatio: '16 / 9',
              background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.surface} 0%, ${DESIGN_SYSTEM.colors.surfaceLight} 100%)`,
              borderRadius: DESIGN_SYSTEM.radius.lg,
              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: DESIGN_SYSTEM.colors.textSecondary,
              fontSize: 'clamp(12px, 2vw, 14px)',
              overflow: 'hidden',
            }}>
              <HapticVisualizer />
            </div>

            {/* Audio Controls */}
            <div style={{
              background: DESIGN_SYSTEM.colors.surface,
              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
              borderRadius: DESIGN_SYSTEM.radius.lg,
              padding: 'clamp(12px, 2vw, 16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'clamp(8px, 2vw, 12px)',
            }}>
              <div style={{
                flex: 1,
                minWidth: 0,
              }}>
                <div style={{
                  fontSize: 'clamp(11px, 2.5vw, 12px)',
                  color: DESIGN_SYSTEM.colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                }}>
                  {isMicrophoneEnabled ? '🎤 Live Broadcast' : '🔇 Mic Muted'}
                </div>
                <div style={{
                  height: '4px',
                  background: DESIGN_SYSTEM.colors.surfaceLight,
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${DESIGN_SYSTEM.colors.secondary} 0%, ${DESIGN_SYSTEM.colors.accent} 100%)`,
                    width: `${Math.min((volume || 0) * 100, 100)}%`,
                    transition: 'width 100ms ease-out',
                  }}></div>
                </div>
              </div>

              <button
                onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
                style={{
                  padding: 'clamp(10px, 2vw, 12px) clamp(14px, 3vw, 18px)',
                  background: isMicrophoneEnabled ? DESIGN_SYSTEM.colors.accent : DESIGN_SYSTEM.colors.primary,
                  color: DESIGN_SYSTEM.colors.text,
                  border: 'none',
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  fontSize: 'clamp(11px, 2.5vw, 12px)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  minHeight: '44px',
                  minWidth: '44px',
                  transition: 'all 150ms ease-out',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {isMicrophoneEnabled ? 'Mute' : 'Go Live'}
              </button>
            </div>

            {/* Chat & Voice */}
            <div style={{
              flex: 1,
              background: DESIGN_SYSTEM.colors.surface,
              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
              borderRadius: DESIGN_SYSTEM.radius.lg,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: 'clamp(12px, 2vw, 16px)',
                borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                color: DESIGN_SYSTEM.colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 'bold',
              }}>
                💬 Live Reactions & Voice
              </div>

              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: 'clamp(12px, 2vw, 16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(8px, 2vw, 12px)',
                scrollBehavior: 'smooth',
              }}>
                {voiceComments.length > 0 && (
                  <div style={{ marginBottom: 'clamp(12px, 2vw, 16px)' }}>
                    <div style={{
                      fontSize: 'clamp(11px, 2.5vw, 12px)',
                      color: DESIGN_SYSTEM.colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      paddingBottom: '8px',
                      borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                    }}>
                      🎙️ Voice Comments
                    </div>
                    {voiceComments.slice(-5).map((comment) => (
                      <div key={comment.id} style={{
                        marginBottom: 'clamp(8px, 2vw, 12px)',
                        padding: 'clamp(8px, 2vw, 10px)',
                        background: DESIGN_SYSTEM.colors.surfaceLight,
                        borderRadius: DESIGN_SYSTEM.radius.md,
                        borderLeft: `3px solid ${DESIGN_SYSTEM.colors.accent}`,
                      }}>
                        <VoiceMessage
                          comment={comment}
                          userEmail={userEmail}
                          voiceUrl={comment.voice_url}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {chat.map((msg, idx) => {
                  // Check if it's an image message
                  const isPicture = msg.type === 'PICTURE'
                  const imgUrl = isPicture ? msg.text.split('|SPLIT|')[0] : ''
                  const caption = isPicture ? msg.text.split('|SPLIT|')[1] : ''

                  return (
                    <div key={idx} style={{
                      animation: 'slideUp 300ms ease-out',
                    }}>
                      {isPicture ? (
                        // IMAGE MESSAGE
                        <div style={{
                          background: DESIGN_SYSTEM.colors.surfaceLight,
                          borderRadius: DESIGN_SYSTEM.radius.md,
                          borderLeft: `3px solid ${DESIGN_SYSTEM.colors.secondary}`,
                          padding: 'clamp(8px, 2vw, 10px)',
                        }}>
                          <span style={{
                            color: DESIGN_SYSTEM.colors.secondary,
                            fontWeight: 'bold',
                            marginRight: '8px',
                            display: 'block',
                            marginBottom: '8px',
                          }}>
                            {msg.user}:
                          </span>
                          <img
                            src={imgUrl}
                            alt="Chat image"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              borderRadius: DESIGN_SYSTEM.radius.md,
                              marginBottom: '8px',
                              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                              objectFit: 'cover',
                            }}
                          />
                          {caption && (
                            <p style={{
                              color: DESIGN_SYSTEM.colors.textSecondary,
                              fontSize: 'clamp(12px, 2.5vw, 14px)',
                              margin: 0,
                            }}>
                              {caption}
                            </p>
                          )}
                        </div>
                      ) : (
                        // TEXT MESSAGE
                        <div style={{
                          padding: 'clamp(8px, 2vw, 10px)',
                          background: DESIGN_SYSTEM.colors.surfaceLight,
                          borderRadius: DESIGN_SYSTEM.radius.md,
                          borderLeft: `3px solid ${DESIGN_SYSTEM.colors.secondary}`,
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                        }}>
                          <span style={{
                            color: DESIGN_SYSTEM.colors.secondary,
                            fontWeight: 'bold',
                            marginRight: '8px',
                          }}>
                            {msg.user}:
                          </span>
                          <span style={{ color: DESIGN_SYSTEM.colors.textSecondary }}>
                            {msg.text}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}

                <div ref={chatEndRef} />
              </div>

              {/* Voice Recorder */}
              {/* Input Area - Voice + Text */}
              <div style={{
                borderTop: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                padding: 'clamp(12px, 2vw, 16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(8px, 2vw, 12px)',
              }}>
                <VoiceRecorder
                  roomId={roomId}
                  userEmail={userEmail}
                  username={username}
                  onRecordingComplete={() => fetchVoiceComments(roomId)}
                />
                <ChatInput roomId={roomId} userEmail={userEmail} />
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM PANEL - Chaos Actions */}
        <div style={{
          borderTop: `1px solid ${DESIGN_SYSTEM.colors.border}`,
          background: DESIGN_SYSTEM.colors.surface,
          padding: 'clamp(8px, 2vw, 12px)',
          maxHeight: '200px',
          overflow: 'auto',
        }}>
          <DigitalChaosPanel 
            userEmail={userEmail} 
            onAction={handlePremiumActionClick}
          />
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  )
}

// ============================================
// PARENT COMPONENT - Handles token & LiveKitRoom
// ============================================
export default function MatchRoomClient({ roomId, venueName, userEmail }: MatchRoomClientProps) {
  const [token, setToken] = useState('')

  useEffect(() => {
    const testUsername = `Fan_${Math.floor(Math.random() * 1000)}`

    const fetchToken = async () => {
      try {
        const resp = await fetch(`/api/livekit?room=${roomId}&username=${testUsername}`)
        const data = await resp.json()
        setToken(data.token)
      } catch (e) {
        console.error('Token fetch failed', e)
      }
    }
    fetchToken()
  }, [roomId])

  if (token === '') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        background: DESIGN_SYSTEM.colors.background,
        color: DESIGN_SYSTEM.colors.secondary,
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}>
        🔄 Connecting to Edge...
      </div>
    )
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="dark"
    >
      <MatchRoomContent roomId={roomId} venueName={venueName} userEmail={userEmail} />
    </LiveKitRoom>
  )
}