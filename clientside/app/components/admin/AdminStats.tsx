import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, FileText, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    pendingReports: 0,
    recentActivity: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const supabase = createClient();

      // Fetch report counts
      const { count: totalCount } = await supabase
        .from('crime_reports')
        .select('*', { count: 'exact', head: true });

      const { count: approvedCount } = await supabase
        .from('crime_reports')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'approved');

      const { count: rejectedCount } = await supabase
        .from('crime_reports')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'rejected');

      const { count: pendingCount } = await supabase
        .from('crime_reports')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');

      // Fetch recent activity
      const { data: recentReports } = await supabase
        .from('crime_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalReports: totalCount || 0,
        approvedReports: approvedCount || 0,
        rejectedReports: rejectedCount || 0,
        pendingReports: pendingCount || 0,
        recentActivity: recentReports || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-slate-300 text-sm">Total Reports</p>
              <p className="text-3xl font-bold text-white">{stats.totalReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-slate-300 text-sm">Approved</p>
              <p className="text-3xl font-bold text-white">{stats.approvedReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-slate-300 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-white">{stats.rejectedReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-slate-300 text-sm">Pending</p>
              <p className="text-3xl font-bold text-white">{stats.pendingReports}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Recent Activity
        </h2>

        <div className="space-y-3">
          {stats.recentActivity.map((report) => (
            <div
              key={report.id}
              className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-white font-semibold capitalize">
                    {report.crime_type.replace(/_/g, ' ')}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-300 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {report.district}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  report.verification_status === 'approved' 
                    ? 'bg-green-500/20 text-green-400'
                    : report.verification_status === 'rejected'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {report.verification_status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {stats.recentActivity.length === 0 && (
          <p className="text-slate-400 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
}
