import { createClient } from '@supabase/supabase-js';

// Vite only exposes variables prefixed with VITE_. For resilience, try common fallbacks,
// but note that non-VITE_* names won't be available unless added via build-time define.
const env = import.meta.env as any;
const SUPABASE_URL: string | undefined = env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
const SUPABASE_KEY: string | undefined = env.VITE_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
	// Helpful guidance in dev/preview when envs are missing/misnamed
	console.warn('[supabase] Missing env vars. For Vite apps, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Production & Preview).');
}

export const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default supabase;
