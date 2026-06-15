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
  
  const { data: { user } } = await supabase.auth.getUser();
  
  let balance = 0;
  let username = '';

  if (user) {
    // ✅ FIX: Read from wallets table instead of ledger_entries
    // This ensures we're reading the SAME source of truth that Paystack updates
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    balance = wallet?.balance || 0;

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
        
        {/* <ToastProvider />
        <Script 
          type="module" 
          src="https://widgets.api-sports.io/2.0.3/widgets.js" 
          strategy="afterInteractive" 
        /> */}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

      </body>
    </html>
  );
}