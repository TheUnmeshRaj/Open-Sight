"use client";

import React from "react";

export interface Incident {
  id: string;
  type: string;
  location: string;
  time: string;
  reportedBy: string;
  priority: "high" | "medium" | "low";
  status?: "active" | "resolved";
}

interface RecentIncidentsProps {
  incidents: Incident[];
  onIncidentClick?: (id: string) => void;
}

export default function RecentIncidents({ incidents, onIncidentClick }: RecentIncidentsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDotColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

  const getIcon = (type: string) => {
    if (type.toLowerCase().includes("gun") || type.toLowerCase().includes("fire")) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13 10V3L4 14h7v7l9-11h-7z" clipRule="evenodd" />
        </svg>
      );
    }
    if (type.toLowerCase().includes("theft") || type.toLowerCase().includes("robbery")) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
        </svg>
      );
    }
    if (type.toLowerCase().includes("accident") || type.toLowerCase().includes("vehicle")) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Incidents</h2>
            <p className="text-sm text-slate-600 mt-1">Live updates from the field</p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-semibold">Add New</span>
          </button>
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
        {incidents.map((incident, index) => (
          <div
            key={incident.id}
            onClick={() => onIncidentClick?.(incident.id)}
            className={`border-b border-slate-100 p-4 hover:bg-slate-50 cursor-pointer transition-all duration-200 animate-fade-in ${
              incident.status === "resolved" ? "opacity-60" : ""
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-2 h-2 rounded-full ${getDotColor(incident.priority)} ${incident.priority === 'high' ? 'animate-pulse' : ''}`} />
                <div className="flex items-center gap-2">
                  {getIcon(incident.type)}
                  <span className="font-semibold text-slate-900">{incident.type}</span>
                </div>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-mono">
                {incident.time}
              </span>
            </div>

            <p className="text-sm text-slate-600 ml-4 mb-3 flex items-center gap-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {incident.location}
            </p>

            <div className="flex justify-between items-center ml-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Reported by: {incident.reportedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                {incident.status === "resolved" ? (
                  <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold">
                    RESOLVED
                  </span>
                ) : (
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getPriorityColor(incident.priority)}`}>
                    {incident.priority.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <button className="w-full text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center justify-center gap-2 py-2 hover:bg-white rounded-lg transition-all duration-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          View All Incidents
        </button>
      </div>
    </div>
  );
}
