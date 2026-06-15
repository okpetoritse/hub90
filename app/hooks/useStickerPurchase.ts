import { useState, useCallback } from 'react'
import { useStickerStore } from '@/app/store/useStickerStore'
import { useHaptics } from './useHaptics'

export const useStickerPurchase = (userEmail: string) => {
  const [loading, setLoading] = useState(false)
  const { purchaseStickerPack } = useStickerStore()
  const { success, error: errorHaptic } = useHaptics()

  const purchaseSticker = useCallback(
    async (packId: string) => {
      if (!userEmail) {
        errorHaptic()
        return false
      }

      setLoading(true)
      try {
        await purchaseStickerPack(userEmail, packId)
        success()
        return true
      } catch (err) {
        errorHaptic()
        console.error('Purchase failed:', err)
        return false
      } finally {
        setLoading(false)
      }
    },
    [userEmail, purchaseStickerPack, success, errorHaptic]
  )

  return { purchaseSticker, loading }
}