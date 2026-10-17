"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage("");
    
    const formData = new FormData(e.currentTarget);
    
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false, // We handle the redirect manually below
    });

    if (result?.error) {
      setErrorMessage("Invalid credentials.");
      setIsPending(false);
    } else if (result?.ok) {
      // Force a hard navigation to ensure the server session is re-fetched for the navbar
      window.location.href = "/";
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark overlay for the background */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-0"></div>

      {/* Top Navbar Logo (Optional, like Pixabay) */}
      <div className="absolute top-6 left-8 z-20 flex items-center space-x-2">
        <h1 className="text-3xl font-black text-white tracking-tighter">MedIntel</h1>
      </div>

      {/* Top Navbar Theme Toggle */}
      <div className="absolute top-6 right-8 z-20">
        <ThemeToggle />
      </div>

      {/* The Pixabay-style Modal */}
      <div className="relative z-10 flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px] flex-col md:flex-row">
        
        {/* Left Side (Image & Welcome Text) */}
        <div 
          className="hidden md:flex md:w-[45%] p-10 flex-col justify-center relative text-white"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Inner dark gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
          
          <div className="relative z-10 mt-auto">
            <h2 className="text-4xl font-bold mb-3 tracking-tight">Welcome back!</h2>
            <p className="text-lg text-gray-200 leading-relaxed font-light">
              Securely access your patient records, collaborate with AI, and manage your practice seamlessly.
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Close button */}
          <button 
            type="button"
            onClick={() => router.push('/')}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-8">Login to MedIntel</h2>

          {/* Social Logins */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button 
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-full py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
          </div>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative bg-white px-4 text-sm text-gray-500 font-medium">
              or continue with email
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="email">
                Username or email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                defaultValue="doctor@medintel.com"
                required
                className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-sm outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  defaultValue="password123"
                  required
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-sm outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex justify-start mt-2">
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-2">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
                {errorMessage}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full py-3.5 px-4 font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 mt-2"
            >
              {isPending ? "Logging in..." : "Log In"}
            </button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 font-medium">
                Don't have an account? <a href="#" className="text-gray-900 underline underline-offset-2 hover:text-emerald-600">Join MedIntel</a>
              </p>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                By continuing, you agree to MedIntel's <a href="#" className="underline">Terms of Service</a>. Read our <a href="#" className="underline">Privacy Policy</a>.
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
