"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/app/components/NavBar";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { User } from "@supabase/supabase-js/dist/index.cjs";

interface CrimeReport {
  crime_type: string;
  description: string;
  location: string;
  district: string;
  date_time: string;
  reporter_name?: string;
  reporter_contact?: string;
  witness_available: boolean;
  evidence_available: boolean;
  priority: "high" | "medium" | "low";
}

export default function ReportPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CrimeReport>({
    crime_type: "",
    description: "",
    location: "",
    district: "",
    date_time: "",
    reporter_name: "",
    reporter_contact: "",
    witness_available: false,
    evidence_available: false,
    priority: "medium",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const supabase = createClient();
      
      // Insert report into Supabase
      const { data, error: insertError } = await supabase
        .from('crime_reports')
        .insert([
          {
            ...formData,
            user_id: user?.id,
            status: 'pending',
            verification_status: 'pending', // Report starts as pending verification
            created_at: new Date().toISOString(),
          }
        ])
        .select();

      if (insertError) throw insertError;

      setSuccess(true);
      // Reset form
      setFormData({
        crime_type: "",
        description: "",
        location: "",
        district: "",
        date_time: "",
        reporter_name: "",
        reporter_contact: "",
        witness_available: false,
        evidence_available: false,
        priority: "medium",
      });

      // Show success message for 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50">
      <NavBar user={user ? { email: user.email || '', id: user.id } : undefined} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-slate-900 via-emerald-700 to-emerald-900 bg-clip-text text-transparent mb-2">
            Report a Crime
          </h1>
          <p className="text-slate-600 text-lg">
            Submit a detailed report for immediate police response
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">Report Submitted Successfully!</h3>
              <p className="text-green-800 text-sm mt-1">
                Your report has been received and will be reviewed by our team shortly.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Report Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="space-y-6">
            {/* Crime Type */}
            <div>
              <label htmlFor="crime_type" className="block text-sm font-semibold text-slate-900 mb-2">
                Crime Type <span className="text-red-500">*</span>
              </label>
              <select
                id="crime_type"
                name="crime_type"
                value={formData.crime_type}
                onChange={handleChange}
                required
                className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-slate-100 transition-all"
              >
                <option value="">Select crime type</option>
                <option value="theft">Theft</option>
                <option value="robbery">Robbery</option>
                <option value="assault">Assault</option>
                <option value="burglary">Burglary</option>
                <option value="vehicle_theft">Vehicle Theft</option>
                <option value="vandalism">Vandalism</option>
                <option value="fraud">Fraud</option>
                <option value="domestic_violence">Domestic Violence</option>
                <option value="drug_related">Drug Related</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Provide detailed information about the incident..."
                className="w-full border text-slate-900 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Location and District */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-slate-900 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Street address or landmark"
                  className="text-slate-900 w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-semibold text-slate-900 mb-2">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-slate-100 transition-all"
                >
                  <option value="">Select district</option>
                  <option value="koramangala">Koramangala</option>
                  <option value="whitefield">Whitefield</option>
                  <option value="indiranagar">Indiranagar</option>
                  <option value="jayanagar">Jayanagar</option>
                  <option value="marathahalli">Marathahalli</option>
                  <option value="electronic_city">Electronic City</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Date/Time */}
            <div>
              <label htmlFor="date_time" className="block text-sm font-semibold text-slate-900 mb-2">
                Date & Time of Incident <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="date_time"
                name="date_time"
                value={formData.date_time}
                onChange={handleChange}
                required
                className="w-full border text-slate-900 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Reporter Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reporter_name" className="block text-sm font-semibold text-slate-900 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  id="reporter_name"
                  name="reporter_name"
                  value={formData.reporter_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="text-slate-900 w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="reporter_contact" className="block text-sm font-semibold text-slate-900 mb-2">
                  Contact Number (Optional)
                </label>
                <input
                  type="tel"
                  id="reporter_contact"
                  name="reporter_contact"
                  value={formData.reporter_contact}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  className="text-slate-900 w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-slate-900 mb-2">
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-slate-100 transition-all"
              >
                <option value="low">Low - Non-urgent</option>
                <option value="medium">Medium - Standard response</option>
                <option value="high">High - Urgent attention needed</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="witness_available"
                  checked={formData.witness_available}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-900">Witnesses available</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="evidence_available"
                  checked={formData.evidence_available}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-900">Physical evidence available</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 text-grey py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• For emergencies, call 100 immediately</li>
                <li>• Anonymous reports are accepted and kept confidential</li>
                <li>• Providing contact information helps with follow-up investigations</li>
                <li>• False reports are punishable by law</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
