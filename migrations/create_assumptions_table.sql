-- SQL to create table for storing the app assumptions as JSON
-- Run this once against your Postgres (Supabase) database.

CREATE TABLE IF NOT EXISTS assumptions (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Example insert to initialize:
-- INSERT INTO assumptions (id, data) VALUES ('default', '{}');
