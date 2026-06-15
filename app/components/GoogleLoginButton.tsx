'use client';

import { createClient } from '@/utils/supabase/client';

export default function GoogleLoginButton() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button 
      onClick={handleGoogleLogin} 
      type="button"
      className="flex-1 min-w-0 h-14 bg-[#1C1C1E] rounded-2xl border border-white/5 flex items-center justify-center gap-2 hover:bg-[#2C2C2E] transition-colors overflow-hidden shrink-0"
    >
      {/* THE FIX: Forced inline styles. The browser has no choice but to make it 24x24 pixels. */}
      <img 
        src="https://www.svgrepo.com/show/475656/google-color.svg" 
        alt="Google" 
        width={24}
        height={24}
        style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} 
      />
      <span className="text-sm font-medium text-white truncate">Google</span>
    </button>
  );
}