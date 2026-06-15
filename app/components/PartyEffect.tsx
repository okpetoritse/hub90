'use client'

import React, { useEffect, useState } from 'react'

interface PartyEffectProps {
  trigger: boolean
  type: 'megaphone' | 'flare'
  onComplete?: () => void
}

export default function PartyEffect({ trigger, type, onComplete }: PartyEffectProps) {
  const [confetti, setConfetti] = useState<Array<{
    id: number
    left: number
    delay: number
    duration: number
    color: string
  }>>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!trigger) return

    setIsActive(true)

    // Generate confetti pieces
    const confettiPieces = Array.from({ length: type === 'flare' ? 60 : 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 2 + Math.random() * 1,
      color: ['#FFD700', '#FF1A1A', '#1A4D7F', '#00FF00', '#FF00FF'][Math.floor(Math.random() * 5)],
    }))

    setConfetti(confettiPieces)

    // Play celebration sound effect (optional)
    if (type === 'flare') {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==')
        audio.play().catch(() => {})
      } catch (e) {
        // Silent fail if audio doesn't work
      }
    }

    // Reset after animation
    const timer = setTimeout(() => {
      setIsActive(false)
      setConfetti([])
      onComplete?.()
    }, type === 'flare' ? 3000 : 2000)

    return () => clearTimeout(timer)
  }, [trigger, type, onComplete])

  if (!isActive) return null

  return (
    <>
      {/* Confetti Container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      >
        {confetti.map((piece) => (
          <div
            key={piece.id}
            style={{
              position: 'absolute',
              left: `${piece.left}%`,
              top: '-10px',
              width: type === 'flare' ? '12px' : '8px',
              height: type === 'flare' ? '12px' : '8px',
              background: piece.color,
              borderRadius: '50%',
              animation: `fall ${piece.duration}s linear ${piece.delay}s forwards`,
              boxShadow: `0 0 ${type === 'flare' ? '12px' : '6px'} ${piece.color}`,
            }}
          />
        ))}
      </div>

      {/* Screen Shake & Flash */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9998,
          animation:
            type === 'flare'
              ? 'screenShake 0.4s cubic-bezier(0.36, 0, 0.66, -0.56), screenFlash 0.6s ease-out'
              : 'screenShake 0.2s ease-out',
        }}
      />

      {/* Celebration Text */}
      {type === 'flare' && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(48px, 15vw, 120px)',
            fontWeight: 'bold',
            zIndex: 9997,
            pointerEvents: 'none',
            animation: 'celebrationPop 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
          }}
        >
          🔥 PARTY! 🔥
        </div>
      )}

      {type === 'megaphone' && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(36px, 12vw, 96px)',
            fontWeight: 'bold',
            zIndex: 9997,
            pointerEvents: 'none',
            animation: 'celebrationPop 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            textShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
          }}
        >
          📢 HEARD!
        </div>
      )}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes screenShake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2px, -2px); }
          20% { transform: translate(2px, 2px); }
          30% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          50% { transform: translate(-1px, 1px); }
          60% { transform: translate(1px, -1px); }
          70% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
          90% { transform: translate(0, -1px); }
        }

        @keyframes screenFlash {
          0% {
            background: rgba(255, 215, 0, 0.3);
          }
          50% {
            background: rgba(255, 215, 0, 0);
          }
          100% {
            background: transparent;
          }
        }

        @keyframes celebrationPop {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(-45deg);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2) rotate(10deg);
          }
          100% {
            transform: translate(-50%, -80%) scale(1) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}