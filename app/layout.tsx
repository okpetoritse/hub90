import type { Metadata } from "next";
import "./globals.css";
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Script from 'next/script'
import WalletButton from './components/WalletButton';
import ToastProvider from './components/ToastProvider';

export const metadata: Metadata = {
  title: "Hub90 | The Digital Stadium",
  description: "Live football vibe hubs, instant VAR tribunals, and creator payouts.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  
  // 1. Securely check if a user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  let balance = 0;
  let username = '';

  if (user) {
    // 2. Fetch all their ledger transactions and sum them up for their live balance
    const { data: ledger } = await supabase
      .from('ledger_entries')
      .select('amount')
      .eq('account_id', user.id);
    
    balance = ledger?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;

    // 3. Fetch their custom username
    const { data: profile } = await supabase
      .from('users')
      .select('username')
      .eq('id', user.id)
      .single();
      
    username = profile?.username || 'Fan';
  }

  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-stadiumBg-start to-stadiumBg-end text-white min-h-screen antialiased selection:bg-electricLime selection:text-black">
        
        {/* 2. THE GLOBAL API-SPORTS ENGINE */}
        {/* This ensures the widget script is ready before any room opens */}
        <ToastProvider />
        <Script 
          type="module" 
          src="https://widgets.api-sports.io/2.0.3/widgets.js" 
          strategy="afterInteractive" 
        />
        
        {/* Dynamic Navigation Bar with Wallet Engine */}
        <nav className="w-full border-b border-glassWhite bg-black/20 backdrop-blur-md h-16 flex items-center justify-between px-6 sticky top-0 z-50">
            <Link href="/" className="font-black text-2xl tracking-widest uppercase flex items-center gap-1">
              HUB<span className="text-wc-gold">90</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
               {user ? (
           <WalletButton 
             balance={balance} 
             username={username} 
             userId={user.id} 
             userEmail={user.email || ''} 
           />
         ) : (
           <Link href="/login" className="text-sm font-bold bg-white/10 px-4 py-2 rounded-xl border border-white/10 hover:bg-electricLime hover:text-black transition-all">
             Sign In
           </Link>
         )}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fireCoral to-electricLime p-[2px]">
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs font-bold uppercase">
                    {username.substring(0,2)}
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-bold bg-white/10 px-4 py-2 rounded-xl border border-white/10 hover:bg-electricLime hover:text-black transition-all">
                Sign In
              </Link>
            )}
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

      </body>
    </html>
  );
}