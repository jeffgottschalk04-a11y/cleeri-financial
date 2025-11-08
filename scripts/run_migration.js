#!/usr/bin/env node
// Run SQL migration against Supabase Postgres using credentials from .env
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

const sqlPath = path.resolve(process.cwd(), 'db', 'migrations', '001_create_assumptions.sql');
if (!fs.existsSync(sqlPath)) {
  console.error('Migration file not found:', sqlPath);
  process.exit(1);
}
const sql = fs.readFileSync(sqlPath, 'utf8');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const password = process.env.PG_PASSWORD || process.env.DB_PASSWORD;

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL not found in environment (.env).');
  process.exit(1);
}
if (!password) {
  console.error('Database password not provided. Set PG_PASSWORD environment variable when running this script.');
  process.exit(1);
}

let host;
try {
  const url = new URL(supabaseUrl);
  host = url.hostname;
} catch (err) {
  console.error('Invalid VITE_SUPABASE_URL:', supabaseUrl);
  process.exit(1);
}

// Supabase Postgres usually listens on port 5432 and database 'postgres', user 'postgres'
const client = new Client({
  host,
  port: 5432,
  user: 'postgres',
  password,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('Connecting to Postgres at', host);
    await client.connect();
    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration executed successfully.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
})();
