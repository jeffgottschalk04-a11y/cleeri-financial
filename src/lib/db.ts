import supabase from './supabase';

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
  if (!supabase) return null;
  try {
    const payload = { id: 'default', data: obj };
    const { data, error } = await supabase.from('assumptions').upsert(payload);
    if (error) console.error('Supabase saveAssumptions error', error);
    return { data, error };
  } catch (err) {
    console.error('saveAssumptions unexpected error', err);
    return null;
  }
}

export default { loadAssumptions, saveAssumptions };

