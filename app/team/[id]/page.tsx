'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { DESIGN_SYSTEM } from '@/app/styles/design-system'
import { ChevronLeft, MapPin, Users, Trophy } from 'lucide-react'

interface Team {
  id: number
  name: string
  league: string
  country: string
  primary_color: string
  secondary_color: string
  accent_color: string
  stadium: string
  founded_year: number
}

interface Player {
  id: number
  player_name: string
  jersey_number: number
  position: string
  nationality: string
}

export default function TeamHubPage() {
  const params = useParams()
  const teamId = params.id as string
  const [team, setTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

 useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const { fetchTeamData: getTeam, fetchTeamPlayers: getPlayers } = await import('@/app/lib/football-api')
        
        const teamData = await getTeam(parseInt(teamId))
        if (teamData) {
          setTeam(teamData as Team)
        }

        const playersData = await getPlayers(parseInt(teamId))
        if (playersData) {
          setPlayers(playersData as Player[])
        }
      } catch (error) {
        console.error('Error fetching team:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [teamId])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: DESIGN_SYSTEM.colors.background,
        color: DESIGN_SYSTEM.colors.secondary,
        fontSize: '14px',
      }}>
        ⏳ Loading team...
      </div>
    )
  }

  if (!team) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: DESIGN_SYSTEM.colors.background,
        color: DESIGN_SYSTEM.colors.accent,
        fontSize: '14px',
      }}>
        ❌ Team not found
      </div>
    )
  }

  const yearFounded = team.founded_year || 2000
  const established = new Date().getFullYear() - yearFounded

  return (
    <div style={{
      minHeight: '100vh',
      background: DESIGN_SYSTEM.colors.background,
      color: DESIGN_SYSTEM.colors.text,
    }}>
      {/* HERO SECTION - Team Colored */}
      <div style={{
        background: `linear-gradient(135deg, ${team.primary_color} 0%, ${team.secondary_color} 100%)`,
        padding: 'clamp(16px, 4vw, 24px)',
        paddingTop: 'clamp(20px, 5vw, 32px)',
        paddingBottom: 'clamp(32px, 6vw, 48px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Back Button */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: 'clamp(16px, 3vw, 24px)',
            padding: 'clamp(8px, 2vw, 12px) clamp(12px, 2vw, 16px)',
            background: 'rgba(0, 0, 0, 0.2)',
            color: DESIGN_SYSTEM.colors.text,
            border: 'none',
            borderRadius: DESIGN_SYSTEM.radius.md,
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 150ms ease-out',
            backdropFilter: 'blur(4px)',
            minHeight: '44px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
            e.currentTarget.style.transform = 'translateX(-4px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
            e.currentTarget.style.transform = 'translateX(0)'
          }}
        >
          <ChevronLeft size={20} />
          Back
        </Link>

        {/* Team Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(12px, 2vw, 16px)',
        }}>
          {/* Team Crest/Badge */}
          <div style={{
            width: 'clamp(80px, 20vw, 120px)',
            height: 'clamp(80px, 20vw, 120px)',
            background: 'rgba(0, 0, 0, 0.15)',
            borderRadius: DESIGN_SYSTEM.radius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(48px, 12vw, 72px)',
            fontWeight: 'bold',
            color: DESIGN_SYSTEM.colors.text,
            backdropFilter: 'blur(8px)',
            border: `2px solid rgba(255, 255, 255, 0.2)`,
          }}>
            🏆
          </div>

          {/* Team Name */}
          <div>
            <h1 style={{
              fontSize: 'clamp(28px, 8vw, 48px)',
              fontWeight: 900,
              margin: 0,
              color: DESIGN_SYSTEM.colors.text,
              lineHeight: '1.1',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}>
              {team.name}
            </h1>
            <p style={{
              fontSize: 'clamp(14px, 3vw, 18px)',
              color: DESIGN_SYSTEM.colors.text,
              margin: '8px 0 0 0',
              opacity: 0.95,
              fontWeight: '600',
            }}>
              {team.league}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(8px, 2vw, 12px)',
          marginTop: 'clamp(20px, 4vw, 28px)',
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: DESIGN_SYSTEM.radius.md,
            padding: 'clamp(12px, 2vw, 16px)',
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            border: `1px solid rgba(255, 255, 255, 0.1)`,
          }}>
            <div style={{
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: DESIGN_SYSTEM.colors.text,
              opacity: 0.8,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
            }}>
              Country
            </div>
            <div style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 'bold',
              color: DESIGN_SYSTEM.colors.text,
            }}>
              {team.country}
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: DESIGN_SYSTEM.radius.md,
            padding: 'clamp(12px, 2vw, 16px)',
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            border: `1px solid rgba(255, 255, 255, 0.1)`,
          }}>
            <div style={{
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: DESIGN_SYSTEM.colors.text,
              opacity: 0.8,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
            }}>
              Founded
            </div>
            <div style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 'bold',
              color: DESIGN_SYSTEM.colors.text,
            }}>
              {yearFounded}
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: DESIGN_SYSTEM.radius.md,
            padding: 'clamp(12px, 2vw, 16px)',
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            border: `1px solid rgba(255, 255, 255, 0.1)`,
          }}>
            <div style={{
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: DESIGN_SYSTEM.colors.text,
              opacity: 0.8,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
            }}>
              Years
            </div>
            <div style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 'bold',
              color: DESIGN_SYSTEM.colors.text,
            }}>
              {established}+
            </div>
          </div>
        </div>
      </div>

      {/* STADIUM SECTION */}
      <div style={{
        padding: 'clamp(16px, 4vw, 24px)',
        background: `linear-gradient(180deg, ${DESIGN_SYSTEM.colors.surface} 0%, ${DESIGN_SYSTEM.colors.surfaceLight} 100%)`,
        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border}`,
        marginBottom: 'clamp(20px, 4vw, 28px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <MapPin size={20} color={team.primary_color} />
          <span style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: DESIGN_SYSTEM.colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 'bold',
          }}>
            Home Ground
          </span>
        </div>
        <h3 style={{
          fontSize: 'clamp(18px, 4vw, 24px)',
          fontWeight: 'bold',
          margin: 0,
          color: DESIGN_SYSTEM.colors.text,
        }}>
          {team.stadium}
        </h3>
      </div>

      {/* SQUAD SECTION */}
      <div style={{
        padding: 'clamp(16px, 4vw, 24px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: 'clamp(16px, 3vw, 24px)',
        }}>
          <Users size={24} color={team.primary_color} />
          <h2 style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 'bold',
            margin: 0,
            color: DESIGN_SYSTEM.colors.text,
          }}>
            Squad ({players.length})
          </h2>
        </div>

        {players.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(24px, 4vw, 32px)',
            color: DESIGN_SYSTEM.colors.textSecondary,
          }}>
            No players added yet
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 90vw, 160px), 1fr))',
            gap: 'clamp(12px, 2vw, 16px)',
          }}>
            {players.map((player, idx) => (
              <div
                key={player.id}
                style={{
                  background: `linear-gradient(135deg, ${team.primary_color}15 0%, ${team.secondary_color}15 100%)`,
                  border: `1px solid ${team.primary_color}30`,
                  borderRadius: DESIGN_SYSTEM.radius.lg,
                  padding: 'clamp(12px, 2vw, 16px)',
                  textAlign: 'center',
                  animation: `slideUp 300ms ease-out ${idx * 50}ms both`,
                  transition: 'all 200ms ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = team.primary_color
                  e.currentTarget.style.boxShadow = `0 8px 20px ${team.primary_color}20`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = `${team.primary_color}30`
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Jersey Number */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: team.primary_color,
                  color: DESIGN_SYSTEM.colors.text,
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(20px, 4vw, 24px)',
                  fontWeight: 'bold',
                  margin: '0 auto clamp(8px, 2vw, 12px) auto',
                }}>
                  {player.jersey_number}
                </div>

                {/* Player Name */}
                <h4 style={{
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  fontWeight: 'bold',
                  margin: 0,
                  color: DESIGN_SYSTEM.colors.text,
                  lineHeight: '1.2',
                  marginBottom: '4px',
                }}>
                  {player.player_name}
                </h4>

                {/* Position */}
                <p style={{
                  fontSize: 'clamp(10px, 2vw, 11px)',
                  color: DESIGN_SYSTEM.colors.textSecondary,
                  margin: 0,
                  marginBottom: '4px',
                }}>
                  {player.position}
                </p>

                {/* Nationality */}
                <p style={{
                  fontSize: 'clamp(10px, 2vw, 11px)',
                  color: DESIGN_SYSTEM.colors.textSecondary,
                  margin: 0,
                }}>
                  {player.nationality}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WATCH SECTION */}
      <div style={{
        padding: 'clamp(16px, 4vw, 24px)',
        background: `linear-gradient(180deg, ${DESIGN_SYSTEM.colors.surface} 0%, ${DESIGN_SYSTEM.colors.surfaceLight} 100%)`,
        marginTop: 'clamp(20px, 4vw, 28px)',
        borderTop: `1px solid ${DESIGN_SYSTEM.colors.border}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: 'clamp(16px, 3vw, 24px)',
        }}>
          <Trophy size={24} color={team.primary_color} />
          <h2 style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 'bold',
            margin: 0,
            color: DESIGN_SYSTEM.colors.text,
          }}>
            Watch Together
          </h2>
        </div>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: 'clamp(14px, 2vw, 16px) clamp(28px, 5vw, 40px)',
            background: `linear-gradient(135deg, ${team.primary_color} 0%, ${team.secondary_color} 100%)`,
            color: DESIGN_SYSTEM.colors.text,
            border: 'none',
            borderRadius: DESIGN_SYSTEM.radius.lg,
            fontSize: 'clamp(13px, 3vw, 16px)',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'none',
            textTransform: 'uppercase',
            transition: 'all 200ms ease-out',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            letterSpacing: '1px',
            boxShadow: `0 8px 24px ${team.primary_color}30`,
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = `0 12px 32px ${team.primary_color}50`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = `0 8px 24px ${team.primary_color}30`
          }}
        >
          🔴 Find a Viewing Hub
        </Link>

        <p style={{
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          color: DESIGN_SYSTEM.colors.textSecondary,
          margin: 'clamp(12px, 2vw, 16px) 0 0 0',
          textAlign: 'center',
        }}>
          Join fans celebrating {team.name} matches live
        </p>
      </div>

      {/* TEAM COLORS SHOWCASE */}
      <div style={{
        padding: 'clamp(16px, 4vw, 24px)',
        marginTop: 'clamp(20px, 4vw, 28px)',
      }}>
        <h3 style={{
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 'bold',
          color: DESIGN_SYSTEM.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 'clamp(12px, 2vw, 16px)',
        }}>
          🎨 Team Colors
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(100px, 90vw, 120px), 1fr))',
          gap: 'clamp(8px, 2vw, 12px)',
        }}>
          <div style={{
            borderRadius: DESIGN_SYSTEM.radius.lg,
            overflow: 'hidden',
            minHeight: '80px',
          }}>
            <div style={{
              background: team.primary_color,
              height: '60px',
            }} />
            <div style={{
              background: DESIGN_SYSTEM.colors.surface,
              padding: '8px',
              fontSize: 'clamp(10px, 2vw, 11px)',
              color: DESIGN_SYSTEM.colors.textSecondary,
              textAlign: 'center',
            }}>
              Primary
              <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                {team.primary_color}
              </div>
            </div>
          </div>

          <div style={{
            borderRadius: DESIGN_SYSTEM.radius.lg,
            overflow: 'hidden',
            minHeight: '80px',
          }}>
            <div style={{
              background: team.secondary_color,
              height: '60px',
            }} />
            <div style={{
              background: DESIGN_SYSTEM.colors.surface,
              padding: '8px',
              fontSize: 'clamp(10px, 2vw, 11px)',
              color: DESIGN_SYSTEM.colors.textSecondary,
              textAlign: 'center',
            }}>
              Secondary
              <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                {team.secondary_color}
              </div>
            </div>
          </div>

          {team.accent_color && (
            <div style={{
              borderRadius: DESIGN_SYSTEM.radius.lg,
              overflow: 'hidden',
              minHeight: '80px',
            }}>
              <div style={{
                background: team.accent_color,
                height: '60px',
              }} />
              <div style={{
                background: DESIGN_SYSTEM.colors.surface,
                padding: '8px',
                fontSize: 'clamp(10px, 2vw, 11px)',
                color: DESIGN_SYSTEM.colors.textSecondary,
                textAlign: 'center',
              }}>
                Accent
                <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {team.accent_color}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}