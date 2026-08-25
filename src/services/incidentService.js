import { supabase } from './supabaseClient'

export function fetchIncidents({ includePending = false } = {}) {
  let query = supabase.from('incidents').select('*').order('created_at', { ascending: false }).limit(200)
  if (!includePending) query = query.eq('status', 'approved')
  return query
}