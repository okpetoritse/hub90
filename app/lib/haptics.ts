import { HAPTIC_PATTERNS } from '@/app/types/haptic'

export class HapticManager {
  private static isSupported(): boolean {
    return typeof window !== 'undefined' && 'vibrate' in navigator
  }

  private static canVibrate(): boolean {
    if (!this.isSupported()) return false
    // Check if device actually supports vibration
    return navigator.vibrate(0) !== false
  }

  static trigger(patternName: keyof typeof HAPTIC_PATTERNS) {
    if (!this.isSupported()) return

    const pattern = HAPTIC_PATTERNS[patternName]
    if (pattern) {
      navigator.vibrate(pattern.pattern)
    }
  }

  // SOFT FEEDBACK - Light tap
  static soft() {
    if (this.canVibrate()) {
      navigator.vibrate(10) // 10ms
    }
  }

  // SUCCESS FEEDBACK - Positive confirmation
  static success() {
    if (this.canVibrate()) {
      navigator.vibrate([50, 50, 50]) // pulse pulse pulse
    }
  }

  // ERROR FEEDBACK - Warning
  static error() {
    if (this.canVibrate()) {
      navigator.vibrate([100, 50, 100]) // strong warning pattern
    }
  }

  // GOAL SCORED - Celebration
  static goalScored() {
    if (this.canVibrate()) {
      navigator.vibrate([200, 100, 200, 100, 200]) // intense celebration
    }
  }

  // INTENSE - Strong feedback
  static intense() {
    if (this.canVibrate()) {
      navigator.vibrate([300, 100, 300]) // very strong
    }
  }

  // ⭐ MEGAPHONE - Strong vibration pattern
  static megaphone() {
    if (this.canVibrate()) {
      navigator.vibrate([100, 50, 100, 50, 100, 50, 100])
    }
  }

  // ⭐ FLARE - Intense vibration pattern
  static flare() {
    if (this.canVibrate()) {
      navigator.vibrate([500, 200, 500, 200, 500])
    }
  }

  // Stop any vibration
  static stop() {
    if (this.isSupported()) {
      navigator.vibrate(0)
    }
  }

  // Custom vibration pattern
  static custom(pattern: number[]) {
    if (this.canVibrate()) {
      navigator.vibrate(pattern)
    }
  }

  // Check if vibration is available
  static isAvailable(): boolean {
    return this.canVibrate()
  }
}