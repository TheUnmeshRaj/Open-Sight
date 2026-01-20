import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Users, MapPin, Clock, CheckCircle, Phone, Shield, Plus } from 'lucide-react';

interface Officer {
  id: string;
  name: string;
  unit: string;
  status: "available" | "on_call" | "busy";
  last_assignment: string;
  current_location: string;
  badge_number: string;
  phone?: string;
  assigned_district?: string;
}

export default function OfficerManagement() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignReports, setAssignReports] = useState<any[]>([]);
  const [addForm, setAddForm] = useState({ name: '', badge_number: '', unit: '', current_location: '', phone: '' });

  useEffect(() => {
    fetchOfficers();

    // Subscribe to real-time updates with better setup
    const setupSubscription = async () => {
      const supabase = createClient();
      const channel = supabase
        .channel('officers-updates', { config: { broadcast: { self: true } } })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'officers' }, (payload) => {
          fetchOfficers();
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'officers' }, (payload) => {
          fetchOfficers();
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'officers' }, (payload) => {
          fetchOfficers();
        })
        .subscribe();

      return channel;
    };

    let channel: any = null;
    setupSubscription().then((ch: any) => {
      channel = ch;
    });

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setOfficers(data || []);
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOfficer = async () => {
    try {
      const { name, badge_number, unit, current_location, phone } = addForm;
      if (!name || !badge_number || !unit) {
        alert('Name, badge number and unit are required');
        return;
      }

      const { data } = await (await import('@/lib/supabase/officers')).addOfficer({
        name,
        badge_number,
        unit,
        status: 'available',
        last_assignment: new Date().toISOString(),
        current_location: current_location || 'Unknown',
        phone
      });

      setAddForm({ name: '', badge_number: '', unit: '', current_location: '', phone: '' });
      setShowAddModal(false);
      await fetchOfficers();
      alert(`Officer ${data.name} added.`);
    } catch (err) {
      console.error('Add officer error:', err);
      alert('Failed to add officer. Check console.');
    }
  };

  const openAssignModal = async (officer: Officer) => {
    setSelectedOfficer(officer);
    try {
      const reports = await (await import('@/lib/supabase/reports')).getUnassignedReports();
      setAssignReports(reports || []);
      setShowAssignModal(true);
    } catch (err) {
      console.error('Failed to fetch unassigned reports:', err);
      alert('Unable to load reports.');
    }
  };

  const handleAssignToReport = async (reportId: string) => {
    if (!selectedOfficer) return;

    try {
      const { report, officer } = await (await import('@/lib/supabase/reports')).assignOfficerToReport(reportId, selectedOfficer.id);
      setShowAssignModal(false);
      setSelectedOfficer(null);
      await fetchOfficers();
      alert(`Assigned ${officer.name} to the report.`);
    } catch (err) {
      console.error('Assign error:', err);
      alert('Failed to assign officer.');
    }
  };

  const handleStatusUpdate = async (officerId: string, newStatus: Officer['status']) => {
    try {
      const supabase = createClient();
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'on_call' || newStatus === 'busy') {
        updateData.last_assignment = new Date().toISOString();
      }

      const { error } = await supabase
        .from('officers')
        .update(updateData)
        .eq('id', officerId);

      if (error) throw error;

      // Update local state immediately for UI responsiveness
      const updatedOfficers = officers.map(officer =>
        officer.id === officerId
          ? { ...officer, status: newStatus, last_assignment: updateData.last_assignment || officer.last_assignment }
          : officer
      );
      setOfficers(updatedOfficers);

      // Then refetch to ensure we have latest data
      setTimeout(() => fetchOfficers(), 100);
    } catch (error) {
      console.error('Error updating officer status:', error);
      alert('Failed to update officer status. Please try again.');
      // Refetch on error to restore correct state
      fetchOfficers();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'on_call':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'busy':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const availableOfficers = officers.filter(o => o.status === 'available');
  const totalOfficers = 56001; // Fixed total as mentioned

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Officer Deployment</h2>
              <p className="text-slate-300">Active Officers</p>
              <p className="text-3xl font-bold text-white mt-2">
                {availableOfficers.length} <span className="text-slate-400 text-lg">available of {totalOfficers} total</span>
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Officer
            </button>
          </div>
        </div>
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {officers.map((officer) => (
          <div
            key={officer.id}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
          >
            {/* Officer Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {getInitials(officer.name)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{officer.name}</h3>
                <p className="text-slate-300 text-sm">Unit: {officer.unit}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border uppercase ${getStatusColor(officer.status)}`}>
                {officer.status.replace('_', ' ')}
              </span>
            </div>

            {/* Officer Details */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4" />
                <span>Last assignment: {getTimeAgo(officer.last_assignment)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4" />
                <span>Current location: {officer.current_location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="w-4 h-4" />
                <span>Badge: {officer.badge_number}</span>
              </div>
              {officer.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4" />
                  <span>{officer.phone}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {officer.status === 'available' ? (
                <button
                  onClick={() => openAssignModal(officer)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-all text-sm"
                >
                  Assign
                </button>
              ) : (
                <button
                  onClick={() => handleStatusUpdate(officer.id, 'available')}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-all text-sm"
                >
                  Mark Available
                </button>
              )}
              {officer.status === 'on_call' && (
                <button
                  onClick={() => handleStatusUpdate(officer.id, 'busy')}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-all text-sm"
                >
                  Busy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {officers.length === 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Officers Found</h3>
          <p className="text-slate-300 mb-4">Add officers to start managing deployments.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add First Officer
          </button>
        </div>
      )}

      {/* View All Officers Button */}
      {officers.length > 0 && (
        <div className="mt-6 text-center">
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all border border-white/20">
            View All Officers
          </button>
        </div>
      )}

      {/* Add Officer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Add Officer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white" title="Close add officer modal">Close</button>
            </div>

            <div className="space-y-3">
              <input className="w-full p-3 rounded bg-slate-700 text-white" placeholder="Full name" value={addForm.name} onChange={(e) => setAddForm((s) => ({ ...s, name: e.target.value }))} />
              <input className="w-full p-3 rounded bg-slate-700 text-white" placeholder="Badge number" value={addForm.badge_number} onChange={(e) => setAddForm((s) => ({ ...s, badge_number: e.target.value }))} />
              <input className="w-full p-3 rounded bg-slate-700 text-white" placeholder="Unit" value={addForm.unit} onChange={(e) => setAddForm((s) => ({ ...s, unit: e.target.value }))} />
              <input className="w-full p-3 rounded bg-slate-700 text-white" placeholder="Current location" value={addForm.current_location} onChange={(e) => setAddForm((s) => ({ ...s, current_location: e.target.value }))} />
              <input className="w-full p-3 rounded bg-slate-700 text-white" placeholder="Phone (optional)" value={addForm.phone} onChange={(e) => setAddForm((s) => ({ ...s, phone: e.target.value }))} />

              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded bg-gray-600 text-white">Cancel</button>
                <button onClick={handleAddOfficer} className="px-4 py-2 rounded bg-emerald-500 text-white">Add Officer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign To Report Modal */}
      {showAssignModal && selectedOfficer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Assign {selectedOfficer.name} to a Report</h3>
              <button onClick={() => { setShowAssignModal(false); setSelectedOfficer(null); }} className="text-slate-400 hover:text-white" title="Close assign modal">Close</button>
            </div>

            <div className="p-6 space-y-4">
              {assignReports.length === 0 ? (
                <div className="text-center py-12 text-slate-300">No unassigned reports available.</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {assignReports.map((r) => (
                    <div key={r.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">{r.crime_type.replace('_', ' ')} <span className="text-slate-400 text-sm">• {r.location}</span></div>
                        <div className="text-slate-400 text-sm">{r.reporter_name || r.user_profile?.full_name || 'Anonymous'} • {new Date(r.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAssignToReport(r.id)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-semibold">Assign</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
