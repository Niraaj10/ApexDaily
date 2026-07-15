"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) router.push("/dashboard");
    else alert("Invalid Login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-black">
      {/* Animated gradient background  */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-pink-500 via-purple-500 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500 via-purple-500 to-transparent rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-7xl h-[700px] border-[5px] rounded-3xl shadow-2xl overflow-hidden flex">
        
        {/* Left Panel - Gradient Background with Quote */}
        <div className="w-1/2 relative overflow-hidden p-12 flex flex-col justify-between bg-transparent">
          

          {/* White border frame */}
          <div className="absolute inset-6 border-2 border-white/20 rounded-2xl pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-block">
              <p className="text-white/80 text-xs font-medium tracking-widest uppercase">
                THE APEX OF PRODUCTIVITY
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-white font-serif text-6xl leading-tight mb-6">
              Master<br />
              Your Daily<br />
              Workflow
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Unify workspace collaboration, project management, and a strict-consistency habit tracker into a single, cohesive platform.
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-1/2 bg-white rounded-l-3xl p-12 flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-end mb-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-lg font-semibold text-gray-900">ApexDaily</span>
            </div>
          </div>

          {/* Welcome text */}
          <div className="mb-12">
            <h2 className="text-5xl font-serif text-gray-900 mb-3">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500">
              Enter your email and password to access your high-performance workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCredentialsLogin} className="flex-1 flex flex-col">
            {/* Email input */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
                required
              />
            </div>

            {/* Password input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-200"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-gray-900 hover:text-gray-700 transition font-medium"
              >
                Forgot Password
              </button>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition shadow-lg shadow-black/10 mb-6"
            >
              Sign In
            </button>

            {/* Google sign in */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full border border-gray-200 py-3.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign In with Google
            </button>

            {/* Sign up link */}
            <div className="mt-auto pt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-gray-900 font-semibold hover:text-gray-700 transition"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}