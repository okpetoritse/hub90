import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import HeroBillboard from './components/HeroBillboard';
import InteractiveGlobe from './components/InteractiveGlobe';
import LiveScoreBoard from './components/LiveScoreBoard';

export default async function Home() {
  const supabase = await createClient();
  
  // Get authenticated user session to pull their real email for Paystack receipting
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email || '';

  // Keep your vibe hubs fetching logic
  const { data: vibeHubs } = await supabase
    .from('viewing_centers')
    .select('*')
    .limit(3);

  return (
    <div className="space-y-12 md:space-y-16 animate-fade-in w-full overflow-hidden pb-20 max-w-7xl mx-auto px-4">
      
      {/* 1. THE HERO BILLBOARD (Rotating Posters Component) */}
      <HeroBillboard />

      {/* 2. DYNAMIC REAL-TIME MATCH GRID */}
      <section className="px-2 sm:px-0">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <h2 className="text-2xl sm:text-3xl font-black uppercase flex items-center gap-3">
            <span className="w-3 h-3 bg-wc-gold rounded-full animate-pulse"></span>
            Global Fixtures
          </h2>
          <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-wc-gold">LIVE & UPCOMING</span>
        </div>

        {/* 🚨 THE NEW DYNAMIC CLIENT-SIDE ENGINE 🚨 */}
        <LiveScoreBoard />
      </section>

      {/* 3. YOUR VIBE HUBS (With 3D WebGL Background) */}
      <section id="hubs" className="relative px-2 sm:px-0 min-h-[600px] flex flex-col justify-center">
        
        {/* 3D Globe sits absolutely positioned in the background */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <InteractiveGlobe />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black uppercase mb-8 border-b border-white/10 pb-4">
            Live Vibe Hubs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vibeHubs?.map((hub) => (
                <div key={hub.id} className="glass-card rounded-2xl p-6 group backdrop-blur-xl bg-black/40">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-wc-gold transition-colors">
                      {hub.venue_name}
                    </h3>
                    {hub.is_certified && (
                      <span className="bg-wc-green text-white text-[10px] font-black px-2 py-1 rounded">CERTIFIED</span>
                    )}
                  </div>
                  
                  <Link 
                    href={`/hub/${hub.id}`}
                    className="mt-6 w-full block bg-white/10 text-white hover:bg-wc-gold hover:text-black text-center py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 text-sm active:scale-[0.98] backdrop-blur-md"
                  >
                    Tune In Live
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}