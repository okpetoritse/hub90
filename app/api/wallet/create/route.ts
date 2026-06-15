import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    console.log('📝 Creating wallet for user:', userId)

    // Check if wallet already exists
    const { data: existing } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      console.log('✅ Wallet already exists')
      return NextResponse.json({ success: true, created: false })
    }

    // Create wallet
    const { error: insertError } = await supabaseAdmin
      .from('wallets')
      .insert({
        user_id: userId,
        balance: 0,
        currency: 'NGN'
      })

    if (insertError) {
      console.error('❌ Create wallet error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create wallet' },
        { status: 500 }
      )
    }

    console.log('✅ Wallet created successfully')
    return NextResponse.json({ success: true, created: true })

  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}