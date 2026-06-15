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
      // Cast the dynamic method to a zero-argument function to clear the error
      const trigger = haptics[onHaptic as keyof typeof haptics] as (() => void) | undefined
      trigger?.()
    }
  }

  if (typeof children === 'string') {
    return <span onClick={handleClick}>{children}</span>
  }

  // 1. Cast explicitly to <any> to allow property extensions like onClick
  const childElement = children as React.ReactElement<any>

  return React.cloneElement(childElement, {
    onClick: (e: React.MouseEvent) => {
      handleClick(e)
      childElement.props.onClick?.(e) // 2. Safely read original onClick if it exists
    },
  })
}