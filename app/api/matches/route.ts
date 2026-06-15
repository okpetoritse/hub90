import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock World Cup 2026 matches for demonstration
    const mockMatches = [
      {
        id: 'wc-2026-001',
        homeTeam: {
          name: 'Argentina',
          code: '🇦🇷',
          crest: 'https://crests.football-data.org/AR.svg',
        },
        awayTeam: {
          name: 'Brazil',
          code: '🇧🇷',
          crest: 'https://crests.football-data.org/BR.svg',
        },
        utcDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED',
        score: null,
        hubId: 1,
      },
      {
        id: 'wc-2026-002',
        homeTeam: {
          name: 'France',
          code: '🇫🇷',
          crest: 'https://crests.football-data.org/FR.svg',
        },
        awayTeam: {
          name: 'Germany',
          code: '🇩🇪',
          crest: 'https://crests.football-data.org/DE.svg',
        },
        utcDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED',
        score: null,
        hubId: 2,
      },
      {
        id: 'wc-2026-003',
        homeTeam: {
          name: 'England',
          code: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          crest: 'https://crests.football-data.org/GB.svg',
        },
        awayTeam: {
          name: 'Spain',
          code: '🇪🇸',
          crest: 'https://crests.football-data.org/ES.svg',
        },
        utcDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED',
        score: null,
        hubId: 3,
      },
      {
        id: 'wc-2026-004',
        homeTeam: {
          name: 'Nigeria',
          code: '🇳🇬',
          crest: 'https://crests.football-data.org/NG.svg',
        },
        awayTeam: {
          name: 'Belgium',
          code: '🇧🇪',
          crest: 'https://crests.football-data.org/BE.svg',
        },
        utcDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED',
        score: null,
        hubId: 4,
      },
    ]

    return NextResponse.json({
      matches: mockMatches,
      success: true,
    })
  } catch (error) {
    console.error('Matches API error:', error)
    return NextResponse.json(
      {
        matches: [],
        success: false,
        error: 'Failed to fetch matches',
      },
      { status: 500 }
    )
  }
}