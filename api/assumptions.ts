// Vercel Serverless Function: Acts as a thin proxy to Supabase REST
// This avoids exposing keys in the client and eliminates build-time env issues.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!URL || !KEY) {
      return res.status(500).json({ error: 'SUPABASE_ENV_MISSING', message: 'Supabase URL or Key not configured on server.' });
    }

    if (req.method === 'GET') {
      const r = await fetch(`${URL}/rest/v1/assumptions?id=eq.default&select=data`, {
        headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` },
      });
      const text = await r.text();
      if (!r.ok) return res.status(r.status).send(text);
      const json = text ? JSON.parse(text) : [];
      return res.status(200).json(json?.[0]?.data ?? null);
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const dataObj = body && body.data ? body.data : body;
      // Prefer upsert via POST for id='default'
      const upsert = await fetch(`${URL}/rest/v1/assumptions?on_conflict=id`, {
        method: 'POST',
        headers: {
          'apikey': KEY,
          'Authorization': `Bearer ${KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({ id: 'default', data: dataObj }),
      });
      const text = await upsert.text();
      if (!upsert.ok) return res.status(upsert.status).send(text);
      const row = text ? JSON.parse(text) : [];
      return res.status(200).json(row?.[0]?.data ?? null);
    }

    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  } catch (err: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: String(err?.message || err) });
  }
}
