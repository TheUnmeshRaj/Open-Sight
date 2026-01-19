"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/app/components/NavBar";
import StreamlitDashboardPred from "@/app/components/StreamlitDashboardPred";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import dynamic from "next/dynamic";
import { User } from "@supabase/supabase-js";

const PredictionMap = dynamic(() => import("@/app/components/PredictionMap"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-slate-200 to-slate-100 rounded-lg flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  ),
});

interface PredictionResult {
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };

  
  date: string;
  prediction: {
    riskLevel: "high" | "medium" | "low";
    confidence: number;
    expectedCrimes: number;
    trend: "increasing" | "decreasing" | "stable";
  };
  crimeTypes: Record<string, number>;
  nearbyIncidents: number;
}

interface PredictionResult {
  crime_probability: number;
  risk: "SAFE" | "UNSAFE";
  top_crimes?: {
    type: string;
    confidence: number;
  }[];
}


interface CrimeTypeInfo {
  description: string;
  icon: string;
  severity: "high" | "medium" | "low";
  commonTimes: string;
  prevention: string[];
}

const crimeTypeDetails: Record<string, CrimeTypeInfo> = {
  "Theft": {
    description: "Unlawful taking of property or belongings",
    icon: "💰",
    severity: "medium",
    commonTimes: "Evening hours (6 PM - 10 PM)",
    prevention: [
      "Keep valuables secure and out of sight",
      "Use well-lit and crowded areas",
      "Be aware of your surroundings",
      "Avoid displaying expensive items"
    ]
  },
  "Robbery": {
    description: "Taking property by force or threat of force",
    icon: "🔪",
    severity: "high",
    commonTimes: "Late night (10 PM - 2 AM)",
    prevention: [
      "Avoid isolated areas, especially at night",
      "Travel in groups when possible",
      "Keep emergency contacts readily available",
      "Don't resist if confronted"
    ]
  },
  "Burglary": {
    description: "Illegal entry into buildings to commit theft",
    icon: "🏚️",
    severity: "medium",
    commonTimes: "Daytime (10 AM - 3 PM)",
    prevention: [
      "Install good quality locks and security systems",
      "Keep doors and windows locked",
      "Don't advertise absences on social media",
      "Get to know your neighbors"
    ]
  },
  "Assault": {
    description: "Physical attack or threat of physical harm",
    icon: "⚠️",
    severity: "high",
    commonTimes: "Night hours (8 PM - 12 AM)",
    prevention: [
      "Stay alert in crowded places",
      "Avoid confrontations",
      "Use trusted transportation",
      "Share your location with trusted contacts"
    ]
  },
  "Vehicle Theft": {
    description: "Stealing or unauthorized use of motor vehicles",
    icon: "🚗",
    severity: "medium",
    commonTimes: "Night (8 PM - 6 AM)",
    prevention: [
      "Park in well-lit, secure areas",
      "Always lock your vehicle",
      "Use anti-theft devices",
      "Don't leave valuables visible"
    ]
  },
  "Vandalism": {
    description: "Deliberate destruction of property",
    icon: "🎨",
    severity: "low",
    commonTimes: "Late night (11 PM - 4 AM)",
    prevention: [
      "Install security cameras",
      "Improve lighting around property",
      "Report suspicious activity",
      "Join neighborhood watch programs"
    ]
  },
  "Fraud": {
    description: "Deception for financial or personal gain",
    icon: "📱",
    severity: "medium",
    commonTimes: "Business hours (9 AM - 6 PM)",
    prevention: [
      "Verify caller/sender identity",
      "Never share OTPs or passwords",
      "Be cautious with online transactions",
      "Check for secure connections (HTTPS)"
    ]
  },
  "Cybercrime": {
    description: "Criminal activity involving computers and internet",
    icon: "💻",
    severity: "medium",
    commonTimes: "Any time",
    prevention: [
      "Use strong, unique passwords",
      "Enable two-factor authentication",
      "Keep software updated",
      "Don't click suspicious links"
    ]
  },
  "Drug Offense": {
    description: "Illegal possession, use, or distribution of drugs",
    icon: "💊",
    severity: "high",
    commonTimes: "Late night (10 PM - 3 AM)",
    prevention: [
      "Avoid suspicious gatherings",
      "Report drug activity to authorities",
      "Stay informed about local issues",
      "Choose safe neighborhoods"
    ]
  },
  "Other": {
    description: "Various other criminal activities",
    icon: "📋",
    severity: "low",
    commonTimes: "Varies",
    prevention: [
      "Stay informed about local crime",
      "Follow general safety guidelines",
      "Report suspicious activity",
      "Maintain situational awareness"
    ]
  }
};

