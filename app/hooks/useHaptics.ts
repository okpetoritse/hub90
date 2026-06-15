import { useCallback } from 'react'
import { HapticManager } from '@/app/lib/haptics'
import { HAPTIC_PATTERNS } from '@/app/types/haptic'

export const useHaptics = () => {
  const trigger = useCallback((pattern: keyof typeof HAPTIC_PATTERNS) => {
    HapticManager.trigger(pattern)
  }, [])

  const soft = useCallback(() => HapticManager.soft(), [])
  const success = useCallback(() => HapticManager.success(), [])
  const error = useCallback(() => HapticManager.error(), [])
  const goalScored = useCallback(() => HapticManager.goalScored(), [])
  const intense = useCallback(() => HapticManager.intense(), [])
  const custom = useCallback((pattern: number[]) => HapticManager.custom(pattern), [])
  const stop = useCallback(() => HapticManager.stop(), [])

  return {
    trigger,
    soft,
    success,
    error,
    goalScored,
    intense,
    custom,
    stop,
  }
}