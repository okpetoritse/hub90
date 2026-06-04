'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // In a production app, you'd return this error to the UI.
    console.error('Login Error:', error.message)
    return redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = email.split('@')[0] // Auto-generate a username from email

  // 1. Create the user in the secure Supabase Auth system
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    console.error('Signup Error:', authError.message)
    return redirect('/login?message=Could not create user')
  }

  // 2. Immediately inject them into our custom public 'users' table
  if (authData.user) {
    const { error: dbError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: email,
      username: username,
      role: 'fan'
    })
    
    if (dbError) console.error('Database Insert Error:', dbError.message)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}