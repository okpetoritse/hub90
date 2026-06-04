'use client'

import { useState } from 'react'
import { usePaystackPayment } from 'react-paystack'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface DepositModalProps {
  userEmail: string;
  userId: string;
  onClose: () => void;
}

export default function DepositModal({ userEmail, userId, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState<number | ''>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter() // 🚨 INITIALIZE ROUTER

  const config = {
    reference: `HUB90_${new Date().getTime()}`,
    email: userEmail,
    amount: (Number(amount) || 0) * 100, 
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    currency: 'NGN',
  }

  const initializePayment = usePaystackPayment(config)

  const onSuccess = async (reference: any) => {
    setIsProcessing(true)
    // 1. Fire a loading toast so they know we are verifying
    const toastId = toast.loading("Verifying transaction on the blockchain...")

    try {
      const res = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reference: reference.reference,
          userId: userId
        })
      })

      if (res.ok) {
        // 2. Change the loading toast to a success toast!
        toast.success("Deposit Successful! Wallet credited.", { id: toastId })
        
        // 3. Silently refresh the server data (updates nav bar balance without a flash)
        router.refresh() 
        
        // 4. Close the modal smoothly after 1.5 seconds so they can read the toast
        setTimeout(() => {
          onClose()
        }, 1500)

      } else {
        toast.error("Payment verification failed.", { id: toastId })
      }
    } catch (error) {
      console.error("Verification Error:", error)
      toast.error("A network error occurred.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const onClosePaystack = () => {
    toast("Transaction cancelled.", { icon: '⚠️' })
  }

  // ... (Keep the rest of your UI return block exactly the same) ...
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0a1a10] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white font-bold">X</button>
        
        <h2 className="text-xl font-black uppercase tracking-widest text-white mb-1">Fund Wallet</h2>
        <p className="text-xs text-gray-400 mb-6 font-bold uppercase">Enter amount in NGN</p>

        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-wc-gold font-black">₦</span>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-mono text-lg focus:outline-none focus:border-electricLime transition-colors"
            placeholder="5000"
          />
        </div>

        <button 
          onClick={() => {
            if (Number(amount) >= 100) {
              initializePayment({ onSuccess, onClose: onClosePaystack })
            } else {
              alert("Minimum deposit is ₦100")
            }
          }}
          disabled={isProcessing}
          className="w-full bg-electricLime hover:bg-white text-black font-black uppercase tracking-widest py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Verifying...' : 'Pay with Paystack'}
        </button>
      </div>
    </div>
  )
}