'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { DESIGN_SYSTEM } from '@/app/styles/design-system'
import { ChevronRight } from 'lucide-react'

interface Team {
  id: number
  name: string
  league: string
  country: string
  logo_url: string
  crest_url: string
  primary_color: string
  secondary_color: string
  accent_color: string
  stadium: string
}

export default function TeamBrowser() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeague, setSelectedLeague] = useState<string>('All')
  const supabase = createClient()

  const leagues = [
    'All',
    'Premier League',
    'La Liga',
    'Serie A',
    'Bundesliga',
    'Ligue 1'
  ]

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Import the service
        const { fetchAllTeams, getAPIStatus } = await import('@/app/lib/football-api')
        
        console.log('🏈 ' + getAPIStatus())
        
        const data = await fetchAllTeams()
        setTeams(data as unknown as Team[])
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  const filteredTeams = selectedLeague === 'All'
    ? teams
    : teams.filter(t => t.league === selectedLeague)

  return (
    <div style={{
      padding: 'clamp(16px, 4vw, 24px)',
    }}>
      {/* League Filter */}
      <div style={{
        marginBottom: 'clamp(20px, 4vw, 28px)',
      }}>
        <h3 style={{
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 'bold',
          color: DESIGN_SYSTEM.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
        }}>
          🏆 Select League
        </h3>
        <div style={{
          display: 'flex',
          gap: 'clamp(6px, 2vw, 10px)',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollBehavior: 'smooth',
        }}>
          {leagues.map(league => (
            <button
              key={league}
              onClick={() => setSelectedLeague(league)}
              style={{
                padding: 'clamp(8px, 2vw, 12px) clamp(12px, 2vw, 16px)',
                background: selectedLeague === league
                  ? `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 100%)`
                  : DESIGN_SYSTEM.colors.surfaceLight,
                color: selectedLeague === league
                  ? DESIGN_SYSTEM.colors.dark
                  : DESIGN_SYSTEM.colors.text,
                border: `1px solid ${
                  selectedLeague === league
                    ? DESIGN_SYSTEM.colors.secondary
                    : DESIGN_SYSTEM.colors.border
                }`,
                borderRadius: DESIGN_SYSTEM.radius.md,
                fontSize: 'clamp(11px, 2vw, 12px)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 150ms ease-out',
                whiteSpace: 'nowrap',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {league}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: 'clamp(32px, 5vw, 48px)',
          color: DESIGN_SYSTEM.colors.textSecondary,
        }}>
          ⏳ Loading teams...
        </div>
      ) : filteredTeams.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'clamp(32px, 5vw, 48px)',
          color: DESIGN_SYSTEM.colors.textSecondary,
        }}>
          No teams found
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(150px, 90vw, 200px), 1fr))',
          gap: 'clamp(12px, 2vw, 16px)',
        }}>
          {filteredTeams.map((team, idx) => (
            <Link
              key={team.id}
              href={`/team/${team.id}`}
              style={{
                textDecoration: 'none',
                animation: `slideUp 300ms ease-out ${idx * 50}ms both`,
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${team.primary_color}20 0%, ${team.secondary_color}20 100%)`,
                  border: `2px solid ${team.primary_color}40`,
                  borderRadius: DESIGN_SYSTEM.radius.lg,
                  padding: 'clamp(12px, 2vw, 16px)',
                  cursor: 'pointer',
                  transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)'
                  e.currentTarget.style.borderColor = team.primary_color
                  e.currentTarget.style.boxShadow = `0 12px 28px ${team.primary_color}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.borderColor = `${team.primary_color}40`
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Team Crest */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  marginBottom: '8px',
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  background: `${team.primary_color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  border: `2px solid ${team.primary_color}30`,
                }}>
                  🏆
                </div>

                {/* Team Name */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '8px',
                }}>
                  <h4 style={{
                    fontSize: 'clamp(13px, 2.5vw, 15px)',
                    fontWeight: 'bold',
                    margin: 0,
                    color: DESIGN_SYSTEM.colors.text,
                    lineHeight: '1.2',
                  }}>
                    {team.name}
                  </h4>
                  <p style={{
                    fontSize: 'clamp(10px, 2vw, 11px)',
                    color: DESIGN_SYSTEM.colors.textSecondary,
                    margin: '4px 0 0 0',
                  }}>
                    {team.league}
                  </p>
                </div>

                {/* Team Colors */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  width: '100%',
                  marginBottom: '8px',
                }}>
                  <div
                    style={{
                      flex: 1,
                      height: '8px',
                      background: team.primary_color,
                      borderRadius: '2px',
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      height: '8px',
                      background: team.secondary_color,
                      borderRadius: '2px',
                    }}
                  />
                </div>

                {/* View Hub Link */}
                <div style={{
                  width: '100%',
                  padding: '8px',
                  background: `${team.primary_color}20`,
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: 'clamp(11px, 2vw, 12px)',
                  fontWeight: '600',
                  color: team.primary_color,
                }}>
                  View Hub
                  <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

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