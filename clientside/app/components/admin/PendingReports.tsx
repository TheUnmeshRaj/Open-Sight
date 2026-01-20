import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Eye, AlertTriangle, MapPin, Calendar, User, FileText, Users } from 'lucide-react';
import { assignOfficerToReport } from '@/lib/supabase/reports';

interface CrimeReport {
  id: string;
  user_id: string;
  crime_type: string;
  description: string;
  location: string;
  district: string;
  date_time: string;
  reporter_name?: string;
  reporter_contact?: string;
  witness_available: boolean;
  evidence_available: boolean;
  priority: "high" | "medium" | "low";
  status: string;
  verification_status: "pending" | "approved" | "rejected";
  created_at: string;
  user_profile?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

interface PendingReportsProps {
  onUpdate: (count: number) => void;
}

export default function PendingReports({ onUpdate }: PendingReportsProps) {
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableOfficers, setAvailableOfficers] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingReports();

    // Subscribe to real-time updates
    const supabase = createClient();
    const channel = supabase
      .channel('pending-reports')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crime_reports',
          filter: 'verification_status=eq.pending'
        },
        () => {
          fetchPendingReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingReports = async () => {
    try {
      const supabase = createClient();
      
      // First fetch reports with user IDs
      const { data: reportsData, error: reportsError } = await supabase
        .from('crime_reports')
        .select('*')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Then fetch user profiles for those reports
      if (reportsData && reportsData.length > 0) {
        const userIds = [...new Set(reportsData.map(r => r.user_id))];
        
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profile')
          .select('id, full_name, email, phone')
          .in('id', userIds);

        if (profilesError) console.error('Error fetching profiles:', profilesError);

        // Merge profile data with reports
        const profileMap = (profiles || []).reduce((acc: any, p: any) => {
          acc[p.id] = p;
          return acc;
        }, {});

        const enrichedReports = reportsData.map(report => ({
          ...report,
          user_profile: profileMap[report.user_id] || {}
        }));

        setReports(enrichedReports);
        onUpdate(enrichedReports.length);
      } else {
        setReports([]);
        onUpdate(0);
      }
    } catch (error) {
      console.error('Error fetching pending reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (reportId: string, action: "approved" | "rejected") => {
    setProcessing(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('crime_reports')
        .update({
          verification_status: action,
          verified_at: new Date().toISOString(),
          status: action === 'approved' ? 'investigating' : 'rejected'
        })
        .eq('id', reportId);

      if (error) throw error;

      // Refresh the list
      await fetchPendingReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Error verifying report:', error);
      alert('Failed to process report. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleAssignOfficer = async (officerId: string) => {
    if (!selectedReport) return;
    setProcessing(true);
    try {
      // Use reports helper to assign
      const { report, officer } = await assignOfficerToReport(selectedReport.id, officerId);

      // Refresh data
      await fetchPendingReports();
      setShowAssignModal(false);
      setSelectedReport(null);

      alert(`Assigned ${officer.name} to the report.`);

      // Invoke callback so admin pending count updates
      onUpdate((await (await createClient()).from('crime_reports').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending')).count || 0);
    } catch (err) {
      console.error('Assign error:', err);
      alert('Failed to assign officer. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
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
    <div>
      {reports.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
          <p className="text-slate-300">No pending reports to review at the moment.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white capitalize">
                        {report.crime_type.replace(/_/g, ' ')}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-4 h-4" />
                        <span>{report.location}, {report.district}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(report.date_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <User className="w-4 h-4" />
                        <span>{report.user_profile?.full_name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <FileText className="w-4 h-4" />
                        <span>Submitted: {new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 mt-3 line-clamp-2">{report.description}</p>

                    <div className="flex gap-2 mt-3">
                      {report.witness_available && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                          Witness Available
                        </span>
                      )}
                      {report.evidence_available && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                          Evidence Available
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReport(report)}
                    className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Report Detail Modal */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-white capitalize mb-2">
                        {selectedReport.crime_type.replace(/_/g, ' ')}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase ${getPriorityColor(selectedReport.priority)}`}>
                        {selectedReport.priority} PRIORITY
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Report Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Report Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm">Location</p>
                        <p className="text-white">{selectedReport.location}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">District</p>
                        <p className="text-white">{selectedReport.district}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Date & Time</p>
                        <p className="text-white">{new Date(selectedReport.date_time).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Submitted</p>
                        <p className="text-white">{new Date(selectedReport.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                    <p className="text-slate-300 bg-white/5 p-4 rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>

                  {/* Reporter Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Reporter Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm">Name</p>
                        <p className="text-white">{selectedReport.user_profile?.full_name || selectedReport.reporter_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Email</p>
                        <p className="text-white">{selectedReport.user_profile?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Contact</p>
                        <p className="text-white">{selectedReport.reporter_contact || selectedReport.user_profile?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Additional Information</h3>
                    <div className="flex gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedReport.witness_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {selectedReport.witness_available ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span>Witness {selectedReport.witness_available ? 'Available' : 'Not Available'}</span>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedReport.evidence_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {selectedReport.evidence_available ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span>Evidence {selectedReport.evidence_available ? 'Available' : 'Not Available'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleVerification(selectedReport.id, 'approved')}
                      disabled={processing}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve & Investigate
                    </button>

                    <button
                      onClick={async () => {
                        if (selectedReport?.verification_status !== 'approved') {
                          const proceed = confirm('This report is not approved. Approve it now and assign an officer?');
                          if (!proceed) return;

                          setProcessing(true);
                          try {
                            await handleVerification(selectedReport.id, 'approved');
                          } catch (err) {
                            console.error('Approve before assign failed:', err);
                            alert('Unable to approve report. Please try again.');
                            setProcessing(false);
                            return;
                          }
                          setProcessing(false);
                        }

                        // Open assign modal, fetch available officers
                        try {
                          const supabase = createClient();
                          const { data: officers } = await supabase
                            .from('officers')
                            .select('*')
                            .eq('status', 'available')
                            .order('name', { ascending: true });

                          setAvailableOfficers(officers || []);
                          setShowAssignModal(true);
                        } catch (err) {
                          console.error('Failed to fetch available officers:', err);
                          alert('Unable to load officers. Please try again.');
                        }
                      }}
                      disabled={processing}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      Assign Officer
                    </button>

                    <button
                      onClick={() => handleVerification(selectedReport.id, 'rejected')}
                      disabled={processing}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assign Officer Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Assign Officer</h3>
                  <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white" title="Close assign modal">Close</button>
                </div>

                <div className="p-6 space-y-4">
                  {availableOfficers.length === 0 ? (
                    <div className="text-center py-12 text-slate-300">No available officers right now.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {availableOfficers.map((off) => (
                        <div key={off.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold">{off.name} <span className="text-slate-400 text-sm">({off.unit})</span></div>
                            <div className="text-slate-400 text-sm">Badge: {off.badge_number} • {off.current_location}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAssignOfficer(off.id)}
                              disabled={processing}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold"
                            >
                              Assign
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
