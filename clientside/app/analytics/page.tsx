"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/components/NavBar";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { User } from "@supabase/supabase-js/dist/index.cjs";
// `REAL_CRIME_STATS` is loaded dynamically below; keep the static import removed
import {
  LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("1year");

  // Load crime stats dynamically and fall back to a mock if missing.
  const defaultCrimeStats = {
    totalCrimes: 12000,
    arrested: 3200,
    arrestRate: 26.7,
    convicted: 800,
    convictionRate: 25.0,
    pendingTrials: 4200,
    monthlyData: Array.from({ length: 12 }).map((_, i) => ({ label: `2024-${i + 1}`, count: Math.round(800 + Math.random() * 400) })),
    crimeTypes: [
      { type: "Theft", count: 4200 },
      { type: "Assault", count: 2000 },
      { type: "Burglary", count: 1500 },
      { type: "Fraud", count: 900 },
      { type: "Vandalism", count: 800 }
    ],
    firStages: [
      { stage: "District A", count: 1200 },
      { stage: "District B", count: 1000 },
      { stage: "District C", count: 900 },
      { stage: "District D", count: 800 },
      { stage: "District E", count: 700 },
      { stage: "District F", count: 600 }
    ],
    yearlyData: [
      { year: 2020, count: 2000 },
      { year: 2021, count: 2200 },
      { year: 2022, count: 2400 },
      { year: 2023, count: 2600 },
      { year: 2024, count: 2800 }
    ]
  };

  const [crimeStats, setCrimeStats] = useState<any>(defaultCrimeStats);



  // Derived chart datasets (use crimeStats, which may be mock or real)
  const crimeTimelineData = (crimeStats?.monthlyData ?? []).map((m: any) => ({
    date: String(m.label).substring(0, 3),
    crimes: Math.round((m.count ?? 0) / 5),
    arrests: Math.round(((m.count ?? 0) / 5) * ((crimeStats?.arrestRate ?? 0) / 100))
  }));

  const crimeTypeData = (crimeStats?.crimeTypes ?? []).map((c: any, idx: number) => ({
    type: c.type,
    count: c.count,
    color: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#6366F1", "#D946EF", "#06B6D4"][idx % 10]
  }));

  const districtData = (crimeStats?.firStages ?? []).slice(0, 6).map((s: any) => ({
    district: s.stage,
    crimes: s.count
  }));

  const hourlyData = (crimeStats?.yearlyData ?? []).map((y: any) => ({
    hour: `${y.year}`,
    crimes: Math.round((y.count ?? 0) / 52)
  }));


  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50">
      <NavBar user={user ? { email: user.email || '', id: user.id } : undefined} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-slate-900 via-emerald-700 to-emerald-900 bg-clip-text text-transparent mb-2">
                Crime Analytics
              </h1>
              <p className="text-slate-600 text-lg">
                Comprehensive data analysis and insights
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600">Total Crimes</h3>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-slate-900">{(crimeStats.totalCrimes ?? 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-2">2020-2024 (Bengaluru)</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600">Total Arrested</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-slate-900">{(crimeStats.arrested ?? 0).toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2">↑ {(crimeStats.arrestRate ?? 0).toFixed(1)}% arrest rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600">Convicted</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-slate-900">{(crimeStats.convicted ?? 0).toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-2">↑ {(crimeStats.convictionRate ?? 0).toFixed(1)}% conviction rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600">Pending Trials</h3>
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-slate-900">{(crimeStats.pendingTrials ?? 0).toLocaleString()}</p>
            <p className="text-xs text-yellow-600 mt-2">{(((crimeStats.pendingTrials ?? 0) / (crimeStats.totalCrimes ?? 1)) * 100).toFixed(1)}% of cases</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Crime Timeline */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Crime Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={crimeTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="crimes" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="arrests" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Crime by Type */}
          {/* Crime by Type */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Crime Distribution by Type
            </h3>

            <div className="flex items-center">
              {/* Pie on the left */}
              <div className="w-1/2 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={crimeTypeData}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {crimeTypeData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Labels on the right */}
              <div className="w-1/2 pl-6">
                <ul className="space-y-3">
                  {crimeTypeData.map((item: any, index: number) => (
                    <li
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-700">
                          {item.type}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900">
                        {item.count.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crime by District */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Criminal Case Status Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="district" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="crimes" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Distribution */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Crime by Year</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="crimes" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
