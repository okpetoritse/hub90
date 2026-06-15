import { Venue } from '@/app/types/venue'

export class VenueManager {
  static isPhysicalVenue(venue: Venue): boolean {
    return venue.venue_type === 'physical'
  }

  static isVirtualVenue(venue: Venue): boolean {
    return venue.venue_type === 'virtual'
  }

  static isVerified(venue: Venue): boolean {
    return venue.is_verified
  }

  static formatVenueName(venue: Venue): string {
    if (this.isVirtualVenue(venue)) {
      return `${venue.venue_name} (Virtual)`
    }
    return venue.venue_name
  }

  static getVenueAvatar(venue: Venue): string {
    if (venue.logo_url) {
      return venue.logo_url
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(venue.venue_name)}`
  }

  static calculateVenueScore(venue: Venue): number {
    let score = 0
    if (venue.is_verified) score += 30
    if (venue.followers_count > 100) score += 20
    if (venue.rating >= 4) score += 20
    if (venue.revenue_total > 0) score += 10
    if (venue.total_reviews > 10) score += 10
    if (venue.venue_type === 'physical') score += 10
    return Math.min(score, 100)
  }

  static getVenueBadges(venue: Venue): string[] {
    const badges: string[] = []
    if (venue.is_verified) badges.push('verified')
    if (venue.followers_count > 500) badges.push('popular')
    if (venue.rating >= 4.5) badges.push('highly-rated')
    if (venue.revenue_total > 50000) badges.push('top-earner')
    return badges
  }
}