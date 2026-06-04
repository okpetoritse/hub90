import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { submitStake } from './actions'; // <-- Bringing in our secure armored truck

export default async function VarBooth() {
  const supabase = await createClient();
  
  // Fetch the tribunals along with the match and creator data
  const { data: tribunals, error } = await supabase
    .from('var_tribunals')
    .select(`
      *,
      users (username),
      matches (home_team, away_team)
    `)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching tribunals:', error);

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-20">
      
      {/* Mobile-Optimized Header */}
      <div className="sticky top-16 z-40 bg-stadiumBg-start/90 backdrop-blur-md pt-4 pb-4 border-b border-white/10 px-2 sm:px-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-fireCoral tracking-tight uppercase flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-fireCoral animate-pulse"></span>
            VAR Tribunal
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">Stake your tokens. Settle the debate.</p>
        </div>
        <Link href="/" className="bg-glassWhite px-4 py-2 rounded-xl text-sm font-bold border border-white/10 hover:bg-white/10 transition-colors">
          Back
        </Link>
      </div>

      {/* The Outrage Feed */}
      <div className="space-y-8 px-2 sm:px-0">
        {tribunals && tribunals.length > 0 ? (
          tribunals.map((tribunal) => (
            <div key={tribunal.id} className="bg-glassWhite border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
              
              {/* Creator & Match Context */}
              <div className="p-4 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fireCoral to-electricLime p-[2px]">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs font-bold">
                      {tribunal.users?.username?.substring(0,2).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-none">{tribunal.users?.username}</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-1">
                      {tribunal.matches?.home_team} vs {tribunal.matches?.away_team}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase block">Total Pool</span>
                  <span className="text-lg font-black text-electricLime">NGN {tribunal.total_pool}</span>
                </div>
              </div>

              {/* The Video Player Area */}
              <div className="relative w-full aspect-[4/5] sm:aspect-video bg-black flex items-center justify-center group">
                <video 
                  src={tribunal.video_url} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  controls
                  playsInline
                />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                  <p className="text-sm sm:text-base font-medium text-white drop-shadow-md">
                    "{tribunal.description}"
                  </p>
                </div>
              </div>

              {/* High-Stakes Action Area connected to Server Actions */}
              <div className="p-5 flex gap-3 bg-black/40">
                
                {/* FOUL FORM */}
                <form action={submitStake} className="flex-1">
                  <input type="hidden" name="tribunal_id" value={tribunal.id} />
                  <input type="hidden" name="prediction" value="FOUL" />
                  <button type="submit" className="w-full bg-fireCoral/10 hover:bg-fireCoral text-fireCoral hover:text-white border border-fireCoral rounded-2xl py-4 sm:py-5 flex flex-col items-center justify-center transition-all active:scale-[0.98]">
                    <span className="text-lg sm:text-xl font-black uppercase tracking-widest">Foul</span>
                    <span className="text-[10px] sm:text-xs opacity-80 mt-1">Stake 50 NGN</span>
                  </button>
                </form>

                {/* DIVE FORM */}
                <form action={submitStake} className="flex-1">
                  <input type="hidden" name="tribunal_id" value={tribunal.id} />
                  <input type="hidden" name="prediction" value="DIVE" />
                  <button type="submit" className="w-full bg-electricLime/10 hover:bg-electricLime text-electricLime hover:text-black border border-electricLime rounded-2xl py-4 sm:py-5 flex flex-col items-center justify-center transition-all active:scale-[0.98]">
                    <span className="text-lg sm:text-xl font-black uppercase tracking-widest">Dive</span>
                    <span className="text-[10px] sm:text-xs opacity-80 mt-1">Stake 50 NGN</span>
                  </button>
                </form>

              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-20">No controversies right now. The refs are actually doing their jobs.</div>
        )}
      </div>
    </div>
  );
}