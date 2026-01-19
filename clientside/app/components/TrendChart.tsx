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

interface TrendChartProps {
  timeSeriesData?: Array<{ date: string; crimes: number; predicted: number }>;
}

const TrendChart: React.FC<TrendChartProps> = ({ timeSeriesData = [] }) => {
  if (timeSeriesData.length === 0) return null;

  return (
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
  );
};

export default TrendChart;
