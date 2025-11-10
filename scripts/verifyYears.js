#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  const { data: row, error } = await supabase.from('assumptions').select('data').eq('id','default').single();
  if (error) { console.error('Fetch error:', error); process.exit(1); }
  const d = row.data;
  const out = {
    Y2: Object.keys(d.opex.Y2),
    Y3_first8: Object.keys(d.opex.Y3).slice(0,8),
    Y4_marketingBudget: d.opex.Y4['Marketing Budget'],
    Y5_count: Object.keys(d.opex.Y5).length,
    Y5_head: Object.entries(d.opex.Y5).slice(0,8),
    Y6_count: d.opex.Y6 ? Object.keys(d.opex.Y6).length : 0,
    Y6_head: d.opex.Y6 ? Object.entries(d.opex.Y6).slice(0,8) : [],
  };
  console.log(JSON.stringify(out, null, 2));
})();
