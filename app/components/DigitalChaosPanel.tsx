'use client'

export default function DigitalChaosPanel({ userEmail, onAction }: { 
  userEmail: string, 
  onAction: (item: string, cost: number) => void 
}) {
  return (
    <div className="relative w-full bg-black border border-white/10 p-3 rounded-2xl z-10">
      <div className="grid grid-cols-2 gap-3">
        
        {/* Instant Megaphone */}
        <button
          type="button"
          onClick={() => onAction('Megaphone', 50)}
          className="py-4 px-2 rounded-xl border bg-white/5 border-white/10 hover:bg-electricLime/20 hover:border-electricLime hover:text-electricLime transition-all flex flex-col items-center justify-center gap-2 group shadow-lg"
        >
          <span className="text-3xl group-hover:scale-125 group-active:scale-95 transition-transform">📢</span>
          <div className="flex flex-col items-center leading-none">
             <span className="text-[10px] font-black uppercase tracking-widest text-white mt-1">Megaphone</span>
             <span className="text-[9px] font-bold text-gray-400 group-hover:text-electricLime">50 NGN</span>
          </div>
        </button>

        {/* Instant Flare */}
        <button
          type="button"
          onClick={() => onAction('Global Flare', 200)}
          className="py-4 px-2 rounded-xl border bg-white/5 border-white/10 hover:bg-fireCoral/20 hover:border-fireCoral hover:text-fireCoral transition-all flex flex-col items-center justify-center gap-2 group shadow-lg"
        >
          <span className="text-3xl group-hover:scale-125 group-active:scale-95 transition-transform">🧨</span>
          <div className="flex flex-col items-center leading-none">
             <span className="text-[10px] font-black uppercase tracking-widest text-white mt-1">Global Flare</span>
             <span className="text-[9px] font-bold text-gray-400 group-hover:text-fireCoral">200 NGN</span>
          </div>
        </button>

      </div>
    </div>
  )
}