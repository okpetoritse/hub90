'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// 🚨 Force Next.js to skip Server-Side Rendering for this component 🚨
const DepositModal = dynamic(() => import('./DepositModal'), { ssr: false })

interface WalletButtonProps {
  balance: number;
  username: string;
  userId: string;
  userEmail: string;
}

export default function WalletButton({ balance, username, userId, userEmail }: WalletButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        className="flex items-center gap-4 hover:opacity-80 transition-opacity text-left"
      >
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Wallet</span>
          <span className="font-mono text-electricLime font-black">{balance.toFixed(2)} NGN</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fireCoral to-electricLime p-[2px]">
          <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs font-bold uppercase text-white">
            {username.substring(0, 2)}
          </div>
        </div>
      </button>

      {showModal && (
        <DepositModal 
          userEmail={userEmail} 
          userId={userId} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  )
}