'use client';

import { useAudioStore } from '../store/useAudioStore';

export default function HapticVisualizer() {
  // The visualizer subscribes ONLY to the volume. Nothing else re-renders.
  const volume = useAudioStore((state) => state.volume);

  // LiveKit volume typically ranges from 0 to 1. We scale it up for a dramatic visual pop.
  const pulseScale = 1 + volume * 2.5; 
  const coreScale = 1 + volume * 0.3;
  const glowOpacity = Math.min(volume * 3, 0.8);

  return (
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto my-8">
      {/* Outer Shockwave (The Haptic Pulse) */}
      <div 
        className="absolute inset-0 rounded-full bg-wc-green transition-transform duration-75 ease-out"
        style={{ 
          transform: `scale(${pulseScale})`, 
          opacity: glowOpacity 
        }}
      ></div>
      
      {/* Inner Microphone Core */}
      <div 
        className="relative z-10 w-24 h-24 rounded-full bg-black border-2 border-wc-gold flex items-center justify-center shadow-[0_0_30px_rgba(238,182,36,0.3)] transition-transform duration-75 ease-out"
        style={{ transform: `scale(${coreScale})` }}
      >
        <span className="text-4xl text-wc-gold">🎙️</span>
      </div>
    </div>
  );
}