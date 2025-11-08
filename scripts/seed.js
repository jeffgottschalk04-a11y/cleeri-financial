#!/usr/bin/env node
/*
  Seed script for Supabase `assumptions` row.

  Usage:
    cp .env.example .env
    # edit .env and fill in values
    node scripts/seed.js

  The script uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from process.env (or a .env file when using dotenv).
*/

import('dotenv/config');
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment. Copy .env.example to .env and fill values.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// TODO: Replace the sample `assumptions` object below with the exact expense values from the video.
const assumptions = {
  // minimal shape - the app will merge on load
  opex: {
    Y1: { /* fill values */ },
    Y2: { /* fill values */ },
    Y3: { /* fill values */ },
    Y4: { /* fill values */ },
    Y5: { /* fill values */ },
    Y6: { /* fill values */ },
    Y7: { /* fill values */ },
    Y8: { /* fill values */ },
    Y9: { /* fill values */ },
    Y10: { /* fill values */ },
  },
  opexOrder: {
    Y1: [], Y2: [], Y3: [], Y4: [], Y5: [], Y6: [], Y7: [], Y8: [], Y9: [], Y10: []
  }
};

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
