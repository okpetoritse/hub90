'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function submitStake(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Verify the user is securely logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("You must be logged in to the Stadium to stake tokens.")
  }

  // 2. Extract the data from the buttons they clicked
  const tribunalId = formData.get('tribunal_id') as string
  const prediction = formData.get('prediction') as string // Will be 'FOUL' or 'DIVE'
  const stakeAmount = 50.00 // Setting a fixed NGN 50 entry stake for now

  // 3. Execute the unbreakable SQL function we just created
  const { error: rpcError } = await supabase.rpc('place_var_stake', {
    p_user_id: user.id,
    p_tribunal_id: tribunalId,
    p_amount: stakeAmount,
    p_prediction: prediction
  })

  if (rpcError) {
    console.error("Financial Transaction Failed:", rpcError.message)
    throw new Error("Failed to process stake. Your tokens are safe.")
  }

  // 4. Force the Next.js cache to clear so the user instantly sees the UI update
  revalidatePath('/', 'layout')
}