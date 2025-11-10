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

const Y7 = {
  'CEO': 150000,
  'CTO': 165000,
  'CMO': 145000,
  'Business Coach': 70000,
  'Marketing Manager': 100000,
  'Marketing Manager 2': 100000,
  'CFO': 105000,
  'Book Keeper 1': 80000,
  'Book Keeper 2': 80000,
  'VP Sales': 125000,
  'Account Manager 1': 170000,
  'Account Manager 2': 170000,
  'Account Manager 3': 170000,
  'Account Manager 4': 170000,
  'Account Manager 5': 170000,
  'Account Manager 6': 170000,
  'Product Manager 1': 65000,
  'Product Manager 2': 65000,
  'Product Manager 3': 65000,
  'Product Manager 4': 65000,
  'UX/UI Designer 1 - Lead': 105000,
  'UX/UI Designer 2': 105000,
  'UX/UI Designer 3': 105000,
  'UX/UI Designer 4': 105000,
  'Developer 1 - Lead': 120000,
  'Developer 2': 100000,
  'Developer 3': 100000,
  'Developer 4': 100000,
  'Developer 5': 100000,
  'Developer 6': 100000,
  'Developer 7': 100000,
  'Developer 8': 100000,
  'Developer 9': 100000,
  'Developer 10': 100000,
  'Customer Support 1 - Lead': 100000,
  'Customer Support 2': 80000,
  'Customer Support 3': 80000,
  'Customer Support 4': 80000,
  'Customer Support 5': 80000,
  'Customer Support 6': 80000,
  'Customer Support 7': 80000,
  'Customer Support 8': 80000,
  'Marketing Budget': 3000000,
  'Saas Tools/AI Tokens': 700000,
};

const ORDER = [
  'CEO','CTO','CMO','Business Coach','Marketing Manager','Marketing Manager 2','CFO','Book Keeper 1','Book Keeper 2','VP Sales',
  'Account Manager 1','Account Manager 2','Account Manager 3','Account Manager 4','Account Manager 5','Account Manager 6',
  'Product Manager 1','Product Manager 2','Product Manager 3','Product Manager 4',
  'UX/UI Designer 1 - Lead','UX/UI Designer 2','UX/UI Designer 3','UX/UI Designer 4',
  'Developer 1 - Lead','Developer 2','Developer 3','Developer 4','Developer 5','Developer 6','Developer 7','Developer 8','Developer 9','Developer 10',
  'Customer Support 1 - Lead','Customer Support 2','Customer Support 3','Customer Support 4','Customer Support 5','Customer Support 6','Customer Support 7','Customer Support 8',
  'Marketing Budget','Saas Tools/AI Tokens'
];

(async () => {
  const { data: row, error } = await supabase.from('assumptions').select('data').eq('id','default').single();
  if (error) { console.error('Fetch error:', error); process.exit(1); }
  const data = row?.data || {};
  data.opex = data.opex || {};
  data.opexOrder = data.opexOrder || {};
  data.opex.Y7 = Y7;
  data.opexOrder.Y7 = ORDER;
  const { error: upErr } = await supabase.from('assumptions').upsert({ id: 'default', data }, { returning: 'minimal' });
  if (upErr) { console.error('Upsert error:', upErr); process.exit(1); }
  console.log('Updated Y7 in Supabase with screenshot values.');
})();
