"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ControlPanel from "@/app/components/ControlPanel";
import Statistics from "@/app/components/Statistics";
import NavBar from "@/app/components/NavBar";
import LoadingSpinner from "@/app/components/LoadingSpinner";

// Dynamically import the map component to avoid SSR issues
const HotspotMap = dynamic(() => import("@/app/components/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-slate-200 to-slate-100 rounded-lg flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  ),
});

interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  riskLevel: "high" | "medium" | "low";
  crimeCount: number;
}

interface Stats {
  hotspotsCount: number;
  totalCrimes: number;
  averageRiskLevel: number;
  predictionAccuracy: number;
  timeSeriesData?: Array<{ date: string; crimes: number; predicted: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [city, setCity] = useState("bangalore");
  const [threshold, setThreshold] = useState(0.5);
  const [timeWindow, setTimeWindow] = useState("current");
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [stats, setStats] = useState<Stats>({
    hotspotsCount: 0,
    totalCrimes: 0,
    averageRiskLevel: 0,
    predictionAccuracy: 0.85,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        router.push("/login");
      } finally {
        setInitializing(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/hotspots?city=${city}&threshold=${threshold}&timeWindow=${timeWindow}`
      );
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching hotspots:", data.error);
        setHotspots(generateMockHotspots());
      } else {
        setHotspots(data.hotspots || generateMockHotspots());
      }
    } catch (err) {
      console.error("Error:", err);
      setHotspots(generateMockHotspots());
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`/api/statistics?city=${city}`);
      const data = await response.json();

      if (!data.error) {
        setStats(data);
      } else {
        setStats({
          hotspotsCount: hotspots.length,
          totalCrimes: 2847,
          averageRiskLevel: 0.62,
          predictionAccuracy: 0.85,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const generateMockHotspots = (): Hotspot[] => {
    const locations: [number, number][] = [
      [12.9352, 77.6245],
      [12.9716, 77.5946],
      [12.935, 77.62],
      [13.0027, 77.5914],
      [12.9142, 77.6391],
    ];

    return locations.map((loc, idx) => ({
      id: `hotspot-${idx}`,
      latitude: loc[0],
      longitude: loc[1],
      riskLevel: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as
        | "high"
        | "medium"
        | "low",
      crimeCount: Math.floor(Math.random() * 50) + 10,
    }));
  };

  useEffect(() => {
    if (user) {
      fetchHotspots();
    }
  }, [user, city, threshold, timeWindow]);

  useEffect(() => {
    if (hotspots.length > 0) {
      fetchStatistics();
    }
  }, [hotspots, city]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Navigation */}
      <NavBar user={user as any} />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-emerald-700 to-emerald-900 bg-clip-text text-transparent mb-2">
                Crime Hotspot Analytics
              </h1>
              <p className="text-slate-600 text-lg">
                Real-time predictions for {city.charAt(0).toUpperCase() + city.slice(1)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchHotspots}
                disabled={loading}
                className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 font-semibold rounded-xl hover:bg-slate-50 hover:border-emerald-300 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? <LoadingSpinner size="sm" /> : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="mb-8 animate-slide-in-down">
          <ControlPanel
            city={city}
            onCityChange={setCity}
            threshold={threshold}
            onThresholdChange={setThreshold}
            timeWindow={timeWindow}
            onTimeWindowChange={setTimeWindow}
            onRefresh={fetchHotspots}
            loading={loading}
          />
        </div>

        {/* Statistics */}
        <div className="mb-8 animate-fade-in-up">
          <Statistics
            hotspotsCount={stats.hotspotsCount}
            totalCrimes={stats.totalCrimes}
            averageRiskLevel={stats.averageRiskLevel}
            predictionAccuracy={stats.predictionAccuracy}
            timeSeriesData={stats.timeSeriesData}
          />
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 mb-8 animate-fade-in-up hover:shadow-2xl transition-all duration-500">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Crime Hotspot Map
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </div>
            </div>
            <p className="text-slate-600 text-sm">
              Interactive map showing crime risk levels across the city
            </p>
          </div>
          <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <HotspotMap hotspots={hotspots} center={[12.9716, 77.5946]} />
          </div>
        </div>

        {/* Hotspots Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 animate-fade-in-up hover:shadow-2xl transition-all duration-500">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Active Hotspots
              </h2>
              <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-bold">
                {hotspots.length} detected
              </span>
            </div>
            <p className="text-slate-600 text-sm">
              High-risk areas requiring immediate attention
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg">
            {hotspots.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Location ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Reported Crimes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Coordinates
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hotspots.map((hotspot, index) => (
                    <tr
                      key={hotspot.id}
                      className="hover:bg-slate-50 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-900">
                          {hotspot.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-4 py-2 text-xs font-bold rounded-full inline-flex items-center gap-2 ${
                            hotspot.riskLevel === "high"
                              ? "bg-red-100 text-red-800 shadow-sm shadow-red-200"
                              : hotspot.riskLevel === "medium"
                              ? "bg-yellow-100 text-yellow-800 shadow-sm shadow-yellow-200"
                              : "bg-green-100 text-green-800 shadow-sm shadow-green-200"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            hotspot.riskLevel === "high" ? "bg-red-500" :
                            hotspot.riskLevel === "medium" ? "bg-yellow-500" : "bg-green-500"
                          }`} />
                          {hotspot.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900 font-semibold">
                          {hotspot.crimeCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600 font-mono">
                          {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-slate-600 font-medium">No hotspots found for the selected criteria</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}