"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/app/components/NavBar";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { User } from "@supabase/supabase-js/dist/index.cjs";

interface PredictionData {
  district: string;
  predictedCrimes: number;
  confidence: number;
  riskLevel: "high" | "medium" | "low";
  trend: "increasing" | "decreasing" | "stable";
  timeframe: string;
}

export default function PredictionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [timeframe, setTimeframe] = useState("7days");

  const predictions: PredictionData[] = [
    {
      district: "Koramangala",
      predictedCrimes: 45,
      confidence: 87,
      riskLevel: "high",
      trend: "increasing",
      timeframe: "Next 7 days",
    },
    {
      district: "Whitefield",
      predictedCrimes: 38,
      confidence: 82,
      riskLevel: "high",
      trend: "stable",
      timeframe: "Next 7 days",
    },
    {
      district: "Indiranagar",
      predictedCrimes: 29,
      confidence: 79,
      riskLevel: "medium",
      trend: "decreasing",
      timeframe: "Next 7 days",
    },
    {
      district: "Jayanagar",
      predictedCrimes: 24,
      confidence: 85,
      riskLevel: "medium",
      trend: "stable",
      timeframe: "Next 7 days",
    },
    {
      district: "Marathahalli",
      predictedCrimes: 18,
      confidence: 76,
      riskLevel: "low",
      trend: "decreasing",
      timeframe: "Next 7 days",
    },
    {
      district: "Electronic City",
      predictedCrimes: 12,
      confidence: 88,
      riskLevel: "low",
      trend: "stable",
      timeframe: "Next 7 days",
    },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <span className="text-red-600">↑ Increasing</span>;
      case "decreasing":
        return <span className="text-green-600">↓ Decreasing</span>;
      case "stable":
        return <span className="text-blue-600">→ Stable</span>;
      default:
        return <span className="text-gray-600">→ Stable</span>;
    }
  };

  const filteredPredictions = selectedDistrict === "all"
    ? predictions
    : predictions.filter(p => p.district.toLowerCase() === selectedDistrict);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50">
      <NavBar user={user ? { email: user.email || '', id: user.id } : undefined} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-slate-900 via-emerald-700 to-emerald-900 bg-clip-text text-transparent mb-2">
            Crime Predictions
          </h1>
          <p className="text-slate-600 text-lg">
            AI-powered crime forecasting for Bengaluru districts
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="border-2 border-slate-300 rounded-lg px-4 py-2 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-slate-100 transition-all"
            aria-label="Select district"
          >
            <option value="all">All Districts</option>
            <option value="koramangala">Koramangala</option>
            <option value="whitefield">Whitefield</option>
            <option value="indiranagar">Indiranagar</option>
            <option value="jayanagar">Jayanagar</option>
            <option value="marathahalli">Marathahalli</option>
            <option value="electronic city">Electronic City</option>
          </select>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border-2 border-slate-300 rounded-lg px-4 py-2 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-slate-100 transition-all"
            aria-label="Select timeframe"
          >
            <option value="7days">Next 7 Days</option>
            <option value="14days">Next 14 Days</option>
            <option value="30days">Next 30 Days</option>
          </select>
        </div>

        {/* Prediction Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPredictions.map((prediction, index) => (
            <div
              key={prediction.district}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{prediction.district}</h3>
                  <p className="text-sm text-slate-600">{prediction.timeframe}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(prediction.riskLevel)}`}>
                  {prediction.riskLevel.toUpperCase()}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">Predicted Crimes</span>
                    <span className="text-2xl font-bold text-slate-900">{prediction.predictedCrimes}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        prediction.riskLevel === "high"
                          ? "bg-red-500"
                          : prediction.riskLevel === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${(prediction.predictedCrimes / 50) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">Confidence</span>
                    <span className="text-lg font-bold text-emerald-600">{prediction.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Trend</span>
                    <span className="text-sm font-semibold">{getTrendIcon(prediction.trend)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">About These Predictions</h3>
              <p className="text-blue-800 text-sm">
                These predictions are generated using machine learning models trained on historical crime data, 
                weather patterns, time factors, and socioeconomic indicators. The confidence score indicates 
                the model's certainty in its predictions. Use these insights for strategic resource allocation 
                and preventive measures.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
