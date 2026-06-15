'use client'

import React, { useState } from 'react'
import { DESIGN_SYSTEM } from '@/app/styles/design-system'
import { X } from 'lucide-react'

interface JustificationModalProps {
  isOpen: boolean
  type: 'megaphone' | 'flare'
  amount: number
  onClose: () => void
  onConfirm: (justification: string) => void
  loading: boolean
}

const JUSTIFICATIONS = {
  megaphone: [
    '🎯 GOOOOOL!',
    '💪 WHAT A SAVE!',
    '⚽ PERFECT PASS!',
    '🤔 UNFAIR CALL!',
    '🔥 DIVE!',
    '⚡ BEST PLAY!',
    '📢 HEAR THIS!',
    '💬 Custom',
  ],
  flare: [
    '🏆 CHAMPIONS!',
    '⭐ HISTORY MADE!',
    '🔥 WE GOT THIS!',
    '💯 INCREDIBLE MATCH!',
    '🎉 BEST DAY EVER!',
    '👑 WE\'RE WINNING!',  // ✅ ESCAPED apostrophe
    '🚀 UNSTOPPABLE!',
    '💬 Custom',
  ],
}

export default function JustificationModal({
  isOpen,
  type,
  amount,
  onClose,
  onConfirm,
  loading,
}: JustificationModalProps) {
  const [selected, setSelected] = useState<string>('')
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  if (!isOpen) return null

  const justifications = JUSTIFICATIONS[type]
  const icon = type === 'megaphone' ? '📢' : '🔥'
  const title = type === 'megaphone' ? 'Megaphone' : 'Global Flare'

  const handleConfirm = () => {
    const justification = showCustom ? customText : selected
    if (!justification.trim()) {
      alert('Please select or type a justification')
      return
    }
    onConfirm(justification)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(4px)',
        padding: 'clamp(12px, 3vw, 20px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: DESIGN_SYSTEM.colors.surface,
          borderRadius: DESIGN_SYSTEM.radius.lg,
          padding: 'clamp(20px, 4vw, 32px)',
          maxWidth: '500px',
          width: '100%',
          border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
          animation: 'slideUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'clamp(16px, 3vw, 24px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: 'clamp(24px, 5vw, 32px)' }}>{icon}</span>
            <div>
              <h2
                style={{
                  fontSize: 'clamp(18px, 4vw, 24px)',
                  fontWeight: 'bold',
                  margin: 0,
                  color: DESIGN_SYSTEM.colors.secondary,
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  fontSize: 'clamp(11px, 2.5vw, 12px)',
                  color: DESIGN_SYSTEM.colors.textSecondary,
                  margin: '2px 0 0 0',
                }}
              >
                ₦{amount.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              color: DESIGN_SYSTEM.colors.textSecondary,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: DESIGN_SYSTEM.colors.textSecondary,
            marginBottom: 'clamp(16px, 3vw, 24px)',
            lineHeight: '1.4',
          }}
        >
          What's your celebration moment? Let everyone know why you're celebrating!
        </p>

        {/* Options Grid */}
        {!showCustom ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px, 90vw, 180px), 1fr))',
              gap: 'clamp(8px, 2vw, 12px)',
              marginBottom: 'clamp(16px, 3vw, 24px)',
            }}
          >
            {justifications.map((justification, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (justification === '💬 Custom') {
                    setShowCustom(true)
                  } else {
                    setSelected(justification)
                  }
                }}
                style={{
                  padding: 'clamp(12px, 2vw, 16px)',
                  background:
                    selected === justification
                      ? `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 100%)`
                      : DESIGN_SYSTEM.colors.surfaceLight,
                  color:
                    selected === justification
                      ? DESIGN_SYSTEM.colors.dark
                      : DESIGN_SYSTEM.colors.text,
                  border: `1px solid ${
                    selected === justification
                      ? DESIGN_SYSTEM.colors.secondary
                      : DESIGN_SYSTEM.colors.border
                  }`,
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  fontSize: 'clamp(11px, 2.5vw, 13px)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 150ms ease-out',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  lineHeight: '1.2',
                }}
                onMouseEnter={(e) => {
                  if (selected !== justification) {
                    e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.secondary
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected !== justification) {
                    e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border
                  }
                }}
              >
                {justification}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>
            <label
              style={{
                display: 'block',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                fontWeight: '600',
                marginBottom: '8px',
                color: DESIGN_SYSTEM.colors.textSecondary,
              }}
            >
              Your message (max 50 characters)
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value.slice(0, 50))}
              placeholder="Type your celebration..."
              style={{
                width: '100%',
                padding: 'clamp(12px, 2vw, 16px)',
                background: DESIGN_SYSTEM.colors.surfaceLight,
                border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                borderRadius: DESIGN_SYSTEM.radius.md,
                color: DESIGN_SYSTEM.colors.text,
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                fontFamily: 'inherit',
                minHeight: '80px',
                resize: 'none',
                transition: 'all 150ms ease-out',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.secondary
                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(255, 215, 0, 0.1)`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <p
              style={{
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                color: DESIGN_SYSTEM.colors.textSecondary,
                margin: '6px 0 0 0',
              }}
            >
              {customText.length}/50
            </p>
          </div>
        )}

        {/* Info Box */}
        <div
          style={{
            background: `rgba(255, 215, 0, 0.1)`,
            border: `1px solid rgba(255, 215, 0, 0.2)`,
            borderRadius: DESIGN_SYSTEM.radius.md,
            padding: 'clamp(12px, 2vw, 16px)',
            marginBottom: 'clamp(16px, 3vw, 24px)',
            fontSize: 'clamp(11px, 2.5vw, 12px)',
            color: DESIGN_SYSTEM.colors.textSecondary,
            lineHeight: '1.5',
          }}
        >
          💡 Your message will appear on the celebration wall for everyone to see. You're part of this moment!
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'clamp(8px, 2vw, 12px)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 'clamp(12px, 2vw, 14px)',
              background: DESIGN_SYSTEM.colors.surfaceLight,
              color: DESIGN_SYSTEM.colors.text,
              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
              borderRadius: DESIGN_SYSTEM.radius.md,
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 150ms ease-out',
              minHeight: '44px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (showCustom) {
                setShowCustom(false)
              } else {
                handleConfirm()
              }
            }}
            style={{
              flex: 1,
              padding: 'clamp(12px, 2vw, 14px)',
              background:
                showCustom || selected
                  ? `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 100%)`
                  : DESIGN_SYSTEM.colors.surfaceLight,
              color:
                showCustom || selected ? DESIGN_SYSTEM.colors.dark : DESIGN_SYSTEM.colors.textSecondary,
              border: 'none',
              borderRadius: DESIGN_SYSTEM.radius.md,
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              fontWeight: 'bold',
              cursor: showCustom || selected ? 'pointer' : 'not-allowed',
              textTransform: 'uppercase',
              transition: 'all 150ms ease-out',
              minHeight: '44px',
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading || (!showCustom && !selected)}
          >
            {loading ? '⏳ Processing...' : showCustom ? 'Back' : `Celebrate ₦${amount}`}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}