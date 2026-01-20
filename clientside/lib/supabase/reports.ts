
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
  status?: "pending" | "investigating" | "resolved" | "closed" | "rejected";
  verification_status?: "pending" | "approved" | "rejected";
  verified_at?: string;
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
        verification_status: 'pending',
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
    .select(`*, assigned_officer:assigned_officer_id (id, name, badge_number, status, current_location)`)
    .eq('user_id', userId)
    .eq('verification_status', 'approved') // Only show approved reports to users
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function assignOfficerToReport(reportId: string, officerId: string) {
  const supabase = createClient();

  // Update officer to be on call and reference the report
  const { data: officerUpdate, error: officerError } = await supabase
    .from('officers')
    .update({ status: 'on_call', assigned_report_id: reportId, last_assignment: new Date().toISOString() })
    .eq('id', officerId)
    .select()
    .single();

  if (officerError) throw officerError;

  // Update the report to reference the assigned officer
  const { data: reportUpdate, error: reportError } = await supabase
    .from('crime_reports')
    .update({ assigned_officer_id: officerId, status: 'investigating' })
    .eq('id', reportId)
    .select()
    .single();

  if (reportError) throw reportError;

  return { officer: officerUpdate, report: reportUpdate };
}

export async function getUserAllReports(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('crime_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPendingReports() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('crime_reports')
    .select(`*, assigned_officer:assigned_officer_id (id, name, badge_number, status, current_location)`)
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function verifyReport(
  reportId: string,
  action: "approved" | "rejected"
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('crime_reports')
    .update({
      verification_status: action,
      verified_at: new Date().toISOString(),
      status: action === 'approved' ? 'investigating' : 'rejected'
    })
    .eq('id', reportId)
    .select()
    .single();

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