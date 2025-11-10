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

const Y2 = {
  'CEO': 80000,
  'Fractional CFO': 20000,
  'Sales/Marketing Director': 100000,
  'Business Coach': 15000,
  'Account Manager': 60000,
  'Marketing Budget': 200000,
  'Product Manager': 80000,
  'UX/UI Designer': 80000,
  'Developer 1': 80000,
  'Developer 2': 80000,
  'Developer 3': 80000,
  'Customer Support': 60000,
  'Saas Tools/AI Tokens': 50000,
};

const Y3 = {
  'CEO': 80000,
  'Fractional CFO': 40000,
  'Sales/Marketing Director': 80000,
  'Business Coach': 25000,
  'Account Manager': 60000,
  'Marketing Budget': 200000,
  'Product Manager': 80000,
  'UX/UI Designer': 80000,
  'Developer 1': 80000,
  'Developer 2': 80000,
  'Developer 3': 80000,
  'Developer 4': 80000,
  'Developer 5': 80000,
  'Customer Support 1': 60000,
  'Customer Support 2': 60000,
  'Saas Tools/AI Tokens': 80000,
};

const Y4 = {
  'CEO': 80000,
  'CTO': 150000,
  'CFO': 100000,
  'Sales & Marketing Director': 100000,
  'Business Coach': 40000,
  'Marketing Budget': 500000,
  'Product Manager': 120000,
  'UX/UI Designer': 100000,
  'Developer 1': 100000,
  'Developer 2': 100000,
  'Developer 3': 100000,
  'Developer 4': 100000,
  'Developer 5': 100000,
  'Customer Support 1': 80000,
  'Customer Support 2': 80000,
  'Customer Support 3': 80000,
  'Saas Tools/AI Tokens': 150000,
};

const Y5 = {
  'CEO': 100000,
  'CTO': 180000,
  'CMO': 140000,
  'CFO': 120000,
  'Business Coach': 50000,
  'Book Keeper': 80000,
  'VP Sales': 100000,
  'Account Manager 1': 80000,
  'Account Manager 2': 80000,
  'Product Manager 1': 150000,
  'UX/UI Designer': 120000,
  'Developer 1': 100000,
  'Developer 2': 100000,
  'Developer 3': 100000,
  'Developer 4': 100000,
  'Developer 5': 100000,
  'Developer 6': 100000,
  'Customer Support 1': 80000,
  'Customer Support 2': 80000,
  'Customer Support 3': 80000,
  'Customer Support 4': 80000,
  'Marketing Budget': 1000000,
  'Saas Tools/AI Tokens': 300000,
};

const ORDER = {
  Y2: ['CEO','Fractional CFO','Sales/Marketing Director','Business Coach','Account Manager','Marketing Budget','Product Manager','UX/UI Designer','Developer 1','Developer 2','Developer 3','Customer Support','Saas Tools/AI Tokens'],
  Y3: ['CEO','Fractional CFO','Sales/Marketing Director','Business Coach','Account Manager','Marketing Budget','Product Manager','UX/UI Designer','Developer 1','Developer 2','Developer 3','Developer 4','Developer 5','Customer Support 1','Customer Support 2','Saas Tools/AI Tokens'],
  Y4: ['CEO','CTO','CFO','Sales & Marketing Director','Business Coach','Marketing Budget','Product Manager','UX/UI Designer','Developer 1','Developer 2','Developer 3','Developer 4','Developer 5','Customer Support 1','Customer Support 2','Customer Support 3','Saas Tools/AI Tokens'],
  Y5: ['CEO','CTO','CMO','CFO','Business Coach','Book Keeper','VP Sales','Account Manager 1','Account Manager 2','Product Manager 1','UX/UI Designer','Developer 1','Developer 2','Developer 3','Developer 4','Developer 5','Developer 6','Customer Support 1','Customer Support 2','Customer Support 3','Customer Support 4','Marketing Budget','Saas Tools/AI Tokens'],
};

(async () => {
  const { data: row, error } = await supabase.from('assumptions').select('data').eq('id','default').single();
  if (error) { console.error('Fetch error:', error); process.exit(1); }
  const data = row?.data || {};
  data.opex = data.opex || {};
  data.opexOrder = data.opexOrder || {};
  data.opex.Y2 = Y2;
  data.opex.Y3 = Y3;
  data.opex.Y4 = Y4;
  data.opex.Y5 = Y5;
  data.opexOrder.Y2 = ORDER.Y2;
  data.opexOrder.Y3 = ORDER.Y3;
  data.opexOrder.Y4 = ORDER.Y4;
  data.opexOrder.Y5 = ORDER.Y5;
  const { error: upErr } = await supabase.from('assumptions').upsert({ id: 'default', data }, { returning: 'minimal' });
  if (upErr) { console.error('Upsert error:', upErr); process.exit(1); }
  console.log('Updated Y2–Y5 in Supabase with screenshot values.');
})();
