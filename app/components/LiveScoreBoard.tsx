'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LiveScoreBoard() {
  const [fixtures, setFixtures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTodaysMatches = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0]
        
        const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
          headers: { 'x-apisports-key': '38b78ed2c30abeee92a266a887cab636' }
        })
        const data = await res.json()
        
        if (data.response) {
          // Sort so LIVE matches appear first, then upcoming, then finished
          const sortedFixtures = data.response.sort((a: any, b: any) => {
            const aLive = a.fixture.status.short === '1H' || a.fixture.status.short === '2H' || a.fixture.status.short === 'HT'
            const bLive = b.fixture.status.short === '1H' || b.fixture.status.short === '2H' || b.fixture.status.short === 'HT'
            if (aLive && !bLive) return -1
            if (!aLive && bLive) return 1
            return 0
          })
          
          // Grab the top 6 most relevant matches for the homepage grid
          setFixtures(sortedFixtures.slice(0, 6))
        }
      } catch (error) {
        console.error("Failed to fetch fixtures:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysMatches()
    
    // The "Free Tier" Background Updater (Refreshes the homepage every 60 seconds)
    const interval = setInterval(fetchTodaysMatches, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center border border-white/10 rounded-2xl bg-white/5">
        <span className="text-wc-gold font-black tracking-widest text-xs animate-pulse">CALIBRATING GLOBAL RADAR...</span>
      </div>
    )
  }

  if (fixtures.length === 0) {
    return (
      <div className="w-full h-32 flex items-center justify-center border border-white/10 rounded-2xl bg-white/5">
        <span className="text-gray-500 font-bold tracking-widest text-xs uppercase">No matches scheduled for today.</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {fixtures.map((match) => {
        const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(match.fixture.status.short)
        const matchTime = new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        
        return (
          <Link 
            href={`/match/${match.fixture.id}`} 
            key={match.fixture.id}
            className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-wc-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-6"
          >
            {/* Live Indicator / Time */}
            <div className="absolute top-4 flex items-center justify-center w-full">
              {isLive ? (
                <span className="text-[9px] font-black uppercase tracking-widest text-fireCoral flex items-center gap-2 bg-fireCoral/10 px-3 py-1 rounded-full border border-fireCoral/20">
                  <span className="w-2 h-2 rounded-full bg-fireCoral animate-ping"></span>
                  {match.fixture.status.elapsed}' MIN
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  {match.fixture.status.short === 'FT' ? 'FULL TIME' : matchTime}
                </span>
              )}
            </div>

            {/* The Main Matchup UI */}
            <div className="flex items-center justify-between w-full mt-6">
              
              {/* Home Team */}
              <div className="flex flex-col items-center gap-3 w-1/3">
                <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white text-center line-clamp-1">
                  {match.teams.home.name.substring(0, 3)}
                </span>
              </div>

              {/* The Score / VS */}
              <div className="flex flex-col items-center justify-center w-1/3">
                {isLive || match.fixture.status.short === 'FT' ? (
                  <span className="text-2xl font-black text-white tracking-tighter">
                    {match.goals.home} - {match.goals.away}
                  </span>
                ) : (
                  <span className="text-xl font-black text-wc-gold">VS</span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-3 w-1/3">
                <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white text-center line-clamp-1">
                  {match.teams.away.name.substring(0, 3)}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}