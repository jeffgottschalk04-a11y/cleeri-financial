#!/usr/bin/env node
/*
  Seed script for Supabase `assumptions` row.

  Usage:
    cp .env.example .env
    # edit .env and fill in values
    node scripts/seed.js

  The script uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from process.env (or a .env file when using dotenv).
*/

import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment. Copy .env.example to .env and fill values.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const seedPath = path.resolve(process.cwd(), 'scripts', 'assumptions.seed.json');
if (!fs.existsSync(seedPath)) {
  console.error('Seed file not found:', seedPath);
  process.exit(1);
}
const assumptions = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

(async () => {
  try {
    const { error } = await supabase.from('assumptions').upsert({ id: 'default', data: assumptions }, { returning: 'minimal' });
    if (error) {
      console.error('Seed upsert error:', error);
      process.exit(1);
    }
    console.log('Seed upsert completed.');
  } catch (err) {
    console.error('Unexpected error while seeding:', err);
    process.exit(1);
  }
})();
