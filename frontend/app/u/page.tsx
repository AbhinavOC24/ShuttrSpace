"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useAuthStore } from "@/store/useAuthStore";
import LeftPanel from "@/components/auth/LeftPanel";
import RightPanel from "@/components/auth/RightPanel";

const LoginPage = () => {
  const router = useRouter();

  const { login, signup, checkAuth, loading } = useAuthStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For signup
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    const checkSession = async () => {
      const authenticated = await checkAuth();
      if (authenticated && useAuthStore.getState().userSlug) {
        const { hasProfile, userSlug } = useAuthStore.getState();
        router.push(hasProfile ? `/u/${userSlug}` : "/u/createprofile");
      } else {
        // Not authenticated — show login form
        setIsCheckingAuth(false);
      }
    };
    checkSession();
  }, [checkAuth, router]);

  const handleAuth = async () => {
    // Basic validation
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!isLoginMode) {
      if (!name || name.length < 3 || name.length > 20) {
        toast.error("Name must be between 3 and 20 characters");
        return;
      }
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    }

    let success = false;
    if (isLoginMode) {
      success = await login({ email, password });
    } else {
      success = await signup({ email, password, name });
    }

    if (success) {
      toast.success(isLoginMode ? "Welcome back!" : "Account created!");
      const state = useAuthStore.getState();
      router.push(state.hasProfile ? `/u/${state.userSlug}` : "/u/createprofile");
    } else {
      // Small delay to ensure state is synced
      setTimeout(() => {
        const errorMsg = useAuthStore.getState().authError;
        toast.error(errorMsg || "Invalid credentials");
      }, 50);
    }
  };

  if (!isMounted || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/30 text-xs uppercase tracking-widest font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all duration-200";
  const labelClass = "block text-[11px] uppercase tracking-widest text-white/30 font-semibold mb-2";

  return (
    <div className="overflow-hidden flex items-center justify-center min-h-screen bg-black p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl h-fit min-h-[620px] overflow-hidden flex flex-col md:flex-row bg-[#111] rounded-[32px] shadow-2xl border border-white/8">

        {/* Left — visual panel, unchanged */}
        <div className="hidden md:block md:w-5/12">
          <LeftPanel />
        </div>

        {/* Right — auth form */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12 text-white">
          <div className="max-w-sm w-full mx-auto">

            {/* Brand mark on mobile */}
            <p className="md:hidden text-white/30 text-xs uppercase tracking-widest font-semibold mb-8">
              Iso
            </p>

            {/* Heading */}
            <h1 className="font-family-helvetica font-semibold text-3xl tracking-tight text-white mb-1">
              {isLoginMode ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-white/30 text-sm mb-8">
              {isLoginMode
                ? "Sign in to manage your portfolio."
                : "Start sharing your photography with the world."}
            </p>

            {/* Form fields */}
            <div className="flex flex-col gap-4">
              {!isLoginMode && (
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                    className={inputClass}
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                  className={inputClass}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                  className={inputClass}
                  autoComplete={isLoginMode ? "current-password" : "new-password"}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleAuth}
                disabled={loading}
                className="mt-2 w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    {isLoginMode ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  isLoginMode ? "Sign In" : "Sign Up"
                )}
              </button>

              {/* Toggle */}
              <p className="text-center text-white/30 text-sm mt-2">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-white hover:text-white/70 underline underline-offset-4 decoration-white/30 transition-colors"
                >
                  {isLoginMode ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
