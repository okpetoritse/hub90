// ============================================
// FOOTBALL API SERVICE - FotMob (via RapidAPI)
// Using: Free Football API with real data
// ============================================

const API_BASE = 'https://free-api-live-football-data.p.rapidapi.com'
const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || ''
const API_HOST = 'free-api-live-football-data.p.rapidapi.com'

// New bulletproof line: strictly guarantees a boolean true or false
const USE_REAL_API = Boolean(API_KEY && API_KEY !== 'demo-key')

// League IDs from the API
export const LEAGUE_IDS = {
  WORLD_CUP: 77,
  PREMIER_LEAGUE: 47,
  LA_LIGA: 87,
  BUNDESLIGA: 54,
  LIGUE_1: 53,
  SERIE_A: 55,
}

interface TeamData {
  id: number
  name: string
  league: string
  country: string
  logo: string
  crest: string
  primary_color: string
  secondary_color: string
  accent_color: string
  stadium: string
  founded_year: number
}

interface PlayerData {
  id: number
  name: string
  number?: number
  position: string
  age?: number
  nationality: string
  photo: string
}

interface LeagueData {
  id: number
  name: string
  localizedName: string
  logo: string
  ccode: string
}

// ============================================
// API CALLS
// ============================================

async function makeAPICall(endpoint: string) {
  try {
    if (!USE_REAL_API) {
      console.log('📦 API key not configured - using mock data')
      return null
    }

    const response = await fetch(
      `${API_BASE}${endpoint}`,
      {
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST,
        },
      }
    )

    if (!response.ok) {
      console.warn(`⚠️ API Error ${response.status}: ${endpoint}`)
      return null
    }

    const data = await response.json()
    console.log(`✅ API Success: ${endpoint}`, data)
    return data
  } catch (error) {
    console.error('❌ API Error:', error)
    return null
  }
}

// Fetch popular leagues
export async function fetchAllTeams(): Promise<TeamData[]> {
  console.log('🌍 Attempting to fetch REAL World Cup 2026 data...')
  
  if (!USE_REAL_API) {
    console.log('📦 API key not configured - using MOCK data')
    return getMockAllTeams()
  }

  try {
    // Fetch World Cup matches/teams from the API
    const response = await fetch(
      `${API_BASE}/competitions/17`,  // World Cup competition ID
      {
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST,
        },
      }
    )

    if (!response.ok) {
      console.warn(`⚠️ API Error fetching World Cup data, using MOCK data`)
      return getMockAllTeams()
    }

    const data = await response.json()
    console.log('✅ REAL World Cup data fetched!', data)
    
    // If you get data back, use it; otherwise fallback to mock
    return data?.response?.teams ? data.response.teams : getMockAllTeams()
  } catch (error) {
    console.error('❌ Error fetching real data:', error)
    return getMockAllTeams()
  }
}

function getMockAllTeams(): TeamData[] {
  const mockTeams: TeamData[] = [
    {
      id: 33,
      name: 'Manchester United',
      league: 'Premier League',
      country: 'England',
      logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/33.png',
      crest: 'https://images.fotmob.com/image_resources/logo/teamlogo/33.png',
      primary_color: '#DA291C',
      secondary_color: '#F1E4C3',
      accent_color: '#000000',
      stadium: 'Old Trafford',
      founded_year: 1878,
    },
    // ... rest of mock teams
  ]
  return mockTeams
}

// Fetch teams in a league
export async function fetchLeagueTeams(leagueId: number): Promise<TeamData[]> {
  if (!USE_REAL_API) {
    return getMockTeams(leagueId)
  }

  try {
    const data = await makeAPICall(`/leagues/${leagueId}/teams`)
    
    if (data?.response?.teams) {
      return data.response.teams.map((team: any) => ({
        id: team.id,
        name: team.name,
        league: team.league || 'League',
        country: team.country || '',
        logo: team.logo || team.crest || '',
        crest: team.crest || team.logo || '',
        primary_color: team.primaryColor || '#000000',
        secondary_color: team.secondaryColor || '#FFFFFF',
        accent_color: team.accentColor || '#FFD700',
        stadium: team.stadium || '',
        founded_year: team.foundedYear || 2000,
      }))
    }
  } catch (error) {
    console.error('Error fetching league teams:', error)
  }

  return getMockTeams(leagueId)
}

// Fetch team details
export async function fetchTeamData(teamId: number): Promise<TeamData | null> {
  if (!USE_REAL_API) {
    return getMockTeam(teamId)
  }

  try {
    const data = await makeAPICall(`/teams/${teamId}`)
    
    if (data?.response?.team) {
      const team = data.response.team
      return {
        id: team.id,
        name: team.name,
        league: team.league || 'League',
        country: team.country || '',
        logo: team.logo || team.crest || '',
        crest: team.crest || team.logo || '',
        primary_color: team.primaryColor || '#000000',
        secondary_color: team.secondaryColor || '#FFFFFF',
        accent_color: team.accentColor || '#FFD700',
        stadium: team.stadium || '',
        founded_year: team.foundedYear || 2000,
      }
    }
  } catch (error) {
    console.error('Error fetching team:', error)
  }

  return getMockTeam(teamId)
}

