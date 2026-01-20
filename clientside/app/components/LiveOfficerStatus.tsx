import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Clock, MapPin, CheckCircle, AlertCircle, Phone, Shield } from 'lucide-react';

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

interface LiveOfficerStatusProps {
  onlyAvailable?: boolean;
}

export default function LiveOfficerStatus({ onlyAvailable = false }: LiveOfficerStatusProps) {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficers();

    // Subscribe to real-time updates
    const setupSubscription = async () => {
      const supabase = createClient();
      const channel = supabase
        .channel('live-officers-updates', { config: { broadcast: { self: true } } })
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'officers'
          },
          () => {
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
      let query = supabase
        .from('officers')
        .select('*')
        .order('name', { ascending: true });

      if (onlyAvailable) {
        query = query.eq('status', 'available');
      }

      const { data, error } = await query;

      if (error) throw error;
      setOfficers(data || []);
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoading(false);
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
  const totalOfficers = 56001;

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
            <Shield className="w-12 h-12 text-blue-400 opacity-20" />
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

            {/* Status Indicator */}
            <div className={`text-center py-2 rounded-lg font-semibold text-sm ${
              officer.status === 'available'
                ? 'bg-green-500/20 text-green-300'
                : officer.status === 'on_call'
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'bg-red-500/20 text-red-300'
            }`}>
              {officer.status === 'available' ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Ready for Assignment
                </span>
              ) : officer.status === 'on_call' ? (
                <span className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  On an Assignment
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Busy / Unavailable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {officers.length === 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Officers {onlyAvailable ? 'Available' : 'Found'}</h3>
          <p className="text-slate-300">{onlyAvailable ? 'All officers are currently assigned.' : 'Officer list is empty.'}</p>
        </div>
      )}
    </div>
  );
}
