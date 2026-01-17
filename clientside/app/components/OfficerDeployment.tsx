"use client";

import React from "react";

export interface Officer {
  id: string;
  name: string;
  initials: string;
  unit: string;
  status: "available" | "on-call" | "off-duty";
  lastAssignment: string;
  currentLocation: string;
}

interface OfficerDeploymentProps {
  officers: Officer[];
  totalOfficers: number;
  onAssignOfficer?: (officerId: string) => void;
}

export default function OfficerDeployment({ officers, totalOfficers, onAssignOfficer }: OfficerDeploymentProps) {
  const availableCount = officers.filter(o => o.status === "available").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "on-call":
        return "bg-yellow-100 text-yellow-800";
      case "off-duty":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getInitialsColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-gradient-to-br from-emerald-500 to-emerald-600";
      case "on-call":
        return "bg-gradient-to-br from-yellow-500 to-yellow-600";
      case "off-duty":
        return "bg-gradient-to-br from-gray-400 to-gray-500";
      default:
        return "bg-gradient-to-br from-blue-500 to-blue-600";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Officer Deployment</h2>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-slate-900">Active Officers</h3>
            <p className="text-sm text-slate-600 mt-1">
              {availableCount} available of {totalOfficers} total
            </p>
          </div>
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-200">
            <span className="text-emerald-700 font-bold text-2xl">{availableCount}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {officers.map((officer, index) => (
          <div
            key={officer.id}
            className="border border-slate-200 rounded-xl p-4 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${getInitialsColor(officer.status)} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                  {officer.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{officer.name}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    Unit: {officer.unit}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${getStatusColor(officer.status)}`}>
                {officer.status.toUpperCase().replace("-", " ")}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs space-y-1">
                <p className="text-slate-600 flex items-center gap-1">
                  <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Last assignment:</span> {officer.lastAssignment}
                </p>
                <p className="text-slate-600 flex items-center gap-1">
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="font-medium">Current location:</span> {officer.currentLocation}
                </p>
              </div>
              {officer.status === "available" ? (
                <button
                  onClick={() => onAssignOfficer?.(officer.id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 text-xs font-semibold shadow-md hover:shadow-lg"
                >
                  Assign
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed text-xs font-semibold"
                >
                  {officer.status === "on-call" ? "Busy" : "Off Duty"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          View All Officers
        </button>
      </div>
    </div>
  );
}
