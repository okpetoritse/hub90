import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// ✅ FIX: Use service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, itemType, cost } = await request.json()

    if (!userId || !itemType || !cost) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`💳 Deducting ₦${cost} from user ${userId} for ${itemType}`)

    // Step 1: Get current wallet balance from wallets table
    const { data: wallet, error: fetchError } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Fetch wallet error:', fetchError)
      return NextResponse.json(
        { error: 'Wallet not found. Please fund your wallet first.' },
        { status: 404 }
      )
    }

    const currentBalance = wallet?.balance || 0
    console.log(`Current balance: ₦${currentBalance}`)

    // Step 2: Check if user has enough balance
    if (currentBalance < cost) {
      console.error(`Insufficient balance: ₦${currentBalance} < ₦${cost}`)
      return NextResponse.json(
        { error: `Insufficient balance. You have ₦${currentBalance}, but need ₦${cost}` },
        { status: 402 }
      )
    }

    // Step 3: Deduct from wallet
    const newBalance = currentBalance - cost
    console.log(`New balance after deduction: ₦${newBalance}`)

    const { error: updateError } = await supabaseAdmin
      .from('wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Update wallet error:', updateError)
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully deducted ₦${cost}`)

    return NextResponse.json({
      success: true,
      newBalance,
      message: `${itemType} activated! Balance: ₦${newBalance}`
    })

  } catch (error) {
    console.error('Deduct error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}