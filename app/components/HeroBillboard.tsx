'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Make sure these match the exact filenames in your public folder
const POSTERS = [
  '/poster1.jpg',
  '/poster2.jpg',
  '/poster3.jpg'
];

export default function HeroBillboard() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 8 seconds is the sweet spot for ambient, cinematic rotation
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % POSTERS.length);
    }, 8000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full rounded-3xl overflow-hidden glass-card border border-white/10 mt-6 min-h-[50vh] flex flex-col md:flex-row items-center justify-between p-6 sm:p-12 gap-8 lg:gap-12">
      
      {/* Decorative Top Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wc-green via-wc-gold to-wc-green"></div>
      
      {/* LEFT SIDE: The Crisp Typography */}
      <div className="flex-1 text-left z-10 w-full">
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-none uppercase">
          FIFA WORLD CUP <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-wc-gold to-yellow-200">
            2026
          </span>
        </h1>
        <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-300 max-w-xl font-medium tracking-wide">
          THE GLOBE IS WATCHING. TUNE INTO LIVE VIEWING CENTERS, STAKE ON CONTROVERSIES, AND FEEL THE ROAR.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="#hubs" className="bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-gray-200 transition-all text-center text-sm">
            Find a Vibe Hub
          </Link>
          <Link href="/var" className="bg-wc-green text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-[#009030] transition-all text-center text-sm border border-wc-green/50 shadow-[0_0_20px_rgba(0,177,64,0.3)]">
            Enter VAR Booth
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE: The Rotating Digital Billboard */}
      <div className="flex-1 w-full relative h-[400px] sm:h-[500px] md:h-[550px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
        {POSTERS.map((poster, index) => (
          <img
            key={poster}
            src={poster}
            alt="World Cup Poster"
            className={`absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {/* Subtle Inner Glow to blend the artwork */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none"></div>
      </div>
    </section>
  );
}