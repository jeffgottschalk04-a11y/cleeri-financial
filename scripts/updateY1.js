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

const Y1 = {
  'CEO': 80000,
  'Fractional CFO': 12000,
  'Sales/Marketing Manager': 80000,
  'Business Coach': 12000,
  'Marketing Budget': 100000,
  'Product Manager': 80000,
  'UX/UI Designer': 80000,
  'Developer 1': 80000,
  'Developer 2': 80000,
  'Developer 3': 80000,
  'Customer Support': 60000,
  'Saas Tools/AI Tokens': 15000,
};

const Y1_ORDER = [
  'CEO',
  'Fractional CFO',
  'Sales/Marketing Manager',
  'Business Coach',
  'Marketing Budget',
  'Product Manager',
  'UX/UI Designer',
  'Developer 1',
  'Developer 2',
  'Developer 3',
  'Customer Support',
  'Saas Tools/AI Tokens',
];

(async () => {
  const { data: row, error } = await supabase.from('assumptions').select('data').eq('id','default').single();
  if (error) { console.error('Fetch error:', error); process.exit(1); }
  const data = row?.data || {};
  data.opex = data.opex || {};
  data.opexOrder = data.opexOrder || {};
  data.opex.Y1 = Y1;
  data.opexOrder.Y1 = Y1_ORDER;
  const { error: upErr } = await supabase.from('assumptions').upsert({ id: 'default', data }, { returning: 'minimal' });
  if (upErr) { console.error('Upsert error:', upErr); process.exit(1); }
  console.log('Updated Y1 in Supabase with screenshot values.');
})();
