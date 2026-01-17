"use client";

import React from "react";

export interface HotspotData {
  name: string;
  incidents: number;
  change: number;
}

export interface TrendData {
  title: string;
  change: number;
  details: string;
}

export interface ReportMetric {
  value: string;
  label: string;
}

interface WeeklyReportProps {
  dateRange: string;
  hotspots: HotspotData[];
  trends: TrendData[];
  metrics: ReportMetric[];
  onDownload?: () => void;
  onGenerateCustom?: () => void;
}

export default function WeeklyReport({
  dateRange,
  hotspots,
  trends,
  metrics,
  onDownload,
  onGenerateCustom,
}: WeeklyReportProps) {
  const getHotspotColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-red-50 border-red-100 text-red-800";
      case 1:
        return "bg-yellow-50 border-yellow-100 text-yellow-800";
      case 2:
        return "bg-blue-50 border-blue-100 text-blue-800";
      default:
        return "bg-slate-50 border-slate-100 text-slate-800";
    }
  };

  const getHotspotBadge = (index: number) => {
    switch (index) {
      case 0:
        return "text-red-600";
      case 1:
        return "text-yellow-600";
      case 2:
        return "text-blue-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-black">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Weekly Intelligence Report</h2>
            <p className="text-sm text-slate-600 mt-1">{dateRange}</p>
            <p className="text-xs text-slate-500 mt-1">Key patterns and response metrics</p>
          </div>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-red-600 text-grey rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-semibold">Download PDF</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Crime Hotspots */}
        <div>
          <h4 className="font-semibold text-base flex items-center gap-2 mb-3 text-slate-900">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span>Crime Hotspots</span>
          </h4>
          <div className="flex overflow-x-auto gap-3 pb-2">
            {hotspots.map((hotspot, index) => (
              <div
                key={index}
                className={`flex-shrink-0 w-44 border rounded-xl p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg ${getHotspotColor(index)}`}
              >
                <p className={`text-sm font-bold ${getHotspotBadge(index)}`}>
                  {index + 1}. {hotspot.name}
                </p>
                <p className="text-xs text-slate-700 mt-2">
                  <span className="font-bold">{hotspot.incidents} incidents</span>{" "}
                  <span className={hotspot.change >= 0 ? "text-red-600" : "text-green-600"}>
                    ({hotspot.change >= 0 ? "+" : ""}
                    {hotspot.change}%)
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Emerging Trends */}
        <div>
          <h4 className="font-semibold text-base flex items-center gap-2 mb-3 text-slate-900">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span>Emerging Trends</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trends.map((trend, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-all duration-300 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span>{trend.title}</span>
                  <span className={`text-xs font-bold ${trend.change >= 0 ? "text-red-600" : "text-green-600"}`}>
                    {trend.change >= 0 ? "↑" : "↓"} {Math.abs(trend.change)}%
                  </span>
                </p>
                <p className="text-xs text-slate-600 mt-1">{trend.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Response Metrics */}
        <div>
          <h4 className="font-semibold text-base flex items-center gap-2 mb-3 text-slate-900">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>Response Metrics</span>
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-all duration-300 hover:shadow-md hover:border-emerald-300"
              >
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-xs text-slate-600 mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <button
          onClick={onGenerateCustom}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generate Custom Report
        </button>
      </div>
    </div>
  );
}
