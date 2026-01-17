"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile, getUserAvatarUrl } from "@/lib/supabase/database";

interface NavBarProps {
  user?: { email: string; id?: string };
  onProfileOpen?: () => void;
  onProfileClose?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ user, onProfileOpen, onProfileClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const profile = await getUserProfile(user.id);
        if (profile?.full_name) {
          setFullName(profile.full_name);
        }
        const avatar = getUserAvatarUrl(user.id);
        setAvatarUrl(avatar);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const handleMyProfile = () => {
    setShowMenu(false);
    onProfileOpen?.();
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
                      className="h-6 text-white"
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
              <span className="text-white font-bold hidden sm:inline">OpenSight</span>
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
            <Link
              href="/report"
              className={`text-sm font-medium transition-all duration-300 ${
                isActive("/report")
                  ? "text-emerald-400 border-b-2 border-emerald-400 pb-1"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Report
            </Link>
          </div>

          {/* Live Clock & User Section */}
          <div className="flex items-center gap-4">
            {/* Real-time Clock (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              <div className="text-slate-300 text-sm">
                <div className="font-mono font-semibold">{currentTime}</div>
                <div className="text-xs text-slate-400">{currentDate}</div>
              </div>
            </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 text-white text-sm font-medium group"
                >
                  {/* Avatar */}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-400/30 group-hover:border-emerald-400 transition-all">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName || "Avatar"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-linear-to-br from-emerald-400 to-emerald-600 items-center justify-center text-white text-xs font-bold" style={{ display: 'none' }}>
                      {getInitials(fullName)}
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-xs font-semibold text-emerald-300">
                      {fullName?.split(" ")[0] || "User"}
                    </span>
                 
                  </div>

                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      showMenu ? "rotate-180" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                    {/* Profile Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-white/5">
                      <p className="text-sm font-semibold text-white">{fullName || "User"}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={handleMyProfile}
                      className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      My Profile
                    </button>

                    <button
                      onClick={handleSignout}
                      disabled={loading}
                      className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors border-t border-white/5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      {loading ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          </div>

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
