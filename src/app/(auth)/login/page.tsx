"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/dashboard",
    });

    setIsSubmitting(false);

    if (response?.error) {
      setErrorMessage("Invalid email or password. Please try again.");
      return;
    }

    if (response?.url) {
      router.push(response.url);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#0a0b20] text-zinc-100 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4.5s ease-in-out infinite;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #090a1f inset !important;
          -webkit-text-fill-color: #f3f4f6 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}} />

      {/* Left Column: 3D Illustration & Branding Tagline */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-b from-[#0a0b20] to-[#182943] border-r border-[#182943]/20">
        
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">NextGen ERP</span>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
            NextGen ERP Suite
          </h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-md">
            Streamlined operations for specialized interior designing, waterproofing, and construction management.
          </p>
        </div>

        {/* 3D Illustration Wrapper */}
        <div className="relative z-10 flex items-center justify-center my-6 select-none animate-float">
          <img
            src="/login-hero.png?v=3"
            alt="NextGen Illustration"
            className="w-full max-w-[440px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Copyright Footer (Aligned to the left of this left section) */}
        <div className="relative z-10 flex items-center gap-3 self-start">
          <div className="shrink-0 flex items-center justify-center bg-white rounded-full h-8 w-8 p-1 shadow-sm border border-zinc-800/40">
            <img
              src="/logo.png"
              alt="NextGen Logo"
              className="h-full w-full object-contain select-none"
            />
          </div>
          <div className="flex flex-col gap-0.5 text-[10px] xl:text-xs font-mono tracking-wide cursor-default select-none">
            <span className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300 font-semibold">
              © {new Date().getFullYear()} NextGen Interior & Waterproofing.
            </span>
            <span className="text-zinc-500 hover:text-zinc-400 transition-colors duration-300">
              All rights reserved.
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Glassmorphic Login Card */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-6 relative flex items-center justify-center p-6 sm:p-12 overflow-hidden bg-gradient-to-b from-[#0a0b20] to-[#142235]">
        {/* Modern Dot Pattern Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[440px]">
          <div className="rounded-3xl border border-zinc-800/60 bg-zinc-950/45 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black/60">
            <div className="mb-8 flex flex-col items-center text-center">
              <img
                src="/logo.png?v=3"
                alt="NextGen Logo"
                className="h-16 w-auto object-contain mb-4 select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
              />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Staff Login</h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xs">
                Access the Interior & Waterproofing operations dashboard.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-zinc-400">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="h-10 bg-zinc-950 border-zinc-800 focus:border-violet-500 focus:ring-violet-500/20 text-zinc-100 placeholder-zinc-600 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold text-zinc-400">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-zinc-500 hover:text-violet-400 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="h-10 pr-10 bg-zinc-950 border-zinc-800 focus:border-violet-500 focus:ring-violet-500/20 text-zinc-100 placeholder-zinc-600 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-200 animate-fade-in">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 border-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-[10px] sm:text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
              Use your staff credentials to access ERP modules and financial dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
