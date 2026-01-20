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

  useEffect(() => {
    fetchOfficers();

    // Subscribe to real-time updates with better setup
    const setupSubscription = async () => {
      const supabase = createClient();
      const channel = supabase
        .channel('officers-updates', { config: { broadcast: { self: true } } })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'officers'
          },
          (payload) => {
            console.log('New officer:', payload.new);
            fetchOfficers();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'officers'
          },
          (payload) => {
            console.log('Officer updated:', payload.new);
            fetchOfficers();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'officers'
          },
          (payload) => {
            console.log('Officer deleted:', payload.old);
            fetchOfficers();
          }
        )
        .subscribe();

      return channel;
    };

    let channel: any;
    setupSubscription().then(ch => {
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
                  onClick={() => handleStatusUpdate(officer.id, 'on_call')}
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
    </div>
  );
}
