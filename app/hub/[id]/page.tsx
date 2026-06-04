import { createClient } from '@/utils/supabase/server'
import MatchRoomClient from './MatchRoomClient'
import { notFound } from 'next/navigation'

export default async function HubPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: hub } = await supabase
    .from('viewing_centers')
    .select('venue_name')
    .eq('id', resolvedParams.id)
    .single()

  if (!hub) return notFound()

  return (
    <MatchRoomClient 
      roomId={resolvedParams.id}
      venueName={hub.venue_name} 
      userEmail={user?.email || 'fan@hub90.com'} 
    />
  )
}