"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StatisticsProps {
  hotspotsCount: number;
  totalCrimes: number;
  averageRiskLevel: number;
  predictionAccuracy: number;
  timeSeriesData?: Array<{ date: string; crimes: number; predicted: number }>;
}

const Statistics: React.FC<StatisticsProps> = ({
  hotspotsCount,
  totalCrimes,
  averageRiskLevel,
  predictionAccuracy,
  timeSeriesData = [],
}) => {
  const StatCard = ({
    icon: Icon,
    label,
    value,
    unit,
    gradient,
    delay,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    unit?: string;
    gradient: string;
    delay: number;
  }) => (
    <div
      className={`bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 animate-fade-in cursor-pointer group`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {Icon}
        </div>
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
      </div>
      <p className="text-slate-600 text-sm font-semibold mb-2 uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{value}</p>
        {unit && <p className="text-sm text-slate-500 font-semibold">{unit}</p>}
      </div>
      <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${gradient} rounded-full animate-shimmer`} style={{ width: '70%' }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          label="Active Hotspots"
          value={hotspotsCount}
          unit="areas"
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          delay={0}
        />

        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          }
          label="Total Crimes"
          value={totalCrimes}
          unit="reported"
          gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          delay={100}
        />

        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          label="Average Risk"
          value={averageRiskLevel.toFixed(2)}
          unit="/10"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={200}
        />

        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Accuracy"
          value={(predictionAccuracy * 100).toFixed(1)}
          unit="%"
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          delay={300}
        />
      </div>

      {/* Trend Chart */}
      {timeSeriesData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 animate-fade-in-up hover:shadow-2xl transition-all duration-500">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Crime Trends Analysis</h3>
            <p className="text-slate-600 text-sm mt-1">Actual crimes vs model predictions over time</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCrimes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "12px", fontWeight: 600 }} />
              <YAxis stroke="#64748b" style={{ fontSize: "12px", fontWeight: 600 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                  padding: "12px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)"
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px", fontWeight: 600 }} />
              <Line
                type="monotone"
                dataKey="crimes"
                stroke="#ef4444"
                strokeWidth={3}
                name="Actual Crimes"
                dot={{ fill: "#ef4444", r: 5, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Predicted"
                dot={{ fill: "#3b82f6", r: 5, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Statistics;
