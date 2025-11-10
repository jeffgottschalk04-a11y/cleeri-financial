import supabase, { SUPABASE_URL, SUPABASE_KEY } from './supabase';

// Serverless proxy base (fallback)
const API_PROXY = '/api/assumptions';

// Expose a simple flag so callers can differentiate missing configuration
// (note) Supabase client may be null when env is missing; functions guard accordingly.

export async function loadAssumptions(): Promise<any | null> {
  if (!supabase) {
    // Try serverless proxy
    try {
      const r = await fetch(API_PROXY);
      if (r.ok) return await r.json();
    } catch {/* ignore */}
    return null;
  }
  try {
    const { data, error } = await supabase.from('assumptions').select('data').eq('id', 'default').single();
    if (error) {
      console.error('Supabase loadAssumptions error', error);
      // REST fallback for load
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const resp = await fetch(`${SUPABASE_URL}/rest/v1/assumptions?id=eq.default&select=data&apikey=${encodeURIComponent(SUPABASE_KEY)}`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
          });
          if (!resp.ok) {
            console.error('REST fallback load failed', resp.status, await resp.text());
            // Try proxy before giving up
            try {
              const pr = await fetch(API_PROXY);
              if (pr.ok) return await pr.json();
            } catch {/* ignore */}
            return null;
          }
          const json = await resp.json();
          return json?.[0]?.data ?? null;
        } catch (restErr) {
          console.error('REST fallback load exception', restErr);
          try {
            const pr = await fetch(API_PROXY);
            if (pr.ok) return await pr.json();
          } catch {/* ignore */}
          return null;
        }
      }
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
    // Use proxy to save
    try {
      const resp = await fetch(API_PROXY, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: obj }),
      });
      if (!resp.ok) return { data: null, error: { message: 'PROXY_SAVE_FAILED', status: resp.status, body: await resp.text() } } as any;
      const saved = await resp.json();
      return { data: saved, error: null };
    } catch (e) {
      return { data: null, error: { message: 'PROXY_EXCEPTION', detail: String(e) } } as any;
    }
  }
  try {
    const payload = { id: 'default', data: obj };
    // Be explicit about conflict target and return the updated row
    const { data, error } = await supabase
      .from('assumptions')
      .upsert(payload, { onConflict: 'id' })
      .select('data')
      .single();
    if (error) {
      console.error('Supabase saveAssumptions error', error);
      // Fallback: attempt direct REST call if we still have URL + KEY
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const restResp = await fetch(`${SUPABASE_URL}/rest/v1/assumptions?id=eq.default&apikey=${encodeURIComponent(SUPABASE_KEY)}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify({ data: obj }),
          });
          if (!restResp.ok) {
            const text = await restResp.text();
            console.warn('REST PATCH returned non-OK, will try POST upsert. Status:', restResp.status, text);
            // Try POST upsert as second chance
            const upsert = await fetch(`${SUPABASE_URL}/rest/v1/assumptions?on_conflict=id&apikey=${encodeURIComponent(SUPABASE_KEY)}`, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation',
              },
              body: JSON.stringify({ id: 'default', data: obj }),
            });
            if (!upsert.ok) {
              const body = await upsert.text();
              console.error('REST fallback POST upsert failed', upsert.status, body);
              return { data: null, error: { message: 'REST_FALLBACK_FAILED', status: upsert.status, body } } as any;
            }
            const row = await upsert.json();
            return { data: row?.[0]?.data ?? null, error: null };
          }
          const json = await restResp.json();
          return { data: json?.[0]?.data ?? null, error: null };
        } catch (restErr) {
          console.error('REST fallback unexpected error', restErr);
          return { data: null, error: { message: 'REST_FALLBACK_EXCEPTION', detail: String(restErr) } } as any;
        }
      }
    }
    return { data, error };
  } catch (err) {
    console.error('saveAssumptions unexpected error', err);
    return null;
  }
}

export default { loadAssumptions, saveAssumptions };

