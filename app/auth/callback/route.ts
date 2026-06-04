import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // Attempt to securely exchange the code
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      // If Next.js double-fired and the code is "used", check if the first fire actually worked
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // The user is securely logged in. Let them pass.
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      // If there's no session and it failed, bounce them to login
      return NextResponse.redirect(`${origin}/login?message=Authentication failed. Please try again.`)
    }

    // Success on the first execution
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Fallback if no code is present
  return NextResponse.redirect(`${origin}/login`)
}