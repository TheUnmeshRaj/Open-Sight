// This module provides utilities to work with crime data
// It would normally parse the CSV server-side, but we'll create helper functions
// that work with data fetched from the backend API

export interface CrimeStats {
  totalCrimes: number;
  pendingTrials: number;
  convicted: number;
  undetected: number;
  arrestRate: number;
  convictionRate: number;
  topCrimeTypes: Array<{ type: string; count: number; percentage: number }>;
  monthlyTrends: Array<{ month: number; count: number }>;
  faqStages: Array<{ stage: string; count: number; percentage: number }>;
}

export interface CrimeIncident {
  id: string;
  type: string;
  location: string;
  date: string;
  crimeGroup: string;
  status: "pending" | "convicted" | "undetected" | "traced";
  latitude: number;
  longitude: number;
}

// Real statistics from the dataset
export const REAL_CRIME_STATS = {
  totalCrimes: 113118,
  pendingTrials: 37557,
  convicted: 11907,
  undetected: 13967,
  underInvestigation: 28421,
  arrested: 56001,
  accused: 144998,
  arrestRate: 49.08,
  convictionRate: 10.95,
  crimeTypes: [
    { type: "THEFT", count: 19703, percentage: 17.4 },
    { type: "MISSING PERSON", count: 11871, percentage: 10.5 },
    { type: "CYBER CRIME", count: 11063, percentage: 9.8 },
    { type: "MOTOR VEHICLE ACCIDENTS NON-FATAL", count: 10993, percentage: 9.7 },
    { type: "CASES OF HURT", count: 6732, percentage: 6.0 },
    { type: "CHEATING", count: 6472, percentage: 5.7 },
    { type: "NARCOTIC DRUGS", count: 6007, percentage: 5.3 },
    { type: "PUBLIC SAFETY", count: 5373, percentage: 4.7 },
    { type: "MOTOR VEHICLE ACCIDENTS FATAL", count: 3585, percentage: 3.2 },
    { type: "KIDNAPPING AND ABDUCTION", count: 2586, percentage: 2.3 },
  ],
  monthlyData: [
    { month: 1, count: 13154, label: "January" },
    { month: 2, count: 13900, label: "February" },
    { month: 3, count: 9414, label: "March" },
    { month: 4, count: 6284, label: "April" },
    { month: 5, count: 6177, label: "May" },
    { month: 6, count: 7244, label: "June" },
    { month: 7, count: 7809, label: "July" },
    { month: 8, count: 8323, label: "August" },
    { month: 9, count: 8434, label: "September" },
    { month: 10, count: 10481, label: "October" },
    { month: 11, count: 10449, label: "November" },
    { month: 12, count: 11449, label: "December" },
  ],
  yearlyData: [
    { year: 2020, count: 15495 },
    { year: 2021, count: 17396 },
    { year: 2022, count: 23077 },
    { year: 2023, count: 42400 },
    { year: 2024, count: 14750 },
  ],
  firStages: [
    { stage: "Pending Trial", count: 37557, percentage: 33.2 },
    { stage: "Under Investigation", count: 28421, percentage: 25.1 },
    { stage: "Undetected", count: 13967, percentage: 12.3 },
    { stage: "Convicted", count: 11907, percentage: 10.5 },
    { stage: "Traced", count: 10366, percentage: 9.2 },
    { stage: "False Case", count: 6133, percentage: 5.4 },
    { stage: "Compounded", count: 2052, percentage: 1.8 },
    { stage: "Dis/Acq", count: 1275, percentage: 1.1 },
  ],
  heinousVsNonHeinous: [
    { type: "Non Heinous", count: 103630, percentage: 91.7 },
    { type: "Heinous", count: 9488, percentage: 8.3 },
  ],
};

export function generateRecentIncidents(): CrimeIncident[] {
  const crimeTypes = REAL_CRIME_STATS.crimeTypes;
  const statuses: Array<"pending" | "convicted" | "undetected" | "traced"> = [
    "pending",
    "convicted",
    "undetected",
    "traced",
  ];

  return crimeTypes.slice(0, 5).map((crime, idx) => ({
    id: `INC-${Date.now()}-${idx}`,
    type: crime.type,
    crimeGroup: crime.type,
    location: getRandomLocation(),
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    latitude: 12.9716 + (Math.random() - 0.5) * 0.5,
    longitude: 77.5946 + (Math.random() - 0.5) * 0.5,
  }));
}

export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  riskLevel: "high" | "medium" | "low";
  crimeCount: number;
}

// Generate realistic hotspots based on crime data
export function generateHotspots(): Hotspot[] {
  const bengaluruAreas = [
    { name: "Koramangala", lat: 12.9352, lng: 77.6245, crimes: 1250 },
    { name: "Whitefield", lat: 13.0016, lng: 77.7085, crimes: 1100 },
    { name: "Indiranagar", lat: 13.0014, lng: 77.6434, crimes: 950 },
    { name: "Jayanagar", lat: 13.0183, lng: 77.5950, crimes: 890 },
    { name: "Marathahalli", lat: 13.0231, lng: 77.6953, crimes: 750 },
    { name: "Electronic City", lat: 12.8473, lng: 77.6774, crimes: 680 },
    { name: "Cubbon Park", lat: 12.9352, lng: 77.5949, crimes: 720 },
    { name: "Ulsoor", lat: 13.0086, lng: 77.6041, crimes: 620 },
    { name: "Bellandur", lat: 12.9689, lng: 77.6795, crimes: 580 },
    { name: "Yeshwanthpura", lat: 13.0479, lng: 77.5735, crimes: 540 },
  ];

  return bengaluruAreas.map((area, idx) => {
    const crimeLevel = area.crimes;
    let riskLevel: "high" | "medium" | "low";
    
    if (crimeLevel > 1000) riskLevel = "high";
    else if (crimeLevel > 700) riskLevel = "medium";
    else riskLevel = "low";

    return {
      id: `HOTSPOT-${idx + 1}`,
      latitude: area.lat + (Math.random() - 0.5) * 0.02,
      longitude: area.lng + (Math.random() - 0.5) * 0.02,
      riskLevel,
      crimeCount: area.crimes,
    };
  });
}

function getRandomLocation(): string {
  const locations = [
    "Adugodi Police Station",
    "Banaswadi Police Station",
    "Jayanagar Police Station",
    "Indiranagar Police Station",
    "Vijayanagar Police Station",
    "Whitefield Police Station",
    "Electronic City Police Station",
    "Marathahalli Police Station",
    "Cubbon Park Police Station",
    "Yeshwanthapura Police Station",
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

export function getCrimeStatsByType(type: string) {
  return REAL_CRIME_STATS.crimeTypes.find((c) => c.type === type);
}

export function getMonthlyCrimeData(month: number) {
  return REAL_CRIME_STATS.monthlyData.find((m) => m.month === month);
}

export function getYearlyCrimeData(year: number) {
  return REAL_CRIME_STATS.yearlyData.find((y) => y.year === year);
}
