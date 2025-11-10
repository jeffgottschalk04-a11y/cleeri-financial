import supabase from './supabase';

// Expose a simple flag so callers can differentiate missing configuration
export const isSupabaseConfigured = !!supabase;

export async function loadAssumptions(): Promise<any | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('assumptions').select('data').eq('id', 'default').single();
    if (error) {
      console.error('Supabase loadAssumptions error', error);
      return null;
    }
    return data?.data ?? null;
  } catch (err) {
    console.error('loadAssumptions unexpected error', err);
    return null;
  }
}

export async function saveAssumptions(obj: any): Promise<{ data: any; error: any } | null> {
  // If Supabase isn't configured, surface a structured error instead of silently returning null
  if (!supabase) {
    return { data: null, error: { message: 'SUPABASE_NOT_CONFIGURED' } } as any;
  }
  try {
    const payload = { id: 'default', data: obj };
    // Be explicit about conflict target and return the updated row
    const { data, error } = await supabase
      .from('assumptions')
      .upsert(payload, { onConflict: 'id' })
      .select('data')
      .single();
    if (error) console.error('Supabase saveAssumptions error', error);
    return { data, error };
  } catch (err) {
    console.error('saveAssumptions unexpected error', err);
    return null;
  }
}

export default { loadAssumptions, saveAssumptions };

