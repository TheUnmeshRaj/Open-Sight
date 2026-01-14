"use client";

import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface ControlPanelProps {
  city: string;
  onCityChange: (city: string) => void;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  timeWindow: string;
  onTimeWindowChange: (window: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  city,
  onCityChange,
  threshold,
  onThresholdChange,
  timeWindow,
  onTimeWindowChange,
  onRefresh,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 animate-slide-in-down hover:shadow-2xl transition-all duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            City Selection
          </label>
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            aria-label="City Selection"
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all hover:border-emerald-300 shadow-sm cursor-pointer"
          >
            <option value="bangalore">🇮🇳 Bangalore</option>
            <option value="delhi">🇮🇳 Delhi</option>
            <option value="mumbai">🇮🇳 Mumbai</option>
            <option value="newyork">🇺🇸 New York</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Risk Threshold: <span className="text-emerald-600">{threshold.toFixed(1)}</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={threshold}
              onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
              className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:bg-slate-300 transition-colors"
            />
            <span className="text-sm font-bold text-emerald-600 w-12 text-right px-3 py-1 bg-emerald-50 rounded-lg">
              {(threshold * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Time Window
          </label>
          <select
            value={timeWindow}
            onChange={(e) => onTimeWindowChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all hover:border-emerald-300 shadow-sm cursor-pointer"
          >
            <option value="current">📅 Current</option>
            <option value="week">📅 This Week</option>
            <option value="month">📅 This Month</option>
            <option value="quarter">📅 This Quarter</option>
          </select>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full px-6 py-3 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
