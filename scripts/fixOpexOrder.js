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
  if (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }
  const data = row?.data || {};
  const opex = data.opex || {};
  const opexOrder = data.opexOrder || {};
  const YEARS = ['Y1','Y2','Y3','Y4','Y5'];
  YEARS.forEach(y => {
    const obj = opex[y] || {};
    const keys = Object.keys(obj);
    if (keys.length) {
      opexOrder[y] = keys; // maintain insertion order from JSON
    }
  });
  const payload = { ...data, opexOrder };
  const { error: upsertErr } = await supabase.from('assumptions').upsert({ id: 'default', data: payload }, { returning: 'minimal' });
  if (upsertErr) {
    console.error('Upsert error:', upsertErr);
    process.exit(1);
  }
  console.log('Updated opexOrder for Y1-Y5 based on actual opex keys.');
})();
