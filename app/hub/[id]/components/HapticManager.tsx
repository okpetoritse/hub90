'use client'

import React, { ReactNode } from 'react'
import { useHaptics } from '@/app/hooks/useHaptics'

interface HapticFeedbackProps {
  children: ReactNode
  onHaptic?: 'soft' | 'success' | 'error' | 'goal' | 'intense' | 'custom'
  pattern?: number[]
}

export default function HapticFeedback({
  children,
  onHaptic = 'soft',
  pattern,
}: HapticFeedbackProps) {
  const haptics = useHaptics()

  const handleClick = (e: React.MouseEvent) => {
    if (onHaptic === 'custom' && pattern) {
      haptics.custom(pattern)
    } else {
      haptics[onHaptic as keyof typeof haptics]?.()
    }
  }

  if (typeof children === 'string') {
    return <span onClick={handleClick}>{children}</span>
  }

  return React.cloneElement(children as React.ReactElement, {
    onClick: (e: React.MouseEvent) => {
      handleClick(e)
      ;(children as React.ReactElement).props.onClick?.(e)
    },
  })
}