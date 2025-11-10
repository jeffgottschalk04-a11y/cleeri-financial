import { createClient } from '@supabase/supabase-js';

// Vite only exposes variables prefixed with VITE_. For resilience, try common fallbacks,
// but note that non-VITE_* names won't be available unless added via build-time define.
const env = import.meta.env as any;
// Deterministic selection: prefer VITE_*; else NEXT_PUBLIC_*; else SUPABASE_*
export const SUPABASE_URL: string | undefined = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
export const SUPABASE_KEY: string | undefined = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

// Warn if multiple are set but don't match (common cause of 401 on REST)
const urls = [env.VITE_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_URL].filter(Boolean);
const keys = [env.VITE_SUPABASE_ANON_KEY, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, env.SUPABASE_ANON_KEY].filter(Boolean);
const uniq = (arr: any[]) => Array.from(new Set(arr));
if (urls.length > 1 && uniq(urls).length > 1) {
	console.warn('[supabase] Multiple SUPABASE URLs set with different values. Using priority VITE_ > NEXT_PUBLIC_ > SUPABASE_.');
}
if (keys.length > 1 && uniq(keys).length > 1) {
	console.warn('[supabase] Multiple SUPABASE keys set with different values. Using priority VITE_ > NEXT_PUBLIC_ > SUPABASE_.');
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
	// Helpful guidance in dev/preview when envs are missing/misnamed
	console.warn('[supabase] Missing env vars. For Vite apps, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Production & Preview).');
}

export const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default supabase;
