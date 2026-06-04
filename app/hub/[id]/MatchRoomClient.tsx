'use client'

import { useEffect, useState, useRef } from 'react'
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant, useTracks, useTrackVolume } from '@livekit/components-react'
import '@livekit/components-styles'
import { Track, LocalAudioTrack } from 'livekit-client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import { useAudioStore } from '../../store/useAudioStore'
import HapticVisualizer from '../../components/HapticVisualizer'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const DigitalChaosPanel = dynamic(() => import('../../components/DigitalChaosPanel'), { ssr: false })

const STICKERS = [
  { id: 'mourinho', url: 'https://media.tenor.com/2bA6vK-RFEUAAAAC/mourinho-shush.gif', icon: '🤫' },
  { id: 'pep', url: 'https://media.tenor.com/fL-B-cE922MAAAAC/pep-guardiola-water.gif', icon: '💧' },
  { id: 'siuuu', url: 'https://media.tenor.com/1G8hD5K_Bw8AAAAC/cr7-cristiano-ronaldo.gif', icon: '🐐' },
  { id: 'klopp', url: 'https://media.tenor.com/264pE64VnU4AAAAC/klopp-smile.gif', icon: '😁' }
]

export default function MatchRoomClient({ roomId, venueName, userEmail }: { roomId: string, venueName: string, userEmail: string }) {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [username, setUsername] = useState("")
  const [chat, setChat] = useState<{ id: string, user: string, text: string, type: string }[]>([])
  const [freeChatInput, setFreeChatInput] = useState("")
  const [showStickers, setShowStickers] = useState(false)
  const [activeChaos, setActiveChaos] = useState<{ type: string, text: string, user: string } | null>(null)
  
  // THE VISUAL EFFECTS STATE
  const [activeEffect, setActiveEffect] = useState<string>('')
  
  // THE NEW STAGING AREA STATES
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const testUsername = `Fan_${Math.floor(Math.random() * 1000)}`
    setUsername(testUsername)

    const fetchToken = async () => {
      try {
        const resp = await fetch(`/api/livekit?room=${roomId}&username=${testUsername}`)
        const data = await resp.json()
        setToken(data.token)
      } catch (e) {
        console.error("Token fetch failed", e)
      }
    }
    fetchToken()

    const channel = supabase
      .channel('live-stadium')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fan_reactions' },
        (payload) => {
          const newReaction = payload.new

          if (newReaction.reaction_type === 'FLARE' || newReaction.reaction_type === 'MEGAPHONE') {
            setActiveChaos({
              type: newReaction.reaction_type,
              text: newReaction.message,
              user: newReaction.user_id ? 'VIP Fan' : 'Anonymous'
            })
            setTimeout(() => setActiveChaos(null), 5000)

            // Trigger hardware vibration for EVERYONE receiving the payload
            if (typeof window !== 'undefined' && navigator.vibrate) {
              if (newReaction.reaction_type === 'MEGAPHONE') navigator.vibrate([100, 50, 100, 50, 100])
              if (newReaction.reaction_type === 'FLARE') navigator.vibrate([500, 200, 500])
            }

            // Trigger the screen shake and particles for EVERYONE
            setActiveEffect(newReaction.reaction_type === 'FLARE' ? 'effect-flare' : 'effect-megaphone')
            setTimeout(() => setActiveEffect(''), 2500)
          }

          setChat((prev) => [...prev, {
            id: newReaction.id,
            user: newReaction.user_id ? 'Fan' : 'Anonymous',
            text: newReaction.message,
            type: newReaction.reaction_type
          }])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId, supabase])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Maximum size is 5MB.")
      return
    }

    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSendFreeChat = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!freeChatInput.trim() && !selectedImage) return

    const msgText = freeChatInput.trim()
    const imgToUpload = selectedImage

    setFreeChatInput("")
    clearImage()
    setShowStickers(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (imgToUpload) {
      setIsUploading(true)
      try {
        const fileExt = imgToUpload.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('stadium-media')
          .upload(fileName, imgToUpload)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('stadium-media')
          .getPublicUrl(fileName)

        await supabase.from('fan_reactions').insert({
          match_id: parseInt(roomId) || 0,
          reaction_type: 'PICTURE',
          message: `${publicUrl}|SPLIT|${msgText}`,
          amount_paid_ngn: 0,
          user_id: user.id
        })
      } catch (error) {
        console.error("Upload failed:", error)
        alert("Failed to send image.")
      } finally {
        setIsUploading(false)
      }
    } else {
      await supabase.from('fan_reactions').insert({
        match_id: parseInt(roomId) || 0,
        reaction_type: 'STANDARD_CHAT',
        message: msgText,
        amount_paid_ngn: 0,
        user_id: user.id
      })
    }
  }

  const handleSendSticker = async (stickerUrl: string) => {
    setShowStickers(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('fan_reactions').insert({
      match_id: parseInt(roomId) || 0,
      reaction_type: 'STICKER',
      message: stickerUrl,
      amount_paid_ngn: 0,
      user_id: user.id
    })
  }

  // THE ACTION ENGINE FOR DIGITAL CHAOS PANEL
  const firePremiumAction = async (itemType: string, cost: number) => {
    const toastId = toast.loading(`Activating ${itemType}...`)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return toast.error("User not found", { id: toastId })

      const res = await fetch('/api/wallet/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, itemType, cost })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Transaction failed", { id: toastId })
        return
      }

      toast.success(`${itemType} Deployed!`, { id: toastId })
      router.refresh()

      // Broadcast to the Hub
      await supabase.from('fan_reactions').insert({
        match_id: parseInt(roomId) || 0,
        reaction_type: itemType === 'Global Flare' ? 'FLARE' : 'MEGAPHONE',
        message: 'INSTANT_CHAOS', 
        amount_paid_ngn: cost,
        user_id: user.id
      })

      if (typeof window !== 'undefined' && navigator.vibrate) {
        if (itemType === 'Megaphone') navigator.vibrate([100, 50, 100, 50, 100])
        if (itemType === 'Global Flare') navigator.vibrate([500, 200, 500])
      }

      setActiveEffect(itemType === 'Global Flare' ? 'effect-flare' : 'effect-megaphone')
      setTimeout(() => setActiveEffect(''), 2500)

    } catch (err) {
      toast.error("Network error", { id: toastId })
    }
  }

  if (token === "") return <div className="flex h-[100dvh] items-center justify-center text-electricLime animate-pulse font-black uppercase tracking-widest bg-black">Connecting to Edge...</div>

  return (
    <div className={`flex flex-col h-[100dvh] bg-black text-white overflow-hidden w-full relative ${activeEffect ? 'animate-quake' : ''}`}>
      
      {/* EXPLODING FLARES VISUALS */}
      {activeEffect === 'effect-flare' && (
        <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden flex justify-center items-end">
          <div className="absolute inset-0 bg-red-600/30 animate-pulse mix-blend-overlay"></div>
          {[...Array(30)].map((_, i) => {
            const randomLeft = 40 + Math.random() * 20;
            const randomDuration = 0.8 + Math.random() * 0.5;
            const randomDelay = Math.random() * 0.4;
            const randomAngle = Math.random() * 60 - 30;

            return (
              <div
                key={i}
                className="absolute bottom-[-20px] w-2 h-16 bg-fireCoral rounded-full blur-[2px] shadow-[0_0_20px_#ff3333]"
                style={{
                  left: `${randomLeft}%`,
                  transformOrigin: 'bottom center',
                  transform: `rotate(${randomAngle}deg)`,
                  animation: `shoot-flare ${randomDuration}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
                  animationDelay: `${randomDelay}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* MEGAPHONE SONIC BOOM VISUALS */}
      {activeEffect === 'effect-megaphone' && (
        <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-electricLime/10 mix-blend-overlay animate-pulse"></div>
          <div className="absolute w-32 h-32 border-4 border-electricLime rounded-full animate-ping opacity-80"></div>
          <div className="absolute w-64 h-64 border-2 border-electricLime rounded-full animate-ping opacity-50" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute w-96 h-96 border border-electricLime rounded-full animate-ping opacity-30" style={{ animationDelay: '0.2s' }}></div>
          <div className="text-[120px] animate-bounce drop-shadow-[0_0_40px_#ccff00]">📢</div>
        </div>
      )}
      
      {/* ACTIVE CHAOS BANNER */}
      {activeChaos && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`absolute inset-0 opacity-40 blur-3xl ${activeChaos.type === 'FLARE' ? 'bg-fireCoral animate-pulse' : 'bg-electricLime animate-ping'}`}></div>
          <div className={`relative text-center p-8 border-4 transform transition-all animate-bounce ${activeChaos.type === 'FLARE' ? 'border-fireCoral bg-black/80' : 'border-electricLime bg-black/80'}`}>
            <span className="text-6xl mb-4 block">{activeChaos.type === 'FLARE' ? '🧨' : '📢'}</span>
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">{activeChaos.user} Unleashed a {activeChaos.type}</span>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center p-3 border-b border-white/10 bg-black/80 backdrop-blur-md shrink-0 z-20">
        <div className="flex flex-col">
          <span className="text-[9px] text-wc-gold font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fireCoral animate-ping"></span> Live Hub
          </span>
          <h1 className="text-base font-black uppercase leading-tight">{venueName}</h1>
        </div>
        <Link href="/" className="text-[10px] bg-white/10 px-3 py-2 rounded-full font-bold uppercase tracking-wider hover:bg-white/20 transition-all">Exit</Link>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 scrollbar-hide w-full relative">
        <div className="w-full bg-black border-b border-white/5 shrink-0">
          <div className="aspect-video w-full max-w-4xl mx-auto bg-gray-900 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
            <span className="text-white/20 font-black text-2xl uppercase tracking-widest absolute">Highlight Feed</span>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto p-3 border-b border-white/5 shrink-0">
          <LiveKitRoom video={false} audio={true} token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}>
            <RoomAudioRenderer />
            <AudioControls tracksCount={0} />
          </LiveKitRoom>
        </div>

        <div className="w-full max-w-4xl mx-auto p-4 space-y-4 flex-1 pb-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Reactions</span>
          </div>
          {chat.map((msg, idx) => {
            const isPicture = msg.type === 'PICTURE';
            const imgUrl = isPicture ? msg.text.split('|SPLIT|')[0] : '';
            const imgCaption = isPicture ? msg.text.split('|SPLIT|')[1] : '';

            return (
              <div key={idx} className="animate-fade-in-up leading-tight">
                {msg.type === 'STANDARD_CHAT' ? (
                  <>
                    <span className="text-wc-gold font-bold text-[11px] uppercase mr-2">{msg.user}:</span>
                    <span className="text-[13px] text-gray-200">{msg.text}</span>
                  </>
                ) : msg.type === 'STICKER' ? (
                  <div className="flex flex-col items-start gap-1 mt-2">
                    <span className="text-wc-gold font-bold text-[10px] uppercase">{msg.user}:</span>
                    <img src={msg.text} alt="sticker" className="w-24 h-24 object-cover rounded-xl border border-white/10" />
                  </div>
                ) : msg.type === 'PICTURE' ? (
                  <div className="flex flex-col items-start gap-1 mt-2 bg-white/5 p-2 rounded-xl border border-white/10 inline-flex">
                    <span className="text-wc-gold font-bold text-[10px] uppercase">{msg.user}:</span>
                    <img src={imgUrl} alt="fan upload" className="max-w-[200px] sm:max-w-xs h-auto object-cover rounded-lg shadow-lg" loading="lazy" />
                    {imgCaption && (
                      <span className="text-[12px] text-gray-200 mt-1">{imgCaption}</span>
                    )}
                  </div>
                ) : (
                  <div className={`p-2 rounded border mt-2 ${msg.type === 'FLARE' ? 'bg-fireCoral/20 border-fireCoral' : 'bg-electricLime/20 border-electricLime'}`}>
                    <span className="font-black text-[10px] uppercase mr-2">{msg.user} [{msg.type}]:</span>
                    <span className="text-[12px] font-bold text-white">{msg.text}</span>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="shrink-0 w-full bg-black border-t border-white/10 p-2 z-20 relative">
        
        {showStickers && (
          <div className="absolute bottom-[100%] left-0 w-full bg-black/95 backdrop-blur-xl border-t border-white/10 p-4 animate-fade-in-up">
            <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
              {STICKERS.map((sticker) => (
                <button 
                  key={sticker.id}
                  onClick={() => handleSendSticker(sticker.url)}
                  className="aspect-square bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 text-2xl"
                >
                  {sticker.icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {imagePreview && (
          <div className="max-w-md mx-auto mb-2 px-2 animate-fade-in">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-16 w-auto rounded-lg border border-white/20 object-cover shadow-lg" />
              <button 
                type="button" 
                onClick={clearImage} 
                className="absolute -top-2 -right-2 bg-fireCoral text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black hover:scale-110 transition-transform"
              >
                X
              </button>
            </div>
          </div>
        )}

        <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageSelect} />

        <form onSubmit={handleSendFreeChat} className="max-w-md mx-auto flex gap-2 items-center">
          <button type="button" onClick={() => setShowStickers(!showStickers)} className="text-xl opacity-70 hover:opacity-100 transition-opacity p-2">😀</button>
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`text-xl transition-opacity p-2 ${imagePreview ? 'opacity-100 text-electricLime' : 'opacity-70 hover:opacity-100'} disabled:opacity-30`}
          >
            {isUploading ? '⏳' : '📷'}
          </button>

          <input type="text" value={freeChatInput} onChange={(e) => setFreeChatInput(e.target.value)} placeholder="Add a caption..." className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-all" />
          
          <button 
            type="submit" 
            disabled={(!freeChatInput.trim() && !selectedImage) || isUploading} 
            className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2 text-xs font-bold transition-all disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>

      <div className="shrink-0 w-full bg-black border-t border-white/5 p-3 pb-safe z-30">
        <div className="w-full max-w-md mx-auto">
          {/* 🚨 THE CRITICAL ONACTION PROP IS NOW WIRED HERE 🚨 */}
          <DigitalChaosPanel userEmail={userEmail} onAction={firePremiumAction} />
        </div>
      </div>
    </div>
  )
}

// function AudioControls({ tracksCount }: { tracksCount: number }) {
//   const { isMicrophoneEnabled, localParticipant, microphoneTrack } = useLocalParticipant()
//   const tracks = useTracks([Track.Source.Microphone])
//  const volume = useTrackVolume(
//   microphoneTrack
//     ? {
//         participant: localParticipant,
//         publication: microphoneTrack,
//         source: Track.Source.Microphone,
//       }
//     : undefined
// )

function AudioControls({ tracksCount }: { tracksCount: number }) {
  const { isMicrophoneEnabled, localParticipant, microphoneTrack } = useLocalParticipant()
  const tracks = useTracks([Track.Source.Microphone])
  const volume = useTrackVolume(tracks[0] || undefined)
  const setVolume = useAudioStore((state) => state.setVolume)

  useEffect(() => {
    if (isMicrophoneEnabled && volume !== undefined) setVolume(volume)
    else setVolume(0)
  }, [volume, isMicrophoneEnabled, setVolume])

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between overflow-hidden relative">
      <div className="flex items-center gap-4 z-10">
        <div className="w-12 h-12 relative flex items-center justify-center">
          <div className="scale-50 absolute"><HapticVisualizer /></div>
        </div>
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white">{isMicrophoneEnabled ? 'Live Broadcast' : 'Mic Muted'}</h2>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{tracks.length} active mics</p>
        </div>
      </div>
      <button onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)} className={`z-20 px-4 py-2 rounded-lg font-black uppercase tracking-widest transition-all text-[10px] ${isMicrophoneEnabled ? 'bg-fireCoral text-white shadow-[0_0_15px_rgba(255,0,0,0.3)]' : 'bg-wc-green text-white shadow-[0_0_15px_rgba(0,177,64,0.3)]'}`}>
        {isMicrophoneEnabled ? 'Mute' : 'Live'}
      </button>
    </div>
  )
}