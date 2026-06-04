import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, itemType, cost } = await req.json()

    // 1. Calculate the user's current exact balance
    const { data: ledger } = await supabaseAdmin
      .from('ledger_entries')
      .select('amount, transaction_type')
      .eq('account_id', userId)

    if (!ledger) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Sum deposits, subtract purchases
    const balance = ledger.reduce((acc, tx) => {
      return acc + (tx.transaction_type === 'DEPOSIT' ? tx.amount : -tx.amount)
    }, 0)

    // 2. The Bounce Check (Do they have enough NGN?)
    if (balance < cost) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 402 })
    }

    // 3. Mint the Deduction (Charge the account)
    // @ts-ignore - Bypassing local schema cache warnings
    const { error: insertError } = await supabaseAdmin
      .from('ledger_entries')
      .insert({
        account_id: userId,
        amount: -cost,
        transaction_type: 'PURCHASE',
        reference: `HUB90_TX_${crypto.randomUUID()}`,
        description: `${itemType} Activation`,
        transaction_group_id: crypto.randomUUID()
      })

    if (insertError) throw insertError

    return NextResponse.json({ success: true, newBalance: balance - cost })

  } catch (error) {
    console.error("Deduction Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}