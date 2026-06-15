import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// ✅ Use service role to bypass RLS for sensitive operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature')

    // 1. Cryptographically verify Paystack sent this
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest('hex')

    if (hash !== signature) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    console.log('📨 Webhook received:', event.event)

    // 2. Process successful payments
    if (event.event === 'charge.success') {
      const { amount, reference, metadata, customer } = event.data
      
      const amountInNGN = amount / 100
      const userId = metadata?.user_id
      const roomId = metadata?.roomId

      console.log(`💳 Processing charge.success`)
      console.log(`   Amount: ₦${amountInNGN}`)
      console.log(`   Reference: ${reference}`)
      console.log(`   User: ${userId}`)

      // ✅ FIX #1: Update wallets table (the source of truth)
      if (userId) {
        try {
          // Get current wallet balance
          const { data: wallet, error: fetchError } = await supabaseAdmin
            .from('wallets')
            .select('balance')
            .eq('user_id', userId)
            .single()

          if (!fetchError && wallet) {
            const currentBalance = wallet.balance || 0
            const newBalance = currentBalance + amountInNGN

            console.log(`💰 Wallet: ₦${currentBalance} → ₦${newBalance}`)

            const { error: updateError } = await supabaseAdmin
              .from('wallets')
              .update({
                balance: newBalance,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId)

            if (updateError) {
              console.error('❌ Failed to update wallet:', updateError)
            } else {
              console.log('✅ Wallet updated successfully')
            }
          } else {
            console.log('⚠️ Wallet not found for user, creating...')
            const { error: createError } = await supabaseAdmin
              .from('wallets')
              .insert({
                user_id: userId,
                balance: amountInNGN,
                currency: 'NGN'
              })

            if (createError) {
              console.error('❌ Failed to create wallet:', createError)
            } else {
              console.log('✅ Wallet created successfully')
            }
          }
        } catch (walletError) {
          console.error('❌ Error updating wallet:', walletError)
        }
      }

      // ✅ FIX #2: Record reaction (for UI purposes)
      try {
        const reactionType = amountInNGN >= 200 ? 'FLARE' : 'MEGAPHONE'

        const { error: reactionError } = await supabaseAdmin
          .from('fan_reactions')
          .insert({
            match_id: roomId || 0,
            reaction_type: reactionType,
            message: metadata?.custom_message || 'LETS GOOO!',
            amount_paid_ngn: amountInNGN,
            user_id: userId || null,
            created_at: new Date().toISOString()
          })

        if (reactionError) {
          console.error('⚠️ Failed to record reaction:', reactionError)
        } else {
          console.log('✅ Reaction recorded')
        }
      } catch (reactionError) {
        console.error('⚠️ Error recording reaction:', reactionError)
      }

      console.log('✅ Webhook processed successfully')
    }

    // Always return 200 so Paystack knows webhook was received
    return NextResponse.json({ received: true }, { status: 200 })

  } catch (err) {
    console.error('❌ Webhook error:', err)
    // Still return 200 to acknowledge receipt
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 200 })
  }
}