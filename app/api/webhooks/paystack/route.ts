import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// We use the Service Role Key here to securely bypass RLS for paid server inserts
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
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    // 2. Process successful payments
    if (event.event === 'charge.success') {
      const { amount, metadata, customer } = event.data
      
      // We divide by 100 because Paystack sends values in Kobo
      const amountInNGN = amount / 100
      const reactionType = amountInNGN >= 200 ? 'FLARE' : 'MEGAPHONE'

      // 3. Inject the chaos directly into the realtime database
      await supabaseAdmin.from('fan_reactions').insert({
        match_id: metadata.roomId || 0, // Fallback if not passed
        reaction_type: reactionType,
        message: metadata.custom_message || 'LETS GOOO!',
        amount_paid_ngn: amountInNGN,
        user_id: metadata.user_id || null 
      })
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}