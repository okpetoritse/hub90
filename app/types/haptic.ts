export interface HapticPattern {
  name: string
  pattern: number[] // milliseconds
  intensity: 'soft' | 'medium' | 'strong'
}

export const HAPTIC_PATTERNS: Record<string, HapticPattern> = {
  soft: {
    name: 'soft',
    pattern: [30],
    intensity: 'soft',
  },
  success: {
    name: 'success',
    pattern: [50, 100, 50],
    intensity: 'medium',
  },
  error: {
    name: 'error',
    pattern: [100, 50, 100],
    intensity: 'strong',
  },
  goal_scored: {
    name: 'goal_scored',
    pattern: [100, 50, 100, 50, 200],
    intensity: 'strong',
  },
  intense: {
    name: 'intense',
    pattern: [200, 100, 200],
    intensity: 'strong',
  },
}