-- Creates a simple table to store a single assumptions JSON blob
CREATE TABLE IF NOT EXISTS public.assumptions (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Insert a default row placeholder (optional)
INSERT INTO public.assumptions (id, data)
VALUES ('default', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
