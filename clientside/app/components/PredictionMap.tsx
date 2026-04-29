"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";

// Import components dynamically
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const MapConsumer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapConsumer),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

interface PredictionMapProps {
  onLocationSelect?: (lat: number, lon: number) => void;
  selectedLocation?: { lat: number; lon: number } | null;
}

// Fix Leaflet default icon issue
if (typeof window !== "undefined") {
  const iconRetinaUrl = require("leaflet/dist/images/marker-icon-2x.png").default;
  const iconUrl = require("leaflet/dist/images/marker-icon.png").default;
  const shadowUrl = require("leaflet/dist/images/marker-shadow.png").default;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
}

const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lon: number) => void;
}> = ({ onMapClick }) => {
  const mapRef = React.useRef<any>(null);
  const callbackRef = React.useRef(onMapClick);

  // Update callback ref when it changes
  React.useEffect(() => {
    callbackRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    // Delay to ensure map is fully rendered
    const timer = setTimeout(() => {
      try {
        // Find the map container
        const containers = document.querySelectorAll(".leaflet-container");
        if (containers.length > 0) {
          const leafletMap = (containers[containers.length - 1] as any)._leaflet_map;
          if (leafletMap) {
            mapRef.current = leafletMap;
            
            // Remove any existing click handlers to avoid duplicates
            leafletMap.off("click");
            
            // Add click handler
            leafletMap.on("click", (e: any) => {
              if (e.latlng) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                console.log(`✓ Map clicked at: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                callbackRef.current(lat, lng);
              }
            });
            
            console.log("✓ Map click handler attached successfully");
          }
        }
      } catch (err) {
        console.error("Error attaching map click handler:", err);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.off("click");
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  return null;
};

const PredictionMap: React.FC<PredictionMapProps> = ({
  onLocationSelect,
  selectedLocation,
}) => {
  const [isClient, setIsClient] = useState(false);
  const bengaluruCenter: [number, number] = [12.9716, 77.5946];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMapClick = React.useCallback(
    (lat: number, lon: number) => {
      console.log(`Map clicked at: ${lat}, ${lon}`);
      if (onLocationSelect) {
        onLocationSelect(lat, lon);
      }
    },
    [onLocationSelect]
  );

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-slate-200 to-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-300">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-slate-600 font-semibold">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-slate-200">
        <MapContainer
          center={bengaluruCenter}
          zoom={12}
          style={{ height: "400px", width: "100%" }}
          className="rounded-xl"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
          />

          {onLocationSelect && (
            <MapClickHandler onMapClick={handleMapClick} />
          )}

          {selectedLocation && (
            <CircleMarker
              center={[selectedLocation.lat, selectedLocation.lon]}
              radius={10}
              fillColor="#10b981"
              color="#ffffff"
              weight={3}
              opacity={1}
              fillOpacity={0.8}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-bold text-sm">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                  </p>
                  <p className="text-xs text-slate-600">Selected location</p>
                </div>
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>

        {/* Click instruction overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-slate-200 max-w-xs">
          <p className="text-xs text-slate-700">
            💡 <strong>Click</strong> on the map to select a location
          </p>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important;
          border: 2px solid rgb(226 232 240) !important;
        }

        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }

        .leaflet-popup-close-button {
          color: rgb(100 116 139) !important;
          font-size: 24px !important;
          padding: 8px 12px !important;
        }

        .leaflet-container {
          font-family: inherit;
          background: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default PredictionMap;