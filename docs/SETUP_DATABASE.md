# Setup persistence (Supabase / Postgres)

This project now supports persisting `assumptions` (including OPEX and safes) to a Postgres database using Supabase. If Supabase environment variables are present the app will read/write the single `assumptions` row (id = 'default'). When not configured the app falls back to localStorage.

Steps to enable persistent storage with Supabase

1. Create a Supabase project (https://app.supabase.com).
2. Go to SQL Editor and run the migration file `migrations/create_assumptions_table.sql` (or run it via psql):

   psql "postgres://<user>:<pass>@<host>:5432/<db>" -f migrations/create_assumptions_table.sql

3. Create two environment variables for the Vite client (or in Vercel dashboard for deployment):
   - VITE_SUPABASE_URL = https://xyzcompany.supabase.co
   - VITE_SUPABASE_ANON_KEY = <anon-public-api-key>

   In Vercel, set them as Project Environment Variables (both `Production` and `Preview` as needed).

4. Deploy or restart your dev server. The app will attempt to read the `assumptions` row with id = 'default' and fall back to localStorage if none exists.

Notes

- The frontend uses the Supabase JS client directly to upsert the `assumptions` JSON. This keeps the integration lightweight but means the anon key can perform the upsert. If you require stricter access controls, implement server-side endpoints (serverless functions) to authenticate and proxy requests.
- If you'd prefer to use another Postgres provider (Neon, Render, RDS), the SQL migration is standard and the same env vars can point to a REST proxy or a server-side API.

If you want, I can also:
- Add serverless API endpoints (Vercel) to mediate reads/writes and avoid exposing the anon key in the browser, or
- Wire Prisma or an ORM for more structured migrations.
