import { login, signup } from './actions'
import GoogleLoginButton from '../components/GoogleLoginButton';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const resolvedParams = await searchParams;
  const message = resolvedParams?.message;

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#111216] text-white animate-fade-in font-sans overflow-x-hidden">
      
      {/* Mobile Wrapper */}
      <div className="w-full max-w-md mx-auto px-6 py-12 flex flex-col h-full">
        
        {/* Back Button */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 mb-8 hover:bg-white/5 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white/70">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-[32px] leading-tight font-semibold">
            Create an<br />account
          </h1>
          <p className="text-sm text-gray-400">Sign up with</p>
        </div>

        {/* Social Login Row */}
        <div className="flex items-center gap-4 mb-10 w-full">
          
          {/* Your customized Google Button dropped directly in! */}
          <GoogleLoginButton />
          
          {/* Facebook Mock Button matching the design */}
          <button className="flex-1 min-w-0 h-14 bg-[#1C1C1E] rounded-2xl border border-white/5 flex items-center justify-center gap-2 hover:bg-[#2C2C2E] transition-colors overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-5 h-5 fill-[#1877F2] shrink-0">
              <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
            </svg>
            <span className="text-sm font-medium truncate">Facebook</span>
          </button>
        </div>

        {/* Form */}
        <form className="flex flex-col flex-1 gap-6 w-full">
          
          {/* Username Field */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 focus-within:border-blue-500 transition-colors">
            <label className="text-sm font-medium text-white w-24 shrink-0" htmlFor="username">
              Username
            </label>
            <input
              className="flex-1 min-w-0 bg-transparent text-sm text-right text-white placeholder-gray-600 focus:outline-none"
              name="username"
              placeholder="username"
            />
          </div>

          {/* Email Field */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 focus-within:border-blue-500 transition-colors">
            <label className="text-sm font-medium text-white w-24 shrink-0" htmlFor="email">
              Email
            </label>
            <input
              className="flex-1 min-w-0 bg-transparent text-sm text-right text-white placeholder-gray-600 focus:outline-none"
              name="email"
              type="email"
              placeholder="example@mail.com"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 focus-within:border-blue-500 transition-colors group">
            <label className="text-sm font-medium text-white w-24 shrink-0" htmlFor="password">
              Password
            </label>
            <div className="flex-1 min-w-0 flex items-center justify-end gap-3">
              <input
                className="w-full bg-transparent text-sm text-right text-white placeholder-gray-600 focus:outline-none"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
              <button type="button" className="text-gray-600 hover:text-gray-400 focus:outline-none shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {message && (
            <p className="mt-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-center text-sm font-medium rounded-xl">
              {message}
            </p>
          )}

          {/* Main Action Button */}
          <div className="mt-auto pt-8 pb-4 w-full">
            <button
              formAction={signup}
              className="w-full bg-[#3574F0] hover:bg-[#2860d8] text-white rounded-2xl py-4 font-semibold text-base transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(53,116,240,0.3)]"
            >
              Register
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account? <button formAction={login} className="text-white hover:text-[#3574F0] transition-colors">Log In</button>
            </p>
          </div>

        </form>
      </div>
    </div>
  )
}