export default function PredictionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  // Form states
  const [inputType, setInputType] = useState<"text" | "coordinates" | "map">("text");
  const [locationText, setLocationText] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  // Results
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [selectedCrimeType, setSelectedCrimeType] = useState<string | null>(null);

  // Search suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLocationSearch = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/search-location?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.results || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setLocationText(suggestion.name);
    setLatitude(suggestion.latitude.toString());
    setLongitude(suggestion.longitude.toString());
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleMapClick = (lat: number, lon: number) => {
    setLatitude(lat.toString());
    setLongitude(lon.toString());
    setMapLocation({ lat, lon });
    setInputType("coordinates");
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    setError("");
    setPrediction(null);

    try {
      let lat: number, lon: number, locName: string;

      if (inputType === "text") {
        if (!locationText.trim()) {
          setError("Please enter a location name");
          setPredicting(false);
          return;
        }
        locName = locationText;
      } else if (inputType === "coordinates" || inputType === "map") {
        if (!latitude || !longitude) {
          setError("Please enter valid coordinates");
          setPredicting(false);
          return;
        }
        lat = parseFloat(latitude);
        lon = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lon)) {
          setError("Invalid coordinate values");
          setPredicting(false);
          return;
        }
        locName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      }

      if (!date) {
        setError("Please select a date");
        setPredicting(false);
        return;
      }

      const payload: any = { date };

      if (inputType === "text") {
        payload.location = locationText;
      } else {
        payload.latitude = parseFloat(latitude);
        payload.longitude = parseFloat(longitude);
      }

      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check if response is ok and is JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          setError(errorData.error || "Prediction failed");
        } else {
          setError("Backend server error. Please ensure the Flask server is running.");
        }
        setPredicting(false);
        return;
      }

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      setError("Error making prediction. Please try again.");
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-50 border-red-300";
      case "medium":
        return "bg-yellow-50 border-yellow-300";
      case "low":
        return "bg-green-50 border-green-300";
      default:
        return "bg-slate-50 border-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <NavBar user={user ? { email: user.email || "", id: user.id } : undefined} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-emerald-700 to-emerald-900 bg-clip-text text-transparent mb-2">
            Crime Risk Prediction
          </h1>
          <p className="text-slate-600 text-lg">
            Predict crime risk for any location and date in Bengaluru
          </p>
        </div>
          <StreamlitDashboardPred/>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prediction Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Find Risk</h2>

              <form onSubmit={handlePredict} className="space-y-6">
                {/* Input Type Selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Input Method
                  </label>
                  <div className="flex gap-2">
                    {["text", "coordinates", "map"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setInputType(type as any);
                          setError("");
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all text-xs ${
                          inputType === type
                            ? "bg-emerald-500 text-white shadow-lg"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {type === "text"
                          ? "📍 Text"
                          : type === "coordinates"
                          ? "🧭 Coords"
                          : "🗺️ Map"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Input */}
                {inputType === "text" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Location Name
                    </label>
                    <input
                      type="text"
                      value={locationText}
                      onChange={(e) => {
                        setLocationText(e.target.value);
                        handleLocationSearch(e.target.value);
                      }}
                      placeholder="e.g., Koramangala, Whitefield"
                      className="text-black w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {suggestions.map((sugg, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSuggestion(sugg)}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                          >
                            <div className="font-semibold text-slate-900">{sugg.name}</div>
                            <div className="text-xs text-slate-600">
                              {sugg.latitude.toFixed(4)}, {sugg.longitude.toFixed(4)}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Coordinates Input */}
                {(inputType === "coordinates" || inputType === "map") && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Latitude
                        </label>
                        <input
                          type="number"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          placeholder="12.9716"
                          step="0.0001"
                          className="text-black w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Longitude
                        </label>
                        <input
                          type="number"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          placeholder="77.5946"
                          step="0.0001"
                          className="text-black  w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Date Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-black w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-semibold text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={predicting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {predicting ? "🔄 Predicting..." : "🔮 Predict Risk"}
                </button>
              </form>
            </div>
          </div>

          {/* Results and Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map for location selection */}
            {inputType === "map" && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    📍 Click on Map to Select Location
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Click anywhere on the map to choose a location for prediction
                  </p>
                  <PredictionMap
                    onLocationSelect={handleMapClick}
                    selectedLocation={
                      latitude && longitude
                        ? {
                            lat: parseFloat(latitude),
                            lon: parseFloat(longitude),
                          }
                        : null
                    }
                  />
                  
                </div>

                {/* Selected coordinates display */}
                {latitude && longitude && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-300 p-4 shadow-lg animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">✓</span>
                      <h4 className="font-bold text-emerald-900">Location Selected</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-lg p-3 border border-emerald-200">
                        <p className="text-xs font-semibold text-slate-600">Latitude</p>
                        <p className="text-lg font-bold text-emerald-700">{parseFloat(latitude).toFixed(4)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-emerald-200">
                        <p className="text-xs font-semibold text-slate-600">Longitude</p>
                        <p className="text-lg font-bold text-emerald-700">{parseFloat(longitude).toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prediction Results */}
            {prediction && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 animate-fade-in-up">
                <div className="mb-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {prediction.location.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{prediction.date}</p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-lg font-bold border-2 ${getRiskColor(
                        prediction.prediction.riskLevel
                      )}`}
                    >
                      {prediction.prediction.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div
                    className={`p-4 rounded-lg border-2 ${getRiskBgColor(
                      prediction.prediction.riskLevel
                    )}`}
                  >
                    <p className="text-sm font-semibold text-slate-700 mb-1">Confidence</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {prediction.prediction.confidence.toFixed(1)}%
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-300">
                    <p className="text-sm font-semibold text-slate-700 mb-1">Expected Crimes</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {prediction.prediction.expectedCrimes}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border-2 bg-purple-50 border-purple-300">
                    <p className="text-sm font-semibold text-slate-700 mb-1">Nearby Incidents</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {prediction.nearbyIncidents}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border-2 bg-indigo-50 border-indigo-300">
                    <p className="text-sm font-semibold text-slate-700 mb-1">Trend</p>
                    <p className="text-lg font-bold text-indigo-900 capitalize">
                      → {prediction.prediction.trend}
                    </p>
                  </div>
                </div>

                {Object.keys(prediction.crimeTypes).length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-slate-900 mb-4">📊 Crime Type Analysis</h4>
                    <div className="space-y-3">
                      {Object.entries(prediction.crimeTypes)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 6)
                        .map(([crime, count], idx) => {
                          const crimeInfo = crimeTypeDetails[crime] || crimeTypeDetails["Other"];
                          const maxCount = Math.max(...Object.values(prediction.crimeTypes) as number[]);
                          const percentage = ((count as number) / maxCount) * 100;
                          
                          return (
                            <div 
                              key={idx} 
                              className="group cursor-pointer hover:bg-slate-50 p-4 rounded-xl border-2 border-slate-200 transition-all hover:border-emerald-400 hover:shadow-md"
                              onClick={() => setSelectedCrimeType(selectedCrimeType === crime ? null : crime)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="text-3xl">{crimeInfo.icon}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-slate-900">{crime}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        crimeInfo.severity === 'high' ? 'bg-red-100 text-red-700' :
                                        crimeInfo.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {crimeInfo.severity}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-600">{crimeInfo.description}</p>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-2xl font-bold text-emerald-600">{count}</div>
                                  <div className="text-xs text-slate-500">incidents</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                                  <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                      crimeInfo.severity === 'high' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                      crimeInfo.severity === 'medium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                      'bg-gradient-to-r from-green-400 to-green-600'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 w-12 text-right">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>

                              {selectedCrimeType === crime && (
                                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 animate-fade-in">
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-slate-700">🕒 Common Times:</span>
                                    <span className="text-slate-600">{crimeInfo.commonTimes}</span>
                                  </div>
                                  
                                  <div>
                                    <div className="font-semibold text-slate-700 mb-2 text-sm flex items-center gap-2">
                                      🛡️ Prevention Tips:
                                    </div>
                                    <ul className="space-y-1.5 ml-6">
                                      {crimeInfo.prevention.map((tip, tipIdx) => (
                                        <li key={tipIdx} className="text-sm text-slate-600 flex items-start gap-2">
                                          <span className="text-emerald-500 mt-0.5">✓</span>
                                          <span>{tip}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>

                    {/* Safety Recommendations */}
                    <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <h5 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        🛡️ General Safety Recommendations
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="font-semibold text-sm text-slate-700 mb-1">🚨 Emergency Contacts</div>
                          <p className="text-xs text-slate-600">Police: 100 | Ambulance: 108</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="font-semibold text-sm text-slate-700 mb-1">👥 Stay Connected</div>
                          <p className="text-xs text-slate-600">Share location with trusted contacts</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="font-semibold text-sm text-slate-700 mb-1">💡 Stay Alert</div>
                          <p className="text-xs text-slate-600">Be aware of your surroundings</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="font-semibold text-sm text-slate-700 mb-1">🌙 Night Safety</div>
                          <p className="text-xs text-slate-600">Use well-lit routes and trusted transport</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 text-center mt-4 italic">
                      💡 Click on any crime type above to see detailed prevention tips
                    </div>
                  </div>
                )}
              </div>
            )}

            {!prediction && !error && (
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border-2 border-dashed border-emerald-300 p-12 text-center animate-fade-in">
                <div className="text-5xl mb-4">🔮</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Predict</h3>
                <p className="text-slate-600">
                  Enter a location and date above to get a crime risk prediction
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
