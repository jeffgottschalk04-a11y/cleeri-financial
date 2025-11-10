// Proxy-only implementation (simplified)
export interface AssumptionsShape { [k: string]: any }
export async function loadAssumptions(): Promise<AssumptionsShape | null> {
  try {
    const r = await fetch('/api/assumptions', { headers: { 'Cache-Control': 'no-cache' } });
    if (!r.ok) {
      console.error('Proxy load failed', r.status, await r.text());
      return null;
    }
    return await r.json();
  } catch (e) {
    console.error('Proxy load exception', e);
    return null;
  }
}
export async function saveAssumptions(obj: AssumptionsShape): Promise<{ ok: boolean; data?: any; error?: any }> {
  try {
    const r = await fetch('/api/assumptions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: obj }),
    });
    if (!r.ok) {
      const body = await r.text();
      console.error('Proxy save failed', r.status, body);
      return { ok: false, error: { status: r.status, body } };
    }
    return { ok: true, data: await r.json() };
  } catch (e) {
    console.error('Proxy save exception', e);
    return { ok: false, error: { message: 'PROXY_EXCEPTION', detail: String(e) } };
  }
}
export default { loadAssumptions, saveAssumptions };

