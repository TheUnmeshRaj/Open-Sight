"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message || "Sign up failed");
          setLoading(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message || "Login failed");
          setLoading(false);
          return;
        }
      }

      router.push("/");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (oauthError) setError(oauthError.message || "OAuth failed");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Subtle gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
          {/* Left - Branding */}
          <div className="hidden md:flex flex-col justify-center gap-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/40">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  OpenSight
                </h2>
                <p className="text-sm text-slate-400">
                  Crime Analytics Platform
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-slate-300">
              Monitor urban crime patterns, identify hotspots, and support
              smarter interventions with a focused analytics dashboard.
            </p>

            <div className="space-y-4">
              <FeatureCard
                iconBg="bg-emerald-500/15"
                iconColor="text-emerald-400"
                title="Real-time insights"
                description="Get live hotspot predictions powered by ML models tuned for urban crime data."
              />
              <FeatureCard
                iconBg="bg-purple-500/15"
                iconColor="text-purple-400"
                title="Strong privacy"
                description="All records are encrypted in transit and at rest, with strict access controls."
              />
              <FeatureCard
                iconBg="bg-sky-500/15"
                iconColor="text-sky-400"
                title="Always on"
                description="Access your analytics workspace from any device, any time."
              />
            </div>
          </div>

          {/* Right - Auth card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7 shadow-xl shadow-black/40 backdrop-blur-xl md:p-9">
            <div className="mb-7 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {isSignUp
                  ? "Start exploring crime hotspots and predictive analytics."
                  : "Sign in to access your crime analytics dashboard."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-500"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      className="text-xs font-medium text-slate-400 hover:text-emerald-300"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-500"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : isSignUp ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-slate-900/80 px-3 text-xs text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#EA4335"
                    d="M24 12.5c3.4 0 6 1.5 7.8 2.7l5.7-5.7C34.9 6 29.8 4 24 4 14.8 4 7 9.9 3.7 17.9l6.6 5.1C11.9 18.3 17.4 12.5 24 12.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.5 24c0-1.6-.1-2.8-.4-4H24v8.1h12.6c-.6 3.3-2.8 6.1-6 7.6l6.8 5.3C43.6 36.4 46.5 30.7 46.5 24z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M10.3 29.7A14.7 14.7 0 0 1 9 24c0-1.6.3-3.1.9-4.5L3.3 14.5C1.2 18.7 0 22.9 0 24c0 3.4 1.2 6.6 3.3 10l7-4.3z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M24 44c6.4 0 11.9-2.1 15.9-5.8l-7.6-6c-2 1.5-4.6 2.4-8.3 2.4-6.6 0-12.1-5.8-13.4-10.6L3.3 34.1C7 39.5 14.8 44 24 44z"
                  />
                </svg>
                Continue with Google
              </button>

              <p className="pt-2 text-center text-xs text-slate-400">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => setIsSignUp((prev) => !prev)}
                  className="font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </form>

            <p className="mt-5 text-center text-[11px] text-slate-500">
              By continuing, you agree to the OpenSight Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type FeatureCardProps = {
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
};

function FeatureCard({ iconBg, iconColor, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5/10 px-4 py-3">
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        <span className={`h-5 w-5 rounded-full border border-current ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}
