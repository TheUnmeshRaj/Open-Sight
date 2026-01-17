
import { createClient } from "@/lib/supabase/client";

export interface CrimeReport {
  id?: string;
  user_id?: string;
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
  status?: "pending" | "investigating" | "resolved" | "closed";
  created_at?: string;
  updated_at?: string;
}

export async function submitCrimeReport(report: CrimeReport) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('crime_reports')
    .insert([
      {
        ...report,
        user_id: user?.id,
        status: 'pending',
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserReports(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('crime_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getReportsByDistrict(district: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('crime_reports')
    .select('*')
    .eq('district', district)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateReportStatus(
  reportId: string,
  status: "pending" | "investigating" | "resolved" | "closed"
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('crime_reports')
    .update({ status })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReportStats() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('crime_reports_stats')
    .select('*');

  if (error) throw error;
  return data;
}