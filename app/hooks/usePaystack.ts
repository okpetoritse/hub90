'use client'

import { useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

declare global {
  interface Window {
    PaystackPop: any
  }
}

export function usePaystack() {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fundWallet = useCallback(async (amount: number, email: string) => {
    return new Promise<{success: boolean, newBalance: number, reference: string}>((resolve, reject) => {
      console.log('🎬 [1] Starting Paystack')
      
      if (!window.PaystackPop) {
        console.log('🎬 [2] Loading Paystack script')
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.async = true
        
        script.onload = () => {
          console.log('✅ [3] Script loaded')
          setTimeout(() => openPaystack(), 300)
        }
        
        script.onerror = () => {
          console.error('❌ [ERROR] Script load failed')
          reject(new Error('Paystack script failed'))
        }
        
        document.head.appendChild(script)
      } else {
        console.log('✅ [2] Script already loaded')
        openPaystack()
      }

      const openPaystack = async () => {
        try {
          console.log('🎬 [3] Opening modal')
          
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            throw new Error('Not authenticated')
          }

          const userId = user.id
          console.log('✅ [4] User ID:', userId)

          const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
            email: email,
            amount: amount * 100,
            ref: 'ref-' + Math.floor(Math.random() * 1000000000),
            currency: 'NGN',
            
            onClose: () => {
              console.log('⏹️ [5] User closed - but payment might have succeeded')
            },
            
            onSuccess: async (response: any) => {
              console.log('✅ [6] PAYSTACK SUCCESS CALLBACK FIRED!')
              console.log('✅ [7] Reference:', response.reference)
              
              // Immediately verify payment
              await verifyAndUpdate(userId, amount)
            }
          })

          handler.openIframe()
          console.log('✅ [5] Modal opened')

          // Safety verification after 3 seconds
          setTimeout(async () => {
            console.log('🔄 [6] Safety check - verifying payment...')
            await verifyAndUpdate(userId, amount)
          }, 3000)

        } catch (error: any) {
          console.error('❌ [ERROR in openPaystack]:', error.message)
          reject(error)
        }
      }

      const verifyAndUpdate = async (userId: string, amount: number) => {
        try {
          console.log('🔄 [7] Calling verify API...')
          console.log('   userId:', userId)
          console.log('   amount:', amount)

          const response = await fetch('/api/wallet/verify-payment', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: userId,
              amount: amount
            })
          })

          console.log('🔄 [8] Response status:', response.status)

          const data = await response.json()
          console.log('🔄 [9] Response data:', data)

          if (!response.ok) {
            console.error('❌ [10] API error:', data.error)
            reject(new Error(data.error))
            return
          }

          console.log('✅ [11] SUCCESS! New balance:', data.newBalance)
          localStorage.setItem('hub90_wallet_balance', data.newBalance.toString())

          resolve({
            success: true,
            newBalance: data.newBalance,
            reference: 'ref-success'
          })

        } catch (error: any) {
          console.error('❌ [ERROR in verifyAndUpdate]:', error.message)
          console.error('Full error:', error)
          reject(error)
        }
      }
    })
  }, [supabase])

  return { fundWallet }
}