"use client";

import type { FormEvent, MouseEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message || "Sign up failed");
        setLoading(false);
        return;
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
      const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (oauthError) setError(oauthError.message || 'OAuth failed');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-6 relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl transform rotate-45" />
      <div className="pointer-events-none absolute -right-48 -bottom-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left visual / branding */}
        <div className="hidden md:flex flex-col gap-6 justify-center px-8">
          <div className="bg-white/5 backdrop-blur-md px-5 py-4 rounded-xl border border-white/5">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Open<span className="text-emerald-300">Sight</span></h2>
            <p className="mt-2 text-slate-200/80">Crime hotspot prediction using open data — prioritizing safety for women.</p>
          </div>

          <div className="bg-white/4 p-6 rounded-2xl border border-white/6 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-400/20 rounded-lg flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div className="text-sm text-slate-200/90 font-semibold">Data‑driven Safety</div>
                <div className="text-xs text-slate-300/80">Aggregated, anonymized public data powering actionable hotspot maps.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form card */}
        <div className="bg-white/6 backdrop-blur-lg border border-white/8 rounded-2xl shadow-xl p-8">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome to OpenSight</h1>
                <p className="text-sm text-slate-200/80 mt-1">Sign in to access crime hotspot analyses and safety alerts.</p> 
              </div>
              <div className="hidden sm:block">
                <div className="w-10 h-10 bg-white/8 rounded-lg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-1v2a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-2H5a3 3 0 0 1-3-3V7z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-200/80 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full bg-white/6 border border-white/10 placeholder:text-slate-300 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-200/80 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full bg-white/6 border border-white/10 placeholder:text-slate-300 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-300">By signing in you accept the terms and privacy policy.</div>
              <div className="text-xs text-slate-300 hover:text-white cursor-pointer">Forgot password?</div>
            </div>

            {error && <div className="text-sm text-rose-400">{error}</div>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-semibold py-3 rounded-lg shadow-md transition-transform active:scale-95"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <button
                onClick={handleSignup}
                disabled={loading}
                className="bg-transparent border border-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/6 transition"
                type="button"
              >
                {loading ? "Working..." : "Sign up"}
              </button>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full bg-white/8 hover:bg-white/12 text-white py-3 rounded-lg flex items-center justify-center gap-3 border border-white/6"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" className="inline-block" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 12.5c3.4 0 6 1.5 7.8 2.7l5.7-5.7C34.9 6 29.8 4 24 4 14.8 4 7 9.9 3.7 17.9l6.6 5.1C11.9 18.3 17.4 12.5 24 12.5z"/><path fill="#34A853" d="M46.5 24c0-1.6-.1-2.8-.4-4H24v8.1h12.6c-.6 3.3-2.8 6.1-6 7.6l6.8 5.3C43.6 36.4 46.5 30.7 46.5 24z"/><path fill="#4A90E2" d="M10.3 29.7A14.7 14.7 0 0 1 9 24c0-1.6.3-3.1.9-4.5L3.3 14.5C1.2 18.7 0 22.9 0 24c0 3.4 1.2 6.6 3.3 10l7-4.3z"/><path fill="#FBBC05" d="M24 44c6.4 0 11.9-2.1 15.9-5.8l-7.6-6c-2 1.5-4.6 2.4-8.3 2.4-6.6 0-12.1-5.8-13.4-10.6L3.3 34.1C7 39.5 14.8 44 24 44z"/></svg>
                Continue with Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
