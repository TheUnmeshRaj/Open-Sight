"use client";

import type { FormEvent } from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import LoadingSpinner from "@/app/components/LoadingSpinner";

/* =======================
   Particle Background
======================= */

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<any[]>([]);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null; active: boolean }>({
    x: null,
    y: null,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const _ctx = canvas.getContext("2d");
    if (!_ctx) return;
    const ctx: CanvasRenderingContext2D = _ctx;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = window.innerWidth < 768;

    const config = {
      particleCount: isMobile ? 35 : 90,
      maxSize: isMobile ? 2.2 : 2.6,
      minSize: 0.6,
      maxSpeed: isMobile ? 0.8 : 1.1,
      connectionDistance: isMobile ? 90 : 140,
      particleColor: "#818CF8",
      lineColor: "rgba(129, 140, 248, 0.17)",
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      specialColor: string;
      opacity?: number;

      constructor(x?: number, y?: number, specialColor = "") {
        this.x = x ?? Math.random() * width;
        this.y = y ?? Math.random() * height;
        this.size =
          Math.random() * (config.maxSize - config.minSize) + config.minSize;
        this.speedX = (Math.random() - 0.5) * config.maxSpeed * 2;
        this.speedY = (Math.random() - 0.5) * config.maxSpeed * 2;
        this.specialColor = specialColor;
        this.opacity = specialColor ? 1 : undefined;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (!this.specialColor) {
          if (this.x > width) this.x = 0;
          if (this.x < 0) this.x = width;
          if (this.y > height) this.y = 0;
          if (this.y < 0) this.y = height;
        } else {
          this.opacity! *= 0.9923;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        if (this.specialColor && this.opacity !== undefined) {
          ctx.globalAlpha = this.opacity;
        }
        ctx.fillStyle = this.specialColor || config.particleColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function initParticles() {
      particlesRef.current = [];
      for (let i = 0; i < config.particleCount; i++) {
        particlesRef.current.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particlesRef.current) {
        p.update();
        p.draw(ctx);
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10"
      style={{ mixBlendMode: "screen", pointerEvents: "none" }}
    />
  );
}

/* =======================
   Login Page
======================= */

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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#312e81_1px,transparent_1px),linear-gradient(to_bottom,#312e81_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)]" />

      {/* Floating orbs */}
      <div className="absolute -left-40 -top-40 z-0 h-80 w-80 animate-pulse rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 z-0 h-80 w-80 animate-pulse rounded-full bg-purple-500/20 blur-3xl animation-delay-2000" />
      <div className="absolute left-1/2 top-1/2 z-0 h-60 w-60 animate-pulse rounded-full bg-blue-500/20 blur-3xl animation-delay-4000" />

      <div className="relative z-20 flex min-h-screen flex-col lg:flex-row items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          {/* Mobile: Auth Form First */}
          <div className="block lg:hidden mb-12">
            {/* Centered logo/title */}
            <div className="space-y-6 text-center mb-8">
              <div className="group inline-flex flex-col items-center gap-4 mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/50 transition-transform group-hover:scale-105">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    OpenSight
                  </h1>
                  <p className="text-sm font-medium text-indigo-400">
                    Crime Analytics Platform
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-blue-500/50 opacity-20 blur-2xl" />

                  {/* Card */}
                  <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <h2 className="text-3xl font-bold text-white">
                        {isSignUp ? "Join OpenSight" : "Welcome Back"}
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">
                        {isSignUp
                          ? "Create your account to get started"
                          : "Sign in to access your dashboard"}
                      </p>
                    </div>

                    {/* OAuth */}
                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={loading}
                      className="group relative mb-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform group-hover:translate-x-full duration-1000" />
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

                    {/* Divider */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700/50" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-3 text-slate-500">
                          Or continue with email
                        </span>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none ring-indigo-500/40 transition-all placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                            Password
                          </label>
                          {!isSignUp && (
                            <button
                              type="button"
                              className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                            >
                              Forgot?
                            </button>
                          )}
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete={isSignUp ? "new-password" : "current-password"}
                          className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none ring-indigo-500/40 transition-all placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4"
                          placeholder="••••••••••"
                        />
                      </div>

                      {error && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/50 transition-all hover:shadow-indigo-500/70 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:scale-100"
                      >
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform group-hover:translate-x-full duration-1000" />
                        <span className="relative flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <LoadingSpinner size="sm" />
                              {isSignUp ? "Creating account..." : "Signing in..."}
                            </>
                          ) : (
                            <>
                              {isSignUp ? "Create Account" : "Sign In"}
                              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </span>
                      </button>

                      <p className="text-center text-sm text-slate-400">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                          type="button"
                          onClick={() => setIsSignUp((prev) => !prev)}
                          className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                        >
                          {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                      </p>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-500">
                      By continuing, you agree to our{" "}
                      <a href="#" className="text-slate-400 hover:text-slate-300">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-slate-400 hover:text-slate-300">
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Features Below Form */}
          <div className="block lg:hidden space-y-8">
            <div className="space-y-4">
              <FeatureCard
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                title="Real-time Intelligence"
                description="ML-powered hotspot predictions that update continuously with new data patterns."
                gradient="from-indigo-500/20 to-indigo-600/20"
                textColor="text-indigo-400"
              />
              <FeatureCard
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                title="Enterprise Security"
                description="Bank-grade encryption with role-based access and comprehensive audit trails."
                gradient="from-purple-500/20 to-purple-600/20"
                textColor="text-purple-400"
              />
              <FeatureCard
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                }
                title="Cloud Native"
                description="Access your analytics from anywhere with 99.9% uptime and instant sync."
                gradient="from-blue-500/20 to-blue-600/20"
                textColor="text-blue-400"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <StatCard value="98%" label="Accuracy" />
              <StatCard value="50K+" label="Daily Insights" />
              <StatCard value="24/7" label="Monitoring" />
            </div>
          </div>

          {/* Desktop: Side by side layout */}
          <div className="hidden lg:grid grid-cols-2 gap-12">
            {/* Left side - Branding & Features */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Desktop Logo */}
              <div className="space-y-6">
                <div className="group inline-flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/50 transition-transform group-hover:scale-105">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white">
                      OpenSight
                    </h1>
                    <p className="text-sm font-medium text-indigo-400">
                      Crime Analytics Platform
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature cards */}
              <div className="space-y-4">
                <FeatureCard
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                  title="Real-time Intelligence"
                  description="ML-powered hotspot predictions that update continuously with new data patterns."
                  gradient="from-indigo-500/20 to-indigo-600/20"
                  textColor="text-indigo-400"
                />
                <FeatureCard
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                  title="Enterprise Security"
                  description="Bank-grade encryption with role-based access and comprehensive audit trails."
                  gradient="from-purple-500/20 to-purple-600/20"
                  textColor="text-purple-400"
                />
                <FeatureCard
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  }
                  title="Cloud Native"
                  description="Access your analytics from anywhere with 99.9% uptime and instant sync."
                  gradient="from-blue-500/20 to-blue-600/20"
                  textColor="text-blue-400"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <StatCard value="98%" label="Accuracy" />
                <StatCard value="50K+" label="Daily Insights" />
                <StatCard value="24/7" label="Monitoring" />
              </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-blue-500/50 opacity-20 blur-2xl" />

                  {/* Card */}
                  <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <h2 className="text-3xl font-bold text-white">
                        {isSignUp ? "Join OpenSight" : "Welcome Back"}
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">
                        {isSignUp
                          ? "Create your account to get started"
                          : "Sign in to access your dashboard"}
                      </p>
                    </div>

                    {/* OAuth */}
                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={loading}
                      className="group relative mb-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform group-hover:translate-x-full duration-1000" />
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

                    {/* Divider */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700/50" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-3 text-slate-500">
                          Or continue with email
                        </span>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none ring-indigo-500/40 transition-all placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                            Password
                          </label>
                          {!isSignUp && (
                            <button
                              type="button"
                              className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                            >
                              Forgot?
                            </button>
                          )}
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete={isSignUp ? "new-password" : "current-password"}
                          className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none ring-indigo-500/40 transition-all placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4"
                          placeholder="••••••••••"
                        />
                      </div>

                      {error && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/50 transition-all hover:shadow-indigo-500/70 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:scale-100"
                      >
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform group-hover:translate-x-full duration-1000" />
                        <span className="relative flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <LoadingSpinner size="sm" />
                              {isSignUp ? "Creating account..." : "Signing in..."}
                            </>
                          ) : (
                            <>
                              {isSignUp ? "Create Account" : "Sign In"}
                              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </span>
                      </button>

                      <p className="text-center text-sm text-slate-400">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                          type="button"
                          onClick={() => setIsSignUp((prev) => !prev)}
                          className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                        >
                          {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                      </p>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-500">
                      By continuing, you agree to our{" "}
                      <a href="#" className="text-slate-400 hover:text-slate-300">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-slate-400 hover:text-slate-300">
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  textColor: string;
};

function FeatureCard({ icon, title, description, gradient, textColor }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-white/10 hover:bg-white/[0.05]">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} ${textColor} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  value: string;
  label: string;
};

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center backdrop-blur-sm">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  );
}