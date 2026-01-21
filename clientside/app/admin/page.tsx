"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "@/app/components/NavBar";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { User } from "@supabase/supabase-js/dist/index.cjs";
import PendingReports from "@/app/components/admin/PendingReports";
import OfficerManagement from "@/app/components/admin/OfficerManagement";
import AdminStats from "@/app/components/admin/AdminStats";
import { Shield, Users, FileText, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"reports" | "officers" | "stats">("reports");
  const [pendingCount, setPendingCount] = useState(0);
  const [availableOfficersCount, setAvailableOfficersCount] = useState(0);
  // Controls for reports list (filter, sort, search)
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [sortBy, setSortBy] = useState<'created_at' | 'priority'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Check if user is admin
        const { data: profile } = await supabase
          .from('user_profile')
          .select('is_admin, role')
          .eq('id', user.id)
          .single();

        if (!profile?.is_admin && profile?.role !== 'admin') {
          // Not an admin, redirect to normal dashboard
          router.push("/");
          return;
        }

        setUser(user);
        setIsAdmin(true);

        // Fetch pending reports count
        const { count } = await supabase
          .from('crime_reports')
          .select('*', { count: 'exact', head: true })
          .eq('verification_status', 'pending');

        setPendingCount(count || 0);

        // Subscribe to real-time updates for pending count and officers
        const channel = supabase
          .channel('admin-pending-count')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'crime_reports'
            },
            () => {
              // Refetch count when reports change
              supabase
                .from('crime_reports')
                .select('*', { count: 'exact', head: true })
                .eq('verification_status', 'pending')
                .then(({ count }) => {
                  setPendingCount(count || 0);
                });
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'officers'
            },
            () => {
              // Refetch available officers
              supabase
                .from('officers')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'available')
                .then(({ count }) => {
                  setAvailableOfficersCount(count || 0);
                });
            }
          )
          .subscribe();

        // Initial fetch for available officers
        const { count: availCount } = await supabase
          .from('officers')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'available');

        setAvailableOfficersCount(availCount || 0);

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.error("Error checking auth:", err);
        router.push("/login");
      } finally {
        setInitializing(false);
      }
    };

    checkAuth();
  }, [router]);

  if (initializing) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavBar user={user ? { email: user.email || '', id: user.id } : undefined} />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-300">Police Command Center</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-slate-300 text-sm">Pending Reports</p>
                  <p className="text-3xl font-bold text-white">{pendingCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-slate-300 text-sm">Active Officers</p>
                  <p className="text-3xl font-bold text-white">{availableOfficersCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-slate-300 text-sm">High Priority</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-300 text-sm">Total Officers</p>
                  <p className="text-3xl font-bold text-white">56001</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "reports"
                ? "text-white border-b-2 border-red-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pending Reports {pendingCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("officers")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "officers"
                ? "text-white border-b-2 border-blue-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Officer Management
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "stats"
                ? "text-white border-b-2 border-green-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Statistics
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "reports" && (
            <>
              <div className="text-white flex items-center gap-3 mb-4">
                <select aria-label="Filter reports" value={reportFilter} onChange={(e) => setReportFilter(e.target.value as any)} className="bg-slate-800/40 text-white p-2 rounded border border-white/20 appearance-none focus:outline-none focus:ring-0 backdrop-blur-sm px-3">
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>

                <select aria-label="Sort by" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-slate-800/40 text-white p-2 rounded border border-white/20 appearance-none focus:outline-none focus:ring-0 backdrop-blur-sm px-3">
                  <option value="created_at">Newest</option>
                  <option value="priority">Priority</option>
                </select>

                <select aria-label="Sort order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="bg-slate-800/40 text-white p-2 rounded border border-white/20 appearance-none focus:outline-none focus:ring-0 backdrop-blur-sm px-3">
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>

                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports..."
                  className="bg-slate-800/30 text-white p-2 rounded flex-1 border border-white/10 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </div>

              <PendingReports
                onUpdate={(count) => setPendingCount(count)}
                filterStatus={reportFilter}
                sortBy={sortBy}
                sortOrder={sortOrder}
                searchQuery={searchQuery}
              />
            </>
          )}

          {activeTab === "officers" && <OfficerManagement />}
          {activeTab === "stats" && <AdminStats />}
        </div>
      </div>
    </div>
  );
}
