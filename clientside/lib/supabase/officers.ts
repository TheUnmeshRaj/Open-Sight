import { createClient } from "./client";

export interface Officer {
  id?: string;
  name: string;
  unit: string;
  status: "available" | "on_call" | "busy";
  last_assignment: string;
  current_location: string;
  badge_number: string;
  phone?: string;
  assigned_district?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getOfficers() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAvailableOfficers() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .eq('status', 'available')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function addOfficer(officer: Officer) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('officers')
    .insert([officer])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOfficerStatus(
  officerId: string,
  status: Officer['status'],
  location?: string
) {
  const supabase = createClient();

  const updates: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (status !== 'available') {
    updates.last_assignment = new Date().toISOString();
  }

  if (location) {
    updates.current_location = location;
  }

  const { data, error } = await supabase
    .from('officers')
    .update(updates)
    .eq('id', officerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOfficer(officerId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('officers')
    .delete()
    .eq('id', officerId);

  if (error) throw error;
}

export async function getOfficersByDistrict(district: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .eq('assigned_district', district)
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}
