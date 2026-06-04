import { login, signup } from './actions'
import GoogleLoginButton from '../components/GoogleLoginButton';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  // Next.js 15 requires us to await the search parameters
  const resolvedParams = await searchParams;
  const message = resolvedParams?.message;

  return (
    <div className="flex-1 flex flex-col w-full px-4 sm:px-8 justify-center items-center min-h-[80vh] animate-fade-in">
      
      <div className="w-full max-w-md flex flex-col gap-6 bg-glassWhite backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
            Enter the <span className="text-electricLime">Stadium</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium">Log in to tip creators and stake tokens.</p>
        </div>

        {/* 1-CLICK GOOGLE AUTHENTICATION */}
        <div className="w-full">
          <GoogleLoginButton />
        </div>

        {/* PREMIUM VISUAL DIVIDER */}
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Or continue with email</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form className="flex-1 flex flex-col w-full justify-center gap-4 text-white">
          
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-gray-400 font-bold" htmlFor="email">
              Email Address
            </label>
            <input
              className="rounded-xl px-4 py-4 bg-black/40 border border-white/10 placeholder-white/20 focus:outline-none focus:border-electricLime focus:ring-1 focus:ring-electricLime transition-all"
              name="email"
              placeholder="fan@stadium.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-gray-400 font-bold" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-xl px-4 py-4 bg-black/40 border border-white/10 placeholder-white/20 focus:outline-none focus:border-electricLime focus:ring-1 focus:ring-electricLime transition-all"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          {/* This will now safely display the error message */}
          {message && (
            <p className="mt-2 p-4 bg-fireCoral/10 border border-fireCoral/50 text-fireCoral text-center text-sm font-bold rounded-xl">
              {message}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              formAction={login}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-4 text-white font-bold transition-all active:scale-[0.98]"
            >
              Log In
            </button>
            <button
              formAction={signup}
              className="flex-1 bg-electricLime text-black border border-electricLime rounded-xl px-4 py-4 font-black transition-all hover:bg-[#b3ff00] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] active:scale-[0.98]"
            >
              Sign Up
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}