import { createClient } from '@/utils/supabase/server'
import LiveMatchClient from './LiveMatchClient'
import { notFound } from 'next/navigation'

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const matchId = resolvedParams.id
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // For now, we will pass the raw matchId to the client. 
  // Later, we will fetch the actual team names (e.g., Brazil vs France) based on this ID.
  if (!matchId) return notFound()

  return (
    <LiveMatchClient 
      matchId={matchId} 
      userEmail={user?.email || 'fan@hub90.com'} 
    />
  )
}