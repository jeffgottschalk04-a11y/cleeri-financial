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

const Y6 = {
  'CEO': 150000,
  'CTO': 180000,
  'CMO': 170000,
  'Business Coach': 60000,
  'Marketing Manager': 120000,
  'CFO': 120000,
  'Book Keeper': 80000,
  'VP Sales': 150000,
  'Account Manager 1': 160000,
  'Account Manager 2': 60000,
  'Account Manager 3': 160000,
  'Account Manager 4': 120000,
  'Account Manager 5': 100000,
  'Product Manager 1': 120000,
  'Product Manager 2': 120000,
  'UX/UI Designer 1 - Lead': 100000,
  'UX/UI Designer 2': 80000,
  'UX/UI Designer 3': 80000,
  'Developer 1': 100000,
  'Developer 2': 100000,
  'Developer 3': 100000,
  'Developer 4': 100000,
  'Developer 5': 100000,
  'Developer 6': 100000,
  'Developer 7': 100000,
  'Developer 8': 100000,
  'Customer Support 1': 80000,
  'Customer Support 2': 80000,
  'Customer Support 3': 80000,
  'Customer Support 4': 80000,
  'Customer Support 5': 80000,
  'Customer Support 6': 80000,
  'Marketing Budget': 2000000,
  'Saas Tools/AI Tokens': 500000,
};

const ORDER = [
  'CEO','CTO','CMO','Business Coach','Marketing Manager','CFO','Book Keeper','VP Sales',
  'Account Manager 1','Account Manager 2','Account Manager 3','Account Manager 4','Account Manager 5',
  'Product Manager 1','Product Manager 2',
  'UX/UI Designer 1 - Lead','UX/UI Designer 2','UX/UI Designer 3',
  'Developer 1','Developer 2','Developer 3','Developer 4','Developer 5','Developer 6','Developer 7','Developer 8',
  'Customer Support 1','Customer Support 2','Customer Support 3','Customer Support 4','Customer Support 5','Customer Support 6',
  'Marketing Budget','Saas Tools/AI Tokens'
];

(async () => {
  const { data: row, error } = await supabase.from('assumptions').select('data').eq('id','default').single();
  if (error) { console.error('Fetch error:', error); process.exit(1); }
  const data = row?.data || {};
  data.opex = data.opex || {};
  data.opexOrder = data.opexOrder || {};
  data.opex.Y6 = Y6;
  data.opexOrder.Y6 = ORDER;
  const { error: upErr } = await supabase.from('assumptions').upsert({ id: 'default', data }, { returning: 'minimal' });
  if (upErr) { console.error('Upsert error:', upErr); process.exit(1); }
  console.log('Updated Y6 in Supabase with screenshot values.');
})();
