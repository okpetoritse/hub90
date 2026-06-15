'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useWalletBalance() {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // ✅ FIX #1: Use useRef to keep supabase stable across renders
  // This prevents subscription from being recreated every render
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  // Fetch wallet once on mount
  const fetchWallet = useCallback(async () => {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      console.log('❌ No user authenticated')
      setLoading(false)
      return
    }

    setUser(currentUser)
    console.log('👤 User authenticated:', currentUser.id)

    // Step 1: Ensure wallet exists (via server endpoint)
    try {
      const res = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      })
      const data = await res.json()
      if (data.created) {
        console.log('📝 New wallet created')
      } else if (data.success) {
        console.log('✅ Wallet already exists')
      }
    } catch (err) {
      console.error('⚠️ Error ensuring wallet exists:', err)
    }

    // Step 2: Fetch balance
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', currentUser.id)
      .single()

    if (error) {
      console.error('Wallet fetch error:', error)
      setBalance(0)
    } else {
      const newBalance = wallet?.balance || 0
      console.log('✅ Wallet fetched:', newBalance)
      setBalance(newBalance)
      localStorage.setItem('hub90_wallet_balance', newBalance.toString())
    }
  } catch (err) {
    console.error('Error fetching wallet:', err)
    setBalance(0)
  } finally {
    setLoading(false)
  }
}, [supabase])

  // Initial fetch on mount
  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  // ✅ FIX #2: Subscribe to real-time wallet updates
  // supabase is now stable (useRef), so subscription stays active
  useEffect(() => {
    if (!user?.id) {
      console.log('⏳ Waiting for user to authenticate...')
      return
    }

    console.log('🔔 Setting up wallet subscription for user:', user.id)
    
    let isActive = true
    let subscription: any = null

    const setupSubscription = async () => {
      try {
        // Create unique channel to avoid conflicts
        const channelName = `wallet-${user.id}-${Date.now()}`
        
        subscription = supabase
          .channel(channelName, {
            config: {
              broadcast: { self: true }
            }
          })
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'wallets',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (!isActive) return
              
              console.log('💰 Real-time wallet update received:', payload.new)
              const newBalance = payload.new?.balance || 0
              setBalance(newBalance)
              localStorage.setItem('hub90_wallet_balance', newBalance.toString())
            }
          )
          .subscribe((status) => {
            console.log(`🔗 Subscription status: ${status}`)
            if (status === 'SUBSCRIBED') {
              console.log('✅ Successfully subscribed to wallet changes')
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Channel error in subscription')
            }
          })
      } catch (error) {
        console.error('❌ Error setting up subscription:', error)
      }
    }

    setupSubscription()

    // Cleanup on unmount or user change
    return () => {
      console.log('🔕 Cleaning up wallet subscription')
      isActive = false
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [user?.id, supabase])

  // Manual refresh function
  const refreshWallet = useCallback(async () => {
    console.log('🔄 Manually refreshing wallet...')
    await fetchWallet()
  }, [fetchWallet])

  // Optimistic update for instant UI feedback
  const updateBalanceOptimistic = useCallback((newBalance: number) => {
    console.log('⚡ Optimistic update:', newBalance)
    setBalance(newBalance)
    localStorage.setItem('hub90_wallet_balance', newBalance.toString())
  }, [])

  return {
    balance,
    loading,
    user,
    refreshWallet,
    updateBalanceOptimistic
  }
}