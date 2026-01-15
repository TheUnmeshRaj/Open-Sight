"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface NavBarProps {
  user?: { email: string };
}

const NavBar: React.FC<NavBarProps> = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSignout = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/50 transition-shadow">
                <svg
                  className="w-6 h-6 text-white"
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
                <h1 className="text-xl font-bold bg-linear-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  OpenSight
                </h1>
                <p className="text-xs text-slate-400">Crime Analytics</p>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-all duration-300 ${
                isActive("/")
                  ? "text-emerald-400 border-b-2 border-emerald-400 pb-1"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/predictions"
              className={`text-sm font-medium transition-all duration-300 ${
                isActive("/predictions")
                  ? "text-emerald-400 border-b-2 border-emerald-400 pb-1"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Predictions
            </Link>
            <Link
              href="/analytics"
              className={`text-sm font-medium transition-all duration-300 ${
                isActive("/analytics")
                  ? "text-emerald-400 border-b-2 border-emerald-400 pb-1"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Analytics
            </Link>
          </div>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <p className="text-sm text-slate-300">{user.email}</p>
              </div>
              <div className="relative">
                <button 
                type="button"
                aria-label="Toggle mobile menu"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-lg animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={handleSignout}
                      disabled={loading}
                      className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors rounded-lg border-t border-white/5"
                    >
                      {loading ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
