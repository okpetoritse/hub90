'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { DESIGN_SYSTEM } from '@/app/styles/design-system'
import { Clock, Users, Trophy, Zap } from 'lucide-react'

interface Match {
  id: string
  homeTeam: {
    name: string
    code: string
    crest?: string
  }
  awayTeam: {
    name: string
    code: string
    crest?: string
  }
  utcDate: string
  status: string
  score?: {
    fullTime: {
      home: number
      away: number
    }
  }
  hubId?: number
}

export default function MatchTracker() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())

 // Fetch matches from our API route
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) throw new Error('Failed to fetch matches')

        const data = await response.json()
        setMatches(data.matches || [])
      } catch (error) {
        console.error('Failed to fetch matches:', error)
        setMatches([])
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()

    // Refresh every 30 seconds
    const interval = setInterval(fetchMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  // Update time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const getMatchStatus = (match: Match) => {
    const matchTime = new Date(match.utcDate)
    const now = new Date()
    const diffMs = matchTime.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (match.status === 'FINISHED') {
      return { text: 'FINISHED', color: DESIGN_SYSTEM.colors.textSecondary, icon: '✓' }
    } else if (match.status === 'IN_PLAY') {
      return { text: 'LIVE NOW', color: DESIGN_SYSTEM.colors.accent, icon: '🔴' }
    } else if (match.status === 'PAUSED') {
      return { text: 'PAUSED', color: DESIGN_SYSTEM.colors.textSecondary, icon: '⏸' }
    } else if (diffHours < 0) {
      return { text: 'FINISHED', color: DESIGN_SYSTEM.colors.textSecondary, icon: '✓' }
    } else if (diffHours === 0 && diffMins <= 30) {
      return { text: `STARTS IN ${diffMins}m`, color: DESIGN_SYSTEM.colors.secondary, icon: '⚡' }
    } else if (diffHours < 2) {
      return { text: `${diffHours}h ${diffMins}m`, color: DESIGN_SYSTEM.colors.secondary, icon: '🕐' }
    } else {
      return { text: `${diffHours}h ${diffMins}m`, color: DESIGN_SYSTEM.colors.textSecondary, icon: '🕐' }
    }
  }

  if (loading) {
    return (
      <section style={{
        padding: 'clamp(32px, 6vw, 56px) clamp(16px, 5vw, 32px)',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div style={{
          textAlign: 'center',
          color: DESIGN_SYSTEM.colors.textSecondary,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          ⏳ Loading today's matches...
        </div>
      </section>
    )
  }

  if (matches.length === 0) {
    return null
  }

  return (
    <section style={{
      padding: 'clamp(32px, 6vw, 56px) clamp(16px, 5vw, 32px)',
      maxWidth: '1400px',
      margin: '0 auto',
      borderTop: `1px solid ${DESIGN_SYSTEM.colors.border}`,
      borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border}`,
      background: `linear-gradient(135deg, rgba(255, 215, 0, 0.02) 0%, rgba(26, 77, 127, 0.02) 100%)`,
    }}>
      {/* Header */}
      <div style={{
        marginBottom: 'clamp(24px, 4vw, 40px)',
        animation: 'slideUp 600ms ease-out',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 2vw, 12px)',
          marginBottom: '8px',
        }}>
          <Trophy size={28} style={{ color: DESIGN_SYSTEM.colors.secondary }} />
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 40px)',
            fontWeight: 'bold',
            background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, ${DESIGN_SYSTEM.colors.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
          }}>
            Today's Matches
          </h2>
        </div>
        <p style={{
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          color: DESIGN_SYSTEM.colors.textSecondary,
          margin: 0,
        }}>
          🌍 World Cup 2026 • {matches.length} match{matches.length !== 1 ? 'es' : ''} today
        </p>
      </div>

      {/* Matches Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(300px, 90vw, 420px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
      }}>
        {matches.map((match, idx) => {
          const status = getMatchStatus(match)
          const isLive = match.status === 'IN_PLAY'
          const isFinished = match.status === 'FINISHED'

          return (
            <Link
              key={match.id}
              href={`/hub/${match.hubId || match.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                animation: `slideUp 600ms ease-out ${idx * 100}ms both`,
              }}
            >
              <div
                style={{
                  background: isLive
                    ? `linear-gradient(135deg, rgba(255, 26, 26, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)`
                    : `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.surface} 0%, ${DESIGN_SYSTEM.colors.surfaceLight} 100%)`,
                  border: isLive
                    ? `2px solid ${DESIGN_SYSTEM.colors.accent}`
                    : `1px solid ${DESIGN_SYSTEM.colors.border}`,
                  borderRadius: DESIGN_SYSTEM.radius.lg,
                  padding: 'clamp(16px, 3vw, 24px)',
                  cursor: 'pointer',
                  transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                  e.currentTarget.style.boxShadow = isLive
                    ? `0 12px 32px rgba(255, 26, 26, 0.2), 0 0 20px rgba(255, 26, 26, 0.15)`
                    : `0 12px 32px rgba(255, 215, 0, 0.15), 0 0 20px rgba(255, 215, 0, 0.1)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Live Indicator */}
                {isLive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: DESIGN_SYSTEM.colors.accent,
                      color: DESIGN_SYSTEM.colors.text,
                      padding: '4px 12px',
                      borderRadius: DESIGN_SYSTEM.radius.md,
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      animation: 'pulse 1s ease-in-out infinite',
                      zIndex: 10,
                    }}
                  >
                    🔴 LIVE
                  </div>
                )}

                {/* Glow Effect */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: isLive
                      ? `radial-gradient(circle at top right, rgba(255, 26, 26, 0.1) 0%, transparent 60%)`
                      : `radial-gradient(circle at top right, rgba(255, 215, 0, 0.1) 0%, transparent 60%)`,
                    pointerEvents: 'none',
                  }}
                />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Match Time */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '16px',
                    padding: '8px 12px',
                    background: `rgba(255, 215, 0, 0.1)`,
                    borderRadius: DESIGN_SYSTEM.radius.md,
                    backdropFilter: 'blur(4px)',
                    width: 'fit-content',
                  }}>
                    <Clock size={14} style={{ color: DESIGN_SYSTEM.colors.secondary }} />
                    <span style={{
                      fontSize: 'clamp(11px, 2.5vw, 12px)',
                      fontWeight: 'bold',
                      color: DESIGN_SYSTEM.colors.secondary,
                    }}>
                      {new Date(match.utcDate).toLocaleTimeString('en-NG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Teams */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '16px',
                  }}>
                    {/* Home Team */}
                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                    }}>
                      <div style={{
                        fontSize: 'clamp(28px, 5vw, 40px)',
                        marginBottom: '8px',
                      }}>
                        {match.homeTeam.code}
                      </div>
                      <div style={{
                        fontSize: 'clamp(12px, 2.5vw, 13px)',
                        fontWeight: 'bold',
                        color: DESIGN_SYSTEM.colors.text,
                        lineHeight: '1.2',
                      }}>
                        {match.homeTeam.name}
                      </div>

                      {/* Score if finished or in play */}
                      {(isFinished || isLive) && match.score && (
                        <div style={{
                          fontSize: 'clamp(20px, 4vw, 28px)',
                          fontWeight: 'bold',
                          color: DESIGN_SYSTEM.colors.secondary,
                          marginTop: '8px',
                        }}>
                          {match.score.fullTime.home}
                        </div>
                      )}
                    </div>

                    {/* VS */}
                    <div style={{
                      fontSize: 'clamp(11px, 2.5vw, 12px)',
                      fontWeight: 'bold',
                      color: DESIGN_SYSTEM.colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      padding: '8px',
                    }}>
                      VS
                    </div>

                    {/* Away Team */}
                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                    }}>
                      <div style={{
                        fontSize: 'clamp(28px, 5vw, 40px)',
                        marginBottom: '8px',
                      }}>
                        {match.awayTeam.code}
                      </div>
                      <div style={{
                        fontSize: 'clamp(12px, 2.5vw, 13px)',
                        fontWeight: 'bold',
                        color: DESIGN_SYSTEM.colors.text,
                        lineHeight: '1.2',
                      }}>
                        {match.awayTeam.name}
                      </div>

                      {/* Score if finished or in play */}
                      {(isFinished || isLive) && match.score && (
                        <div style={{
                          fontSize: 'clamp(20px, 4vw, 28px)',
                          fontWeight: 'bold',
                          color: DESIGN_SYSTEM.colors.secondary,
                          marginTop: '8px',
                        }}>
                          {match.score.fullTime.away}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: 'clamp(11px, 2.5vw, 12px)',
                    fontWeight: 'bold',
                    color: status.color,
                  }}>
                    <span>{status.icon}</span>
                    {status.text}
                  </div>

                  <button
                    style={{
                      padding: '8px 16px',
                      background: isLive
                        ? `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.accent} 0%, #ff5a5a 100%)`
                        : `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 100%)`,
                      color: DESIGN_SYSTEM.colors.dark,
                      border: 'none',
                      borderRadius: DESIGN_SYSTEM.radius.md,
                      fontSize: 'clamp(10px, 2.5vw, 11px)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      minHeight: '36px',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    {isLive ? '🔴 WATCH' : isFinished ? '📊 REPLAY' : '👀 JOIN'}
                  </button>
                </div>
              </div>
            </Link>
          )
        })}
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

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </section>
  )
}