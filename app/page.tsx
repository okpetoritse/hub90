'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { DESIGN_SYSTEM } from '@/app/styles/design-system'
import { Play, Trophy } from 'lucide-react'
import MatchTracker from '@/app/components/MatchTracker'
import TeamBrowser from '@/app/components/TeamBrowser'
import { usePaystack } from '@/app/hooks/usePaystack'
import { useWalletBalance } from '@/app/hooks/useWalletBalance'
import toast from 'react-hot-toast'

const CAROUSEL_IMAGES = [
  '/poster1.jpg',
  '/poster2.jpg',
  '/poster3.jpg',
]

export default function HomePage() {
  const [hubs, setHubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [showFundWallet, setShowFundWallet] = useState(false)
  const [fundAmount, setFundAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  const { fundWallet } = usePaystack()
  
  // Use the real-time wallet hook
  const { balance: walletBalance, user, updateBalanceOptimistic } = useWalletBalance()

  // Handle Paystack Payment - CLEAN & SIMPLE
  const handlePaystackPayment = async () => {
  if (!fundAmount || parseFloat(fundAmount) < 100) {
    toast.error('Minimum amount is ₦100')
    return
  }

  if (!user?.email) {
    toast.error('Please sign in first')
    return
  }

  setIsProcessing(true)
  const amount = parseFloat(fundAmount)
  const toastId = toast.loading('Opening payment...')

  try {
    console.log('💳 Payment initiated:', amount)

    // Call Paystack
    const result = await fundWallet(amount, user.email)
    
    console.log('🎉 Paystack hook resolved:', result)

    if (result?.success) {
      console.log('✅ Payment successful, new balance:', result.newBalance)

      // Update state
      updateBalanceOptimistic(result.newBalance)

      // ✅ CLOSE MODAL IMMEDIATELY
      setShowFundWallet(false)
      setFundAmount('')
      setIsProcessing(false)

      // Show success toast
      toast.success(`✅ Wallet funded! +₦${amount.toLocaleString()}`, { id: toastId })

      console.log('✅ All done!')
    } else {
      toast.error('Payment failed', { id: toastId })
      setIsProcessing(false)
    }
  } catch (error) {
    console.error('❌ Payment error:', error)

    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.log('Error message:', errorMsg)

    // Only show error if not cancelled
    if (!errorMsg.includes('cancelled')) {
      toast.error('Payment error: ' + errorMsg, { id: toastId })
    } else {
      console.log('User cancelled payment')
      toast.dismiss(toastId)
    }

    setIsProcessing(false)
  }
}

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
        setFadeIn(true)
      }, 500)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Fetch hubs
  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const { data } = await supabase
          .from('viewing_centers')
          .select('*')
          .eq('status', 'active')
          .limit(6)
        
        setHubs(data || [])
      } catch (error) {
        console.error('Failed to fetch hubs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHubs()
  }, [supabase])

  // ... REST OF YOUR JSX STAYS THE SAME ...

  return (
    <div style={{
      minHeight: '100vh',
      background: DESIGN_SYSTEM.colors.background,
      color: DESIGN_SYSTEM.colors.text,
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
      overflow: 'hidden',
    }}>
      {/* ============================================ */}
      {/* NAVIGATION */}
      {/* ============================================ */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(12px, 3vw, 20px) clamp(16px, 5vw, 32px)',
        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border}`,
        background: `linear-gradient(180deg, ${DESIGN_SYSTEM.colors.surface} 0%, transparent 100%)`,
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* HUB90 LOGO */}
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(8px, 2vw, 12px)',
          }}
        >
          <div style={{
            fontSize: 'clamp(28px, 6vw, 42px)',
            fontWeight: 900,
            background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 50%, ${DESIGN_SYSTEM.colors.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-2px',
            filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.2)',
            cursor: 'pointer',
            transition: 'all 200ms ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.6))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))'
          }}
          >
            ⚽ HUB90
          </div>
        </Link>

        {/* CENTER: Wallet */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 3vw, 20px)',
        }}>
          {user && (
            <button
              onClick={() => setShowFundWallet(true)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '2px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: DESIGN_SYSTEM.radius.md,
                transition: 'all 150ms ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `rgba(255, 215, 0, 0.1)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <div style={{
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                color: DESIGN_SYSTEM.colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600',
              }}>
                💰 Wallet
              </div>
              <div style={{
                fontSize: 'clamp(14px, 3vw, 18px)',
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.5px',
              }}>
                ₦ {walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </button>
          )}
        </div>

        {/* RIGHT: Auth Buttons */}
        <div style={{
          display: 'flex',
          gap: 'clamp(8px, 2vw, 16px)',
          alignItems: 'center',
        }}>
          {user ? (
            <>
              <Link
                href="/venue/dashboard"
                style={{
                  padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)',
                  background: DESIGN_SYSTEM.colors.primary,
                  color: DESIGN_SYSTEM.colors.text,
                  border: 'none',
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  fontSize: 'clamp(11px, 2.5vw, 12px)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  transition: 'all 150ms ease-out',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  letterSpacing: '0.5px',
                }}
              >
                My Venues
              </Link>
              <button
                onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                style={{
                  padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)',
                  background: DESIGN_SYSTEM.colors.accent,
                  color: DESIGN_SYSTEM.colors.text,
                  border: 'none',
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  fontSize: 'clamp(11px, 2.5vw, 12px)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 150ms ease-out',
                  minHeight: '44px',
                  letterSpacing: '0.5px',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{
                padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)',
                background: DESIGN_SYSTEM.colors.secondary,
                color: DESIGN_SYSTEM.colors.dark,
                border: 'none',
                borderRadius: DESIGN_SYSTEM.radius.md,
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                fontWeight: 'bold',
                cursor: 'pointer',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'all 150ms ease-out',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '0.5px',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* ============================================ */}
      {/* HERO CAROUSEL SECTION */}
      {/* ============================================ */}
      <section style={{
        position: 'relative',
        height: 'clamp(300px, 60vh, 600px)',
        overflow: 'hidden',
        borderBottom: `3px solid ${DESIGN_SYSTEM.colors.secondary}`,
      }}>
        {CAROUSEL_IMAGES.map((img, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url('${img}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: idx === currentImageIndex && fadeIn ? 1 : 0,
              transition: 'opacity 500ms ease-in-out',
              zIndex: idx === currentImageIndex ? 10 : 0,
            }}
          />
        ))}

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, rgba(10, 14, 39, 0.7) 0%, rgba(26, 77, 127, 0.5) 50%, rgba(255, 26, 26, 0.3) 100%)`,
          zIndex: 15,
        }} />

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)`,
          animation: 'glow 3s ease-in-out infinite',
          zIndex: 12,
        }} />

        <div
          style={{
            position: 'relative',
            zIndex: 20,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'clamp(20px, 5vw, 40px)',
          }}
        >
          <div style={{
            animation: 'slideDown 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <h1 style={{
              fontSize: 'clamp(36px, 10vw, 72px)',
              fontWeight: 900,
              marginBottom: 'clamp(12px, 2vw, 20px)',
              background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 50%, ${DESIGN_SYSTEM.colors.accent} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-2px',
              textShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.2))',
            }}>
              WORLD CUP 2026
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 4vw, 24px)',
              color: DESIGN_SYSTEM.colors.secondary,
              marginBottom: 'clamp(20px, 3vw, 32px)',
              fontWeight: '600',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.5px',
            }}>
              USA • MEXICO • CANADA 🌍
            </p>

            <p style={{
              fontSize: 'clamp(14px, 3.5vw, 20px)',
              color: DESIGN_SYSTEM.colors.text,
              marginBottom: 'clamp(24px, 4vw, 40px)',
              maxWidth: '600px',
              lineHeight: '1.6',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            }}>
              Join live viewing communities. Watch matches together. Experience the roar! 🔥
            </p>

            <div style={{
              display: 'flex',
              gap: 'clamp(12px, 3vw, 20px)',
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'fadeInUp 800ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms both',
            }}>
              <Link
                href={user ? '/venue/create' : '/login'}
                style={{
                  padding: 'clamp(14px, 2vw, 16px) clamp(28px, 5vw, 40px)',
                  background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 100%)`,
                  color: DESIGN_SYSTEM.colors.dark,
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
                  gap: '8px',
                  letterSpacing: '1px',
                  boxShadow: `0 8px 24px rgba(255, 215, 0, 0.3)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = `0 12px 32px rgba(255, 215, 0, 0.5)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(255, 215, 0, 0.3)`
                }}
              >
                <Trophy size={20} />
                {user ? 'Create Your Hub' : 'Join Now'}
              </Link>

              <button
                onClick={() => {
                  document.getElementById('hubs-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
                style={{
                  padding: 'clamp(14px, 2vw, 16px) clamp(28px, 5vw, 40px)',
                  background: `rgba(255, 255, 255, 0.1)`,
                  color: DESIGN_SYSTEM.colors.secondary,
                  border: `2px solid ${DESIGN_SYSTEM.colors.secondary}`,
                  borderRadius: DESIGN_SYSTEM.radius.lg,
                  fontSize: 'clamp(13px, 3vw, 16px)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 200ms ease-out',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '1px',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `rgba(255, 215, 0, 0.2)`
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `rgba(255, 255, 255, 0.1)`
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Play size={20} />
                Explore Hubs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* MATCH TRACKER SECTION */}
      {/* ============================================ */}
      <MatchTracker />

      {/* ============================================ */}
      {/* TEAMS SECTION */}
      {/* ============================================ */}
      <section
        id="teams-section"
        style={{
          padding: 'clamp(32px, 6vw, 56px) clamp(16px, 5vw, 32px)',
          maxWidth: '1400px',
          margin: '0 auto',
          borderTop: `2px solid ${DESIGN_SYSTEM.colors.secondary}`,
        }}
      >
        <div style={{
          marginBottom: 'clamp(20px, 3vw, 32px)',
          animation: 'slideUp 600ms ease-out',
        }}>
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 40px)',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, ${DESIGN_SYSTEM.colors.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ⚽ Europe Top 5 Leagues
          </h2>
          <p style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: DESIGN_SYSTEM.colors.textSecondary,
          }}>
            Pick your favorite team and join the community
          </p>
        </div>

        <TeamBrowser />
      </section>

      {/* ============================================ */}
      {/* LIVE HUBS SECTION */}
      {/* ============================================ */}
      <section
        id="hubs-section"
        style={{
          padding: 'clamp(32px, 6vw, 56px) clamp(16px, 5vw, 32px)',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div style={{
          marginBottom: 'clamp(20px, 3vw, 32px)',
          animation: 'slideUp 600ms ease-out',
        }}>
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 40px)',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, ${DESIGN_SYSTEM.colors.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            🎯 Live Viewing Centers
          </h2>
          <p style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: DESIGN_SYSTEM.colors.textSecondary,
          }}>
            {hubs.length > 0
              ? `${hubs.length} active hubs · Join the energy!`
              : 'Loading hubs...'}
          </p>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(32px, 5vw, 48px)',
            color: DESIGN_SYSTEM.colors.textSecondary,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            ⏳ Finding the best hubs...
          </div>
        ) : hubs.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 90vw, 380px), 1fr))',
            gap: 'clamp(16px, 3vw, 24px)',
          }}>
            {hubs.map((hub, idx) => (
              <Link
                key={hub.id}
                href={`/hub/${hub.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  animation: `slideUp 600ms ease-out ${idx * 100}ms both`,
                }}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.surface} 0%, ${DESIGN_SYSTEM.colors.surfaceLight} 100%)`,
                    border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                    borderRadius: DESIGN_SYSTEM.radius.lg,
                    padding: 'clamp(16px, 3vw, 24px)',
                    cursor: 'pointer',
                    transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                    e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.secondary
                    e.currentTarget.style.boxShadow = `0 12px 32px rgba(255, 215, 0, 0.15), 0 0 20px rgba(255, 215, 0, 0.1)`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: `radial-gradient(circle at top right, rgba(255, 215, 0, 0.1) 0%, transparent 60%)`,
                      pointerEvents: 'none',
                    }}
                  />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{
                      fontSize: 'clamp(16px, 3vw, 20px)',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                      color: DESIGN_SYSTEM.colors.secondary,
                    }}>
                      ⚽ {hub.venue_name}
                    </h3>

                    <p style={{
                      fontSize: 'clamp(11px, 2.5vw, 12px)',
                      color: DESIGN_SYSTEM.colors.textSecondary,
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      📍 {hub.location || 'Online'}
                    </p>

                    {hub.description && (
                      <p style={{
                        fontSize: 'clamp(12px, 2.5vw, 13px)',
                        color: DESIGN_SYSTEM.colors.textSecondary,
                        marginBottom: '12px',
                        lineHeight: '1.4',
                      }}>
                        {hub.description.substring(0, 80)}...
                      </p>
                    )}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: 'clamp(11px, 2.5vw, 12px)',
                    marginBottom: '12px',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    <div style={{
                      background: `rgba(255, 215, 0, 0.1)`,
                      padding: '8px',
                      borderRadius: DESIGN_SYSTEM.radius.md,
                      textAlign: 'center',
                      backdropFilter: 'blur(4px)',
                    }}>
                      <div style={{ fontWeight: 'bold', color: DESIGN_SYSTEM.colors.secondary }}>
                        ⭐ {hub.rating?.toFixed(1) || '—'}
                      </div>
                      <div style={{ color: DESIGN_SYSTEM.colors.textSecondary, fontSize: '10px' }}>
                        Rating
                      </div>
                    </div>
                    <div style={{
                      background: `rgba(255, 215, 0, 0.1)`,
                      padding: '8px',
                      borderRadius: DESIGN_SYSTEM.radius.md,
                      textAlign: 'center',
                      backdropFilter: 'blur(4px)',
                    }}>
                      <div style={{ fontWeight: 'bold', color: DESIGN_SYSTEM.colors.secondary }}>
                        👥 {hub.followers_count || 0}
                      </div>
                      <div style={{ color: DESIGN_SYSTEM.colors.textSecondary, fontSize: '10px' }}>
                        Fans
                      </div>
                    </div>
                  </div>

                  <button
                    style={{
                      padding: '12px 16px',
                      background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 100%)`,
                      color: DESIGN_SYSTEM.colors.dark,
                      border: 'none',
                      borderRadius: DESIGN_SYSTEM.radius.md,
                      fontSize: 'clamp(11px, 2.5vw, 12px)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      minHeight: '44px',
                      transition: 'all 150ms ease-out',
                      width: '100%',
                      position: 'relative',
                      zIndex: 1,
                      letterSpacing: '0.5px',
                    }}
                  >
                    🔴 Join Live
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(32px, 5vw, 48px)',
            color: DESIGN_SYSTEM.colors.textSecondary,
          }}>
            <p>No active hubs yet. Be the first to create one! 🎯</p>
          </div>
        )}
      </section>

      {/* ============================================ */}
      {/* FUND WALLET MODAL */}
      {/* ============================================ */}
      {showFundWallet && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowFundWallet(false)}
        >
          <form
            style={{
              background: DESIGN_SYSTEM.colors.surface,
              borderRadius: DESIGN_SYSTEM.radius.lg,
              padding: 'clamp(24px, 4vw, 40px)',
              maxWidth: '500px',
              width: '90%',
              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
              animation: 'slideUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: 'bold',
                margin: 0,
                color: DESIGN_SYSTEM.colors.secondary,
              }}>
                💰 Fund Wallet
              </h2>
              <button
                type="button"
                onClick={() => setShowFundWallet(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              marginBottom: '20px',
            }}>
              <label style={{
                display: 'block',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                fontWeight: '600',
                marginBottom: '8px',
                color: DESIGN_SYSTEM.colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Enter Amount (NGN)
              </label>
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="5000"
                min="100"
                max="500000"
                style={{
                  width: '100%',
                  padding: 'clamp(12px, 2vw, 16px)',
                  background: DESIGN_SYSTEM.colors.surfaceLight,
                  border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  color: DESIGN_SYSTEM.colors.text,
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontFamily: 'inherit',
                  transition: 'all 150ms ease-out',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.secondary
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(255, 215, 0, 0.1)`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <p style={{
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                color: DESIGN_SYSTEM.colors.textSecondary,
                margin: '8px 0 0 0',
              }}>
                Minimum: ₦100 • Maximum: ₦500,000
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
              <button
                type="button"
                onClick={() => setShowFundWallet(false)}
                style={{
                  flex: 1,
                  padding: 'clamp(12px, 2vw, 14px)',
                  background: DESIGN_SYSTEM.colors.surfaceLight,
                  color: DESIGN_SYSTEM.colors.text,
                  border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 150ms ease-out',
                  minHeight: '44px',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePaystackPayment}
                disabled={!fundAmount || isProcessing}
                style={{
                  flex: 1,
                  padding: 'clamp(12px, 2vw, 14px)',
                  background: fundAmount && !isProcessing
                    ? `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.secondary} 0%, #ffed4e 100%)`
                    : DESIGN_SYSTEM.colors.surfaceLight,
                  color: fundAmount && !isProcessing
                    ? DESIGN_SYSTEM.colors.dark
                    : DESIGN_SYSTEM.colors.textSecondary,
                  border: 'none',
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  fontWeight: 'bold',
                  cursor: fundAmount && !isProcessing ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase',
                  transition: 'all 150ms ease-out',
                  minHeight: '44px',
                }}
              >
                {isProcessing ? '⏳ Processing...' : '💳 Pay with Paystack'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer style={{
        marginTop: 'clamp(32px, 6vw, 48px)',
        padding: 'clamp(24px, 4vw, 36px)',
        borderTop: `1px solid ${DESIGN_SYSTEM.colors.border}`,
        textAlign: 'center',
        color: DESIGN_SYSTEM.colors.textSecondary,
        fontSize: 'clamp(11px, 2.5vw, 12px)',
        background: `linear-gradient(180deg, transparent 0%, ${DESIGN_SYSTEM.colors.surface} 100%)`,
      }}>
        <p style={{ marginBottom: '8px' }}>© 2026 HUB90 • World Cup Fan Communities</p>
        <p>Built for Africa 🌍 • Watch. Celebrate. Win. 🏆</p>
      </footer>

      {/* ============================================ */}
      {/* STYLES */}
      {/* ============================================ */}
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}