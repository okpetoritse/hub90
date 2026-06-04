'use client';

import { createClient } from '@/utils/supabase/client';

export default function GoogleLoginButton() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This tells Supabase to send the user to the callback route we just built
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button 
      onClick={handleGoogleLogin} 
      className="flex items-center justify-center gap-3 w-full sm:w-auto bg-white text-black font-black uppercase tracking-widest py-4 px-8 rounded-full hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
    >
      <img 
        src="https://www.svgrepo.com/show/475656/google-color.svg" 
        alt="Google" 
        className="w-5 h-5" 
      />
      Enter with Google
    </button>
  );
}