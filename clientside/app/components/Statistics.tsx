"use client";

import React from "react";

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
    trend,
    trendLabel,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    unit?: string;
    gradient: string;
    delay: number;
    trend?: { direction: 'up' | 'down'; percentage: number; label: string };
    trendLabel?: string;
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
      {trend && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className={`flex items-center gap-1 font-bold ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
          </span>
          <span className="text-slate-500">{trend.label}</span>
        </div>
      )}
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
          trend={{ direction: 'down', percentage: 12, label: 'from last week' }}
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
          trend={{ direction: 'down', percentage: 8, label: 'from yesterday' }}
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
          trend={{ direction: 'down', percentage: 22, label: 'improvement' }}
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
          trend={{ direction: 'up', percentage: 15, label: 'from yesterday' }}
        />
      </div>
    </div>
  );
};

export default Statistics;
