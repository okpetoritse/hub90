import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


// We use the Service Role key here to bypass RLS and securely write to the ledger
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { reference, userId } = await req.json()

    // 1. Verify with Paystack Server-to-Server
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const paystackData = await paystackRes.json()

    // 2. Check if the payment actually succeeded
    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    const amountInNaira = paystackData.data.amount / 100

    // 3. Prevent Replay Attacks (Check if this exact reference was already credited)
    const { data: existingTx } = await supabaseAdmin
      .from('ledger_entries')
      .select('id')
      .eq('reference', reference)
      .single()

    if (existingTx) {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 })
    }

    // 4. Mint the money into the user's Supabase Ledger
    const { error: ledgerError } = await supabaseAdmin
      .from('ledger_entries')
      .insert({
        account_id: userId,
        amount: amountInNaira,
        transaction_type: 'DEPOSIT',
        reference: reference,
        description: 'Paystack Wallet Funding',
        transaction_group_id: crypto.randomUUID()
      })

    if (ledgerError) throw ledgerError

    return NextResponse.json({ success: true, amount: amountInNaira })

  } catch (error) {
    console.error("Deposit Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}