// Fetch team players
export async function fetchTeamPlayers(teamId: number): Promise<PlayerData[]> {
  if (!USE_REAL_API) {
    return getMockPlayers(teamId)
  }

  try {
    const data = await makeAPICall(`/teams/${teamId}/players`)
    
    if (data?.response?.players) {
      return data.response.players.map((player: any) => ({
        id: player.id,
        name: player.name,
        number: player.number,
        position: player.position || 'Unknown',
        age: player.age,
        nationality: player.nationality || '',
        photo: player.photo || '',
      }))
    }
  } catch (error) {
    console.error('Error fetching players:', error)
  }

  return getMockPlayers(teamId)
}




// ============================================
// MOCK DATA
// ============================================

function getMockTeams(leagueId: number): TeamData[] {
  const allMock: Record<number, TeamData[]> = {
    [LEAGUE_IDS.WORLD_CUP]: [
      {
        id: 1,
        name: 'Argentina',
        league: 'World Cup 2026',
        country: 'Argentina',
        logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/5.png',
        crest: 'https://images.fotmob.com/image_resources/logo/teamlogo/5.png',
        primary_color: '#87CEEB',
        secondary_color: '#FFFFFF',
        accent_color: '#FFD700',
        stadium: 'Estadio Monumental',
        founded_year: 1901,
      },
    ],
    [LEAGUE_IDS.PREMIER_LEAGUE]: [
      {
        id: 33,
        name: 'Manchester United',
        league: 'Premier League',
        country: 'England',
        logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/33.png',
        crest: 'https://images.fotmob.com/image_resources/logo/teamlogo/33.png',
        primary_color: '#DA291C',
        secondary_color: '#F1E4C3',
        accent_color: '#000000',
        stadium: 'Old Trafford',
        founded_year: 1878,
      },
    ],
    [LEAGUE_IDS.LA_LIGA]: [
      {
        id: 50,
        name: 'Real Madrid',
        league: 'LaLiga',
        country: 'Spain',
        logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/50.png',
        crest: 'https://images.fotmob.com/image_resources/logo/teamlogo/50.png',
        primary_color: '#FFFFFF',
        secondary_color: '#0051BA',
        accent_color: '#FFD700',
        stadium: 'Santiago Bernabéu',
        founded_year: 1902,
      },
    ],
    [LEAGUE_IDS.SERIE_A]: [
      {
        id: 25,
        name: 'Inter Milan',
        league: 'Serie A',
        country: 'Italy',
        logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/25.png',
        crest: 'https://images.fotmob.com/image_resources/logo/teamlogo/25.png',
        primary_color: '#0066CC',
        secondary_color: '#000000',
        accent_color: '#FFB81C',
        stadium: 'San Siro',
        founded_year: 1908,
      },
    ],
    [LEAGUE_IDS.BUNDESLIGA]: [
      {
        id: 47,
        name: 'Bayern Munich',
        league: 'Bundesliga',
        country: 'Germany',
        logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/47.png',
        crest: 'https://images.fotmob.com/image_resources/logo/teamlogo/47.png',
        primary_color: '#DC052D',
        secondary_color: '#FFFFFF',
        accent_color: '#000000',
        stadium: 'Allianz Arena',
        founded_year: 1900,
      },
    ],
    [LEAGUE_IDS.LIGUE_1]: [
      {
        id: 71,
        name: 'Paris Saint-Germain',
        league: 'Ligue 1',
        country: 'France',
        logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/71.png',
        crest: 'https://images.fotmob.com/image_resources/logo/teamlogo/71.png',
        primary_color: '#004494',
        secondary_color: '#FFFFFF',
        accent_color: '#FFD700',
        stadium: 'Parc des Princes',
        founded_year: 1970,
      },
    ],
  }

  return allMock[leagueId] || []
}

function getMockTeam(teamId: number): TeamData | null {
  const mockTeams: Record<number, TeamData> = {
    33: {
      id: 33,
      name: 'Manchester United',
      league: 'Premier League',
      country: 'England',
      logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/33.png',
      crest: 'https://images.fotmob.com/image_resources/logo/teamlogo/33.png',
      primary_color: '#DA291C',
      secondary_color: '#F1E4C3',
      accent_color: '#000000',
      stadium: 'Old Trafford',
      founded_year: 1878,
    },
    50: {
      id: 50,
      name: 'Real Madrid',
      league: 'LaLiga',
      country: 'Spain',
      logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/50.png',
      crest: 'https://images.fotmob.com/image_resources/logo/teamlogo/50.png',
      primary_color: '#FFFFFF',
      secondary_color: '#0051BA',
      accent_color: '#FFD700',
      stadium: 'Santiago Bernabéu',
      founded_year: 1902,
    },
  }

  return mockTeams[teamId] || null
}

function getMockPlayers(teamId: number): PlayerData[] {
  const mockPlayers: Record<number, PlayerData[]> = {
    33: [
      {
        id: 1,
        name: 'Bruno Fernandes',
        number: 8,
        position: 'Midfielder',
        age: 30,
        nationality: 'Portugal',
        photo: 'https://images.fotmob.com/image_resources/logo/playerphoto/1.png',
      },
    ],
    50: [
      {
        id: 2,
        name: 'Kylian Mbappé',
        number: 9,
        position: 'Forward',
        age: 25,
        nationality: 'France',
        photo: 'https://images.fotmob.com/image_resources/logo/playerphoto/2.png',
      },
    ],
  }

  return mockPlayers[teamId] || []
}

export function getAPIStatus(): string {
  return USE_REAL_API ? '🟢 Using REAL FotMob API' : '📦 Using MOCK data (add API key to enable real data)'
}

export function isUsingRealAPI(): boolean {
  return USE_REAL_API
}