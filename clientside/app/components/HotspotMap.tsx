"use client";

import React, { useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polygon,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  riskLevel: "high" | "medium" | "low";
  crimeCount: number;
}

interface Cluster {
  id: string;
  hotspots: Hotspot[];
  center: [number, number];
  riskLevel: "high" | "medium" | "low";
  polygon: [number, number][];
}

interface MapProps {
  hotspots: Hotspot[];
  center?: [number, number];
}

// Utility: Calculate distance between two points (in km)
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Utility: Simple clustering based on distance threshold
const clusterHotspots = (
  hotspots: Hotspot[],
  distanceThreshold: number
): Cluster[] => {
  const clusters: Cluster[] = [];
  const visited = new Set<string>();

  hotspots.forEach((hotspot) => {
    if (visited.has(hotspot.id)) return;

    const clusterHotspots: Hotspot[] = [hotspot];
    visited.add(hotspot.id);

    hotspots.forEach((other) => {
      if (
        !visited.has(other.id) &&
        haversineDistance(
          hotspot.latitude,
          hotspot.longitude,
          other.latitude,
          other.longitude
        ) < distanceThreshold
      ) {
        clusterHotspots.push(other);
        visited.add(other.id);
      }
    });

    // Calculate cluster center
    const centerLat =
      clusterHotspots.reduce((sum, h) => sum + h.latitude, 0) /
      clusterHotspots.length;
    const centerLon =
      clusterHotspots.reduce((sum, h) => sum + h.longitude, 0) /
      clusterHotspots.length;

    // Determine cluster risk level (highest in cluster)
    const riskLevels = { high: 3, medium: 2, low: 1 };
    const maxRisk = Math.max(
      ...clusterHotspots.map((h) => riskLevels[h.riskLevel])
    );
    const clusterRisk =
      maxRisk === 3 ? "high" : maxRisk === 2 ? "medium" : "low";

    // Generate convex hull polygon
    const polygon = generateConvexHull(clusterHotspots);

    clusters.push({
      id: `cluster-${clusters.length}`,
      hotspots: clusterHotspots,
      center: [centerLat, centerLon],
      riskLevel: clusterRisk as "high" | "medium" | "low",
      polygon,
    });
  });

  return clusters;
};

// Utility: Generate convex hull for polygon outline
const generateConvexHull = (hotspots: Hotspot[]): [number, number][] => {
  if (hotspots.length < 3) {
    // For 1-2 points, create a small circle
    if (hotspots.length === 1) {
      const h = hotspots[0];
      const offset = 0.002; // ~200m offset
      return [
        [h.latitude + offset, h.longitude],
        [h.latitude, h.longitude + offset],
        [h.latitude - offset, h.longitude],
        [h.latitude, h.longitude - offset],
      ];
    } else {
      const [h1, h2] = hotspots;
      const offset = 0.001;
      return [
        [h1.latitude + offset, h1.longitude + offset],
        [h2.latitude + offset, h2.longitude + offset],
        [h2.latitude - offset, h2.longitude - offset],
        [h1.latitude - offset, h1.longitude - offset],
      ];
    }
  }

  // Convert to points for hull algorithm
  const points = hotspots.map((h) => ({
    x: h.longitude,
    y: h.latitude,
  }));

  // Graham scan algorithm for convex hull
  const cross = (o: any, a: any, b: any) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  points.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  const lower: any[] = [];
  for (const p of points) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: any[] = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  upper.pop();
  lower.pop();
  const hull = lower.concat(upper);

  // Expand hull slightly for better visualization
  const expansion = 0.0015; // ~150m expansion
  const center = {
    x: hull.reduce((sum, p) => sum + p.x, 0) / hull.length,
    y: hull.reduce((sum, p) => sum + p.y, 0) / hull.length,
  };

  return hull.map((p) => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    return [p.y + dy * expansion, p.x + dx * expansion];
  });
};

const HotspotMap: React.FC<MapProps> = ({
  hotspots,
  center = [12.9716, 77.5946],
}) => {
  const [showClusters, setShowClusters] = useState(true);
  const [distanceThreshold, setDistanceThreshold] = useState(1.5); // km

  // Cluster hotspots
  const clusters = useMemo(
    () => clusterHotspots(hotspots, distanceThreshold),
    [hotspots, distanceThreshold]
  );

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
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 border-2 border-slate-200">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              Show Clusters
            </span>
            <button
              onClick={() => setShowClusters(!showClusters)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showClusters ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showClusters ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          
          {showClusters && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-600">
                Cluster Distance (km)
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={distanceThreshold}
                onChange={(e) => setDistanceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-xs text-slate-500 text-center">
                {distanceThreshold} km
              </span>
            </div>
          )}
          
          <div className="pt-2 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-600 mb-2">
              Statistics
            </div>
            <div className="flex flex-col gap-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Hotspots:</span>
                <span className="font-bold">{hotspots.length}</span>
              </div>
              {showClusters && (
                <div className="flex justify-between">
                  <span>Clusters:</span>
                  <span className="font-bold">{clusters.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

        {/* Cluster Polygons */}
        {showClusters &&
          clusters.map((cluster) => (
            <Polygon
              key={cluster.id}
              positions={cluster.polygon}
              pathOptions={{
                color: getRiskColor(cluster.riskLevel),
                fillColor: getRiskColor(cluster.riskLevel),
                fillOpacity: 0.15,
                weight: 3,
                opacity: 0.8,
                dashArray: "10, 10",
              }}
              className="transition-all duration-300"
            >
              <Popup>
                <div className={`p-3 rounded-lg border-2 ${getRiskBgColor(cluster.riskLevel)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getRiskBadgeColor(cluster.riskLevel)} animate-pulse`} />
                    <span className={`text-sm font-bold uppercase ${getRiskTextColor(cluster.riskLevel)}`}>
                      {cluster.riskLevel} Risk Zone
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <div>Hotspots: <span className="font-bold">{cluster.hotspots.length}</span></div>
                    <div>Total Crimes: <span className="font-bold">{cluster.hotspots.reduce((sum, h) => sum + h.crimeCount, 0)}</span></div>
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}

        {/* Individual Hotspots */}
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
            <Popup className="custom-popup" closeButton={true} maxWidth={300}>
              <div
                className={`p-4 rounded-lg border-2 ${getRiskBgColor(
                  hotspot.riskLevel
                )} shadow-lg`}
              >
                {/* Header with Risk Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getRiskBadgeColor(
                        hotspot.riskLevel
                      )} shadow-sm animate-pulse`}
                    />
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${getRiskTextColor(
                        hotspot.riskLevel
                      )}`}
                    >
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
                    <span
                      className={`text-2xl font-bold ${getRiskTextColor(
                        hotspot.riskLevel
                      )}`}
                    >
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

        {/* Location Selector (for PredictionMap only) */}
        {typeof onLocationSelect === "function" && <LocationSelector onSelect={onLocationSelect} />}

        {/* Custom CSS for leaflet popup */}
        <style jsx global>{`
          .leaflet-popup-content-wrapper {
            padding: 0;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
              0 8px 10px -6px rgb(0 0 0 / 0.1);
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              "Helvetica Neue", Arial, sans-serif;
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
    </div>
  );
};

export default HotspotMap;