"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import Statistics from "@/app/components/Statistics";
import TrendChart from "@/app/components/TrendChart";
import NavBar from "@/app/components/NavBar";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import RecentIncidents, { Incident } from "@/app/components/RecentIncidents";
import OfficerDeployment, { Officer } from "@/app/components/OfficerDeployment";
import WeeklyReport from "@/app/components/WeeklyReport";
import StreamlitDashboard from "@/app/components/StreamlitDashboard";
import { User } from "@supabase/supabase-js/dist/index.cjs";
import { UserDashboard } from "@/app/components/UserDashboard";
import { REAL_CRIME_STATS, generateRecentIncidents, generateHotspots } from "@/lib/crimeData";

interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  riskLevel: "high" | "medium" | "low";
  crimeCount: number;
}

interface Stats {
  totalCrimes: number;
  averageRiskLevel: number;
  predictionAccuracy: number;
  hotspotsCount: number;
  timeSeriesData?: Array<{ date: string; crimes: number; predicted: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>(generateHotspots());
  const [stats, setStats] = useState<Stats>({
    totalCrimes: REAL_CRIME_STATS.totalCrimes,
    averageRiskLevel: REAL_CRIME_STATS.arrestRate / 100,
    predictionAccuracy: REAL_CRIME_STATS.convictionRate / 100,
    hotspotsCount: generateHotspots().length,
  });
  const [userReports, setUserReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

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
        setInitializing(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchStatistics = async () => {
    try {
      // Use real data from our dataset
      const generatedHotspots = generateHotspots();
      setHotspots(generatedHotspots);
      
      setStats({
        totalCrimes: REAL_CRIME_STATS.totalCrimes,
        averageRiskLevel: REAL_CRIME_STATS.arrestRate / 100,
        predictionAccuracy: REAL_CRIME_STATS.convictionRate / 100,
        hotspotsCount: generatedHotspots.length,
        timeSeriesData: REAL_CRIME_STATS.monthlyData.map(m => ({
          date: m.label,
          crimes: m.count,
          predicted: Math.round(m.count * 0.92) // Simulate predictions
        }))
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUserReports = async () => {
    if (!user?.id) return;
    
    setLoadingReports(true);
    try {
      const supabase = createClient();
      const { data: reports, error } = await supabase
        .from('crime_reports')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
      } else {
        setUserReports(reports || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Mock data for incidents - use real data patterns
  const mockIncidents: Incident[] = generateRecentIncidents().map((incident, idx) => ({
    id: incident.id,
    type: incident.type,
    location: incident.location,
    time: new Date(incident.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    reportedBy: "System",
    priority: (["high", "medium", "low"] as const)[idx % 3],
    status: incident.status === "pending" ? "active" : "resolved",
  }));

  // Mock data for officers
  const mockOfficers: Officer[] = [
    {
      id: "1",
      name: "Officer Rajesh Kumar",
      initials: "RK",
      unit: "Rapid Response",
      status: "available",
      lastAssignment: "2 hours ago",
      currentLocation: "Cubbon Park Station",
    },
    {
      id: "2",
      name: "Officer Priya Sharma",
      initials: "PS",
      unit: "Investigations",
      status: "on-call",
      lastAssignment: "45 mins ago",
      currentLocation: "En route",
    },
    {
      id: "3",
      name: "Officer Arun Rao",
      initials: "AR",
      unit: "Traffic Control",
      status: "available",
      lastAssignment: "1 hour ago",
      currentLocation: "Koramangala District",
    },
  ];

  const handleIncidentClick = (id: string) => {
    const marker = hotspots.find((h) => h.id === id);
    if (marker) {
      console.log("Clicked incident:", id);
      // Could add map centering or highlighting logic here
    }
  };

  const handleAssignOfficer = (officerId: string) => {
    console.log("Assigning officer:", officerId);
    alert(`Officer ${officerId} has been assigned to the incident.`);
  };

  const handleExportReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Set colors and fonts
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55); // slate-800
    
    // Title
    doc.text("CRIME REPORT", margin, yPosition);
    yPosition += 12;

    // Report date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // slate-500
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 12;

    // Divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Statistics Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("Overview Statistics", margin, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);

    const stats_data = [
      [`Total Crimes Reported: `, `${stats.totalCrimes.toLocaleString()}`],
      [`Active Hotspots: `, `${stats.hotspotsCount}`],
      [`Average Risk Level: `, `${(stats.averageRiskLevel * 100).toFixed(2)}%`],
      [`Prediction Accuracy: `, `${(stats.predictionAccuracy * 100).toFixed(2)}%`],
      [`Arrest Rate: `, `${(REAL_CRIME_STATS.arrestRate * 100).toFixed(2)}%`],
      [`Conviction Rate: `, `${(REAL_CRIME_STATS.convictionRate * 100).toFixed(2)}%`],
    ];

    stats_data.forEach(([label, value]) => {
      doc.text(label, margin + 5, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(value, pageWidth - margin - 30, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 7;
    });

    yPosition += 5;

    // Crime Types Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("Crime Distribution", margin, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);

    REAL_CRIME_STATS.crimeTypes.forEach((crime: any) => {
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }
      const percentage = ((crime.count / stats.totalCrimes) * 100).toFixed(1);
      doc.text(`• ${crime.type}: ${crime.count.toLocaleString()} (${percentage}%)`, margin + 5, yPosition);
      yPosition += 6;
    });

    yPosition += 8;

    // Recent Incidents Section
    if (yPosition > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("Recent Incidents", margin, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);

    const recentIncidents = generateRecentIncidents().slice(0, 5);
    recentIncidents.forEach((incident: any, index: number) => {
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(`${index + 1}. ${incident.type} - ${incident.location}`, margin + 5, yPosition);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text(`   Date: ${new Date(incident.date).toLocaleDateString()} | Status: ${incident.status}`, margin + 8, yPosition + 4);
      doc.setTextColor(55, 65, 81);
      yPosition += 10;
    });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // slate-400
    doc.text("OpenSight Crime Analytics Dashboard", margin, pageHeight - 10);
    doc.text(`Report Generated on ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, pageHeight - 10);

    // Save PDF
    doc.save(`Crime_Report_${new Date().getTime()}.pdf`);
  };

  const handleGenerateReport = () => {
    router.push('/report');
  };

  const handleViewDetails = () => {
    router.push('/analytics');
  };

  useEffect(() => {
    if (user) {
      fetchStatistics();
      fetchUserReports();
    }
  }, [user]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show profile dashboard if user clicks My Profile
  if (showProfile && user) {
    return (
      <div>
        <NavBar user={user ? { email: user.email || '', id: user.id } : undefined} onProfileClose={() => setShowProfile(false)} />
        <UserDashboard authUser={user} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Navigation */}
      <NavBar user={user ? { email: user.email || '', id: user.id } : undefined} onProfileOpen={() => setShowProfile(true)} />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-emerald-700 to-emerald-900 bg-clip-text text-transparent mb-2">
                Crime Hotspot Analytics
              </h1>
              <p className="text-slate-600 text-lg">
                Real-time predictions for Bengaluru
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleViewDetails}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Details
              </button>
              <button
                onClick={handleExportReport}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-slate-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Download PDF
              </button>
              <button
                onClick={handleGenerateReport}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Full Report
              </button>
            </div>
          </div>
        </div>
        {/* Statistics */}
        <div className="mb-8 animate-fade-in-up">
          <Statistics
            hotspotsCount={stats.hotspotsCount}
            totalCrimes={stats.totalCrimes}
            averageRiskLevel={stats.averageRiskLevel}
            predictionAccuracy={stats.predictionAccuracy}
          />
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 mb-8 animate-fade-in-up hover:shadow-2xl transition-all duration-500">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Crime Hotspot Map
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </div>
              </div>
            </div>
            
            {/* Map Filters */}
          </div>
          <StreamlitDashboard/>
        </div>

        {/* Trend Chart */}
        <div className="mb-8 animate-fade-in-up">
          <TrendChart timeSeriesData={stats.timeSeriesData} />
        </div>

        {/* Map and Incident List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Incidents */}
          <div className="lg:col-span-1">
            <RecentIncidents incidents={mockIncidents} onIncidentClick={handleIncidentClick} />
          </div>

          {/* Hotspots Table */}
          <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 animate-fade-in-up hover:shadow-2xl transition-all duration-500">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Active Hotspots
              </h2>
              <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-bold">
                {hotspots.length} detected
              </span>
            </div>
            <p className="text-slate-600 text-sm">
              High-risk areas requiring immediate attention
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg">
            {hotspots.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Location ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Reported Crimes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Coordinates
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hotspots.map((hotspot, index) => (
                    <tr
                      key={hotspot.id}
                      className="hover:bg-slate-50 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-900">
                          {hotspot.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-4 py-2 text-xs font-bold rounded-full inline-flex items-center gap-2 ${
                            hotspot.riskLevel === "high"
                              ? "bg-red-100 text-red-800 shadow-sm shadow-red-200"
                              : hotspot.riskLevel === "medium"
                              ? "bg-yellow-100 text-yellow-800 shadow-sm shadow-yellow-200"
                              : "bg-green-100 text-green-800 shadow-sm shadow-green-200"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            hotspot.riskLevel === "high" ? "bg-red-500" :
                            hotspot.riskLevel === "medium" ? "bg-yellow-500" : "bg-green-500"
                          }`} />
                          {hotspot.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900 font-semibold">
                          {hotspot.crimeCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600 font-mono">
                          {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-slate-600 font-medium">No hotspots found for the selected criteria</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
          </div>
        </div>

        {/* My Crime Reports */}
        {userReports.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">My Crime Reports</h2>
                    <p className="text-sm text-slate-600 mt-1">Your submitted reports and their status</p>
                  </div>
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                    {userReports.length} {userReports.length === 1 ? 'Report' : 'Reports'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Crime Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userReports.map((report, index) => (
                      <tr
                        key={report.id}
                        className="hover:bg-slate-50 transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-slate-900 capitalize">
                            {report.crime_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">{report.location}</div>
                          <div className="text-xs text-slate-500 capitalize">{report.district}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-600">
                            {new Date(report.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              report.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : report.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {report.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              report.status === 'resolved'
                                ? 'bg-green-100 text-green-800'
                                : report.status === 'investigating'
                                ? 'bg-blue-100 text-blue-800'
                                : report.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {report.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Officer Deployment and Weekly Report */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <OfficerDeployment
            officers={mockOfficers}
            totalOfficers={REAL_CRIME_STATS.arrested}
            onAssignOfficer={handleAssignOfficer}
          />
          
          <WeeklyReport
            dateRange={`Total Analysis - 2020-2024`}
            hotspots={REAL_CRIME_STATS.crimeTypes.slice(0, 3).map((crime, idx) => ({
              name: crime.type,
              incidents: crime.count,
              change: Math.floor(Math.random() * 40) - 20
            }))}
            trends={REAL_CRIME_STATS.crimeTypes.slice(3, 5).map((crime, idx) => ({
              title: crime.type,
              change: Math.floor(Math.random() * 40) - 20,
              details: `${crime.count} cases reported`
            }))}
            metrics={[
              { value: `${REAL_CRIME_STATS.arrestRate.toFixed(1)}%`, label: "Arrest Rate" },
              { value: `${REAL_CRIME_STATS.convictionRate.toFixed(1)}%`, label: "Conviction Rate" },
              { value: `${REAL_CRIME_STATS.yearlyData[REAL_CRIME_STATS.yearlyData.length - 1].count}`, label: "2024 Cases" },
            ]}
            onDownload={handleExportReport}
            onGenerateCustom={handleGenerateReport}
          />
        </div>
      </main>

    </div>
  );
}