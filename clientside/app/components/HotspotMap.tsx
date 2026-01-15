"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  riskLevel: "high" | "medium" | "low";
  crimeCount: number;
}

interface MapProps {
  hotspots: Hotspot[];
  center?: [number, number];
}

const HotspotMap: React.FC<MapProps> = ({
  hotspots,
  center = [12.9716, 77.5946],
}) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "#ef4444"; // red-500
      case "medium":
        return "#f59e0b"; // amber-500
      case "low":
        return "#10b981"; // emerald-500
      default:
        return "#6366f1";
    }
  };

  const getRiskRadius = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return 25;
      case "medium":
        return 18;
      case "low":
        return 12;
      default:
        return 15;
    }
  };

  const getRiskBgColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-amber-50 border-amber-200";
      case "low":
        return "bg-emerald-50 border-emerald-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "text-red-800";
      case "medium":
        return "text-amber-800";
      case "low":
        return "text-emerald-800";
      default:
        return "text-slate-800";
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-emerald-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "600px", width: "100%" }}
      className="rounded-xl shadow-inner"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
      />
      {hotspots.map((hotspot) => (
        <CircleMarker
          key={hotspot.id}
          center={[hotspot.latitude, hotspot.longitude]}
          radius={getRiskRadius(hotspot.riskLevel)}
          fillColor={getRiskColor(hotspot.riskLevel)}
          color="#ffffff"
          weight={3}
          opacity={1}
          fillOpacity={0.7}
          className="transition-all duration-300 hover:scale-110"
        >
          <Popup
            className="custom-popup"
            closeButton={true}
            maxWidth={300}
          >
            <div className={`p-4 rounded-lg border-2 ${getRiskBgColor(hotspot.riskLevel)} shadow-lg`}>
              {/* Header with Risk Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getRiskBadgeColor(hotspot.riskLevel)} shadow-sm animate-pulse`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${getRiskTextColor(hotspot.riskLevel)}`}>
                    {hotspot.riskLevel} Risk
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-full">
                  {hotspot.id}
                </span>
              </div>

              {/* Crime Count */}
              <div className="mb-3 bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Reported Crimes
                  </span>
                  <span className={`text-2xl font-bold ${getRiskTextColor(hotspot.riskLevel)}`}>
                    {hotspot.crimeCount}
                  </span>
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  Location
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
                  <svg 
                    className="w-4 h-4 text-slate-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                  <div>
                    <div className="text-slate-800 font-semibold">
                      {hotspot.latitude.toFixed(6)}°N
                    </div>
                    <div className="text-slate-800 font-semibold">
                      {hotspot.longitude.toFixed(6)}°E
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Custom CSS for leaflet popup */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          border: 2px solid rgb(226 232 240);
        }
        
        .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        
        .leaflet-popup-tip {
          background: white;
          border: 2px solid rgb(226 232 240);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .leaflet-popup-close-button {
          color: rgb(100 116 139) !important;
          font-size: 24px !important;
          font-weight: bold !important;
          padding: 8px 12px !important;
          transition: all 0.2s;
        }
        
        .leaflet-popup-close-button:hover {
          color: rgb(15 23 42) !important;
          background-color: rgb(241 245 249);
          border-radius: 8px;
        }

        .leaflet-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .leaflet-control-zoom {
          border: 2px solid rgb(226 232 240) !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .leaflet-control-zoom a {
          background-color: white !important;
          color: rgb(51 65 85) !important;
          border: none !important;
          font-size: 20px !important;
          font-weight: bold !important;
          transition: all 0.2s;
        }

        .leaflet-control-zoom a:hover {
          background-color: rgb(16 185 129) !important;
          color: white !important;
        }

        .leaflet-control-zoom a:first-child {
          border-bottom: 2px solid rgb(226 232 240) !important;
        }

        .leaflet-bar {
          box-shadow: none !important;
        }

        .leaflet-touch .leaflet-control-zoom {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </MapContainer>
  );
};

export default HotspotMap;