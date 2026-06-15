import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('📨 [API] Verify endpoint called')
    
    const body = await request.json()
    const { userId, amount } = body

    console.log('📨 [API] Received:', { userId, amount })

    if (!userId || !amount) {
      console.error('📨 [API] Missing userId or amount')
      return NextResponse.json(
        { error: 'Missing userId or amount' },
        { status: 400 }
      )
    }

    // Step 1: Get current wallet
    console.log('📨 [API] Getting wallet...')
    const { data: wallet, error: fetchError } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('📨 [API] Fetch error:', fetchError)
      
      // Create wallet if doesn't exist
      console.log('📨 [API] Creating wallet with balance:', amount)
      const { error: createError } = await supabaseAdmin
        .from('wallets')
        .insert({
          user_id: userId,
          balance: amount,
          currency: 'NGN'
        })

      if (createError) {
        console.error('📨 [API] Create error:', createError)
        return NextResponse.json(
          { error: 'Failed to create wallet' },
          { status: 500 }
        )
      }

      console.log('📨 [API] Wallet created successfully')
      return NextResponse.json({
        success: true,
        newBalance: amount
      })
    }

    // Step 2: Update wallet with new balance
    const currentBalance = wallet?.balance || 0
    const newBalance = currentBalance + amount

    console.log(`📨 [API] Updating balance: ${currentBalance} + ${amount} = ${newBalance}`)

    const { error: updateError } = await supabaseAdmin
      .from('wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('📨 [API] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update wallet' },
        { status: 500 }
      )
    }

    console.log('📨 [API] SUCCESS! Balance updated to:', newBalance)

    return NextResponse.json({
      success: true,
      newBalance: newBalance
    })

  } catch (error: any) {
    console.error('📨 [API] Exception:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}