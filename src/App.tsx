import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";

/**
 * Cleeri 10‑Year Finance & SAFE Dashboard — Sales‑Driven Valuation
 * ----------------------------------------------------------------
 * Single-file React component. Paste into src/App.tsx (Vite) or a Next.js page.
 *
 * Fixes:
 *  • Resolves "Unterminated JSX contents" by properly closing JSX blocks in StageCalculator
 *  • Defines OPEX ordering helpers and persists state to localStorage
 *  • Keeps SelfTest (lightweight test cases) to catch regressions
 */

// ---------- Utils & Types
const currency = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

interface SafeNote { name: string; amount: number; cap: number; }
interface OpexYear { label: string; total: number; breakdown: Record<string, number>; }

type YearKey = 'Y1'|'Y2'|'Y3'|'Y4'|'Y5'|'Y6'|'Y7'|'Y8'|'Y9'|'Y10';
const YEARS: YearKey[] = ['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10'];

const TOTAL_SHARES = 20_000_000;
const STORAGE_KEY = 'cleeri-finance-state-v1';

export default function CleeriFinanceDashboard() {
  // ---------- UI State
  const [page, setPage] = useState<'overview' | 'pnl' | 'assumptions' | 'opex' | 'safe'>('overview');
  const [safeTab, setSafeTab] = useState<'notes'|'valuation inputs'|'valuation'>('notes');
  const [opexTab, setOpexTab] = useState<YearKey>('Y1');
  const [dragIndex, setDragIndex] = useState<number|null>(null);

  // ---------- Model State (with sensible defaults)
  const [assumptions, setAssumptions] = useState({
    // Providers & brands
    startingProviders: 280,
    providerGrowth: 0.40,         // 40% YoY
    startingBrands: 10,
    brandGrowth: 0.15,            // 15% YoY

    // Exchange (GMV) per active provider (monthly $)
    avgGMVperProviderY1: 50,
    gmvPerProviderGrowth: 0.20,   // 20% YoY growth of GMV/provider
    cleeriTakeRate: 0.15,

    // Brand partner incremental GMV ($/month per brand)
    brandGMVperMonth: 200,

    // Subscription (starts Y3+)
    subStartsYear: 3,
    paidPenetrationY3: 0.20,
    paidPenetrationY4: 0.25,
    paidPenetrationY5: 0.30,      // used for Y5+ by default
    proPrice: 9.99,
    plusPrice: 19.99,
    planMixY3: { pro: 1.0, plus: 0.0 },
    planMixY4: { pro: 0.7, plus: 0.3 },
    planMixY5: { pro: 0.6, plus: 0.4 },

    // OPEX (contractors Y1–Y2), FT/scaling Y3–Y10
    opex: {
      Y1:  { CTO_contract: 48_000, Frontend_contract: 36_000, Designer_contract: 30_000, Marketing_contract: 30_000, Accounting: 12_000, Fractional_CFO: 24_000, Tools_SaaS: 24_000 },
      Y2:  { CTO_contract: 48_000, Frontend_contract: 36_000, Designer_contract: 30_000, Marketing_contract: 36_000, Accounting: 12_000, Fractional_CFO: 30_000, Tools_SaaS: 30_000 },
      Y3:  { CTO_salary: 80_000, Product_Manager: 60_000, Designer_UI_Lead: 48_000, Engineering_Team: 96_000, Accounting_CFO: 36_000, Marketing_Growth: 60_000, Tools_SaaS: 36_000 },
      Y4:  { CEO: 120_000, CTO_salary: 140_000, CMO: 120_000, Product_Manager: 100_000, Designer_UI_Lead: 80_000, Engineering_Team: 160_000, Accounting_CFO: 80_000, Marketing_Growth: 120_000, Tools_SaaS: 50_000 },
      Y5:  { CEO: 150_000, CTO_salary: 160_000, CMO: 140_000, Product_Manager: 120_000, Designer_UI_Lead: 100_000, Engineering_Team: 200_000, Accounting_CFO: 100_000, Marketing_Growth: 160_000, Tools_SaaS: 60_000 },
      Y6:  { CEO: 150_000, CTO_salary: 160_000, CMO: 140_000, Product_Manager: 120_000, Designer_UI_Lead: 100_000, Engineering_Team: 200_000, Accounting_CFO: 100_000, Marketing_Growth: 160_000, Tools_SaaS: 60_000 },
      Y7:  { CEO: 150_000, CTO_salary: 165_000, CMO: 145_000, Product_Manager: 125_000, Designer_UI_Lead: 105_000, Engineering_Team: 210_000, Accounting_CFO: 105_000, Marketing_Growth: 170_000, Tools_SaaS: 65_000 },
      Y8:  { CEO: 160_000, CTO_salary: 170_000, CMO: 150_000, Product_Manager: 130_000, Designer_UI_Lead: 110_000, Engineering_Team: 220_000, Accounting_CFO: 110_000, Marketing_Growth: 180_000, Tools_SaaS: 70_000 },
      Y9:  { CEO: 165_000, CTO_salary: 175_000, CMO: 155_000, Product_Manager: 135_000, Designer_UI_Lead: 115_000, Engineering_Team: 230_000, Accounting_CFO: 115_000, Marketing_Growth: 190_000, Tools_SaaS: 75_000 },
      Y10: { CEO: 170_000, CTO_salary: 180_000, CMO: 160_000, Product_Manager: 140_000, Designer_UI_Lead: 120_000, Engineering_Team: 240_000, Accounting_CFO: 120_000, Marketing_Growth: 200_000, Tools_SaaS: 80_000 },
    } as Record<YearKey, Record<string, number>>,

    // Explicit per‑year order for OPEX keys (persisted with localStorage)
    opexOrder: {} as Record<YearKey, string[]>,

    // SAFE notes (editable)
    safes: [
      { name: "Dan McIntyre ($50k @ $1M)", amount: 50_000, cap: 1_000_000 },
      { name: "Ron Davies ($10k @ $2M)", amount: 10_000, cap: 2_000_000 },
      { name: "Dan McIntyre 2 ($10k @ $5M)", amount: 10_000, cap: 5_000_000 },
      { name: "Joel Kramer ($10k @ $5M)", amount: 10_000, cap: 5_000_000 },
    ] as SafeNote[],

    // Valuation inputs (10 years)
    valuationMode: "manual" as "manual" | "multiple",
    valuations: [1_000_000, 5_000_000, 15_000_000, 40_000_000, 100_000_000, 150_000_000, 220_000_000, 300_000_000, 380_000_000, 500_000_000],
    revenueMultiples: [10, 9, 8, 7, 6, 6, 5.5, 5, 4.5, 4],
  });

  // ---------- Persistence
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setAssumptions((prev:any) => ({
          ...prev,
          ...parsed,
          opex: { ...prev.opex, ...(parsed?.opex||{}) },
          opexOrder: { ...prev.opexOrder, ...(parsed?.opexOrder||{}) },
        }));
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(assumptions)); } catch {}
  }, [assumptions]);

  // ---------- Derived Helpers
  const paidPen = (yearIdx:number)=> {
    if (yearIdx < 3) return 0; // before subscriptions start
    if (yearIdx === 3) return assumptions.paidPenetrationY3;
    if (yearIdx === 4) return assumptions.paidPenetrationY4;
    return assumptions.paidPenetrationY5; // Y5+
  };

  const providerByYear = useMemo(() => {
    const arr: number[] = [];
    let base = assumptions.startingProviders;
    for (let i = 0; i < 10; i++) { base = Math.round(base * (1 + assumptions.providerGrowth)); arr.push(isFinite(base) ? base : 0); }
    return arr;
  }, [assumptions.startingProviders, assumptions.providerGrowth]);

  const brandsByYear = useMemo(() => {
    const arr: number[] = []; let b = assumptions.startingBrands;
    for (let i = 0; i < 10; i++) { b = Math.round(i===0 ? b : b * (1 + assumptions.brandGrowth)); arr.push(isFinite(b) ? b : 0); }
    return arr;
  }, [assumptions.startingBrands, assumptions.brandGrowth]);

  const avgGMVperProvByYear = useMemo(() => {
    const arr: number[] = []; for (let i = 0; i < 10; i++) arr.push(assumptions.avgGMVperProviderY1 * Math.pow(1 + assumptions.gmvPerProviderGrowth, i));
    return arr.map(v => (isFinite(v) ? v : 0));
  }, [assumptions.avgGMVperProviderY1, assumptions.gmvPerProviderGrowth]);

  const exchange = useMemo(() => YEARS.map((yk, i) => {
    const providers = providerByYear[i] ?? 0;
    const monthlyPerProv = avgGMVperProvByYear[i] ?? 0;
    const provGMVannual = providers * monthlyPerProv * 12;
    const brands = brandsByYear[i] ?? 0;
    const brandGMVannual = brands * (assumptions.brandGMVperMonth ?? 0) * 12;
    const gmv = (provGMVannual || 0) + (brandGMVannual || 0);
    const take = Math.max(0, Math.min(1, assumptions.cleeriTakeRate ?? 0));
    const revenue = gmv * take;
    return { year: yk, gmv, revenue };
  }), [providerByYear, avgGMVperProvByYear, brandsByYear, assumptions.brandGMVperMonth, assumptions.cleeriTakeRate]);

  const subs = useMemo(() => YEARS.map((_, i) => {
  const yearIdx = i + 1; if ((assumptions.subStartsYear ?? 3) && yearIdx < (assumptions.subStartsYear ?? 3)) return 0;
  const providers = providerByYear[i] ?? 0;
  const paidPenRate = paidPen(yearIdx) ?? 0;
  const planMix = yearIdx === 3 ? assumptions.planMixY3 : yearIdx === 4 ? assumptions.planMixY4 : assumptions.planMixY5;
  const paid = Math.max(0, Math.round(providers * paidPenRate));
  const pro = Math.max(0, Math.round(paid * (planMix.pro ?? 0)));
  const plus = Math.max(0, paid - pro);
  const mrr = pro * (assumptions.proPrice ?? 0) + plus * (assumptions.plusPrice ?? 0);
  return mrr * 12;
}), [providerByYear, assumptions]);


  const opexTotals: OpexYear[] = useMemo(() => {
    const empty: Record<string, number> = {};
    const mapYear = (obj: Record<string, number> | undefined, label: YearKey): OpexYear => {
      const bd = obj && typeof obj === 'object' ? obj : empty;
      const total = Object.values(bd).reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
      return { label, total, breakdown: bd };
    };
    const o = (assumptions && (assumptions as any).opex) ? (assumptions as any).opex as Record<YearKey, Record<string, number>> : ({} as any);
    return YEARS.map(yk => mapYear(o?.[yk], yk));
  }, [assumptions]);

  const pnl = useMemo(() => YEARS.map((label, i) => {
    const revenue = ((exchange[i]?.revenue) ?? 0) + ((subs[i]) ?? 0);
    const opex = (opexTotals[i]?.total) ?? 0;
    const profit = revenue - opex;
    return { label, revenue, opex, profit };
  }), [exchange, subs, opexTotals]);

  const selectedValuations = useMemo(() => {
    if (assumptions.valuationMode === "manual") return (assumptions.valuations ?? []).slice(0, 10).map(v => v ?? 0);
    return pnl.map((row, i) => Math.max(0, row.revenue) * ((assumptions.revenueMultiples?.[i]) ?? (assumptions.revenueMultiples?.at?.(-1) ?? 5)));
  }, [assumptions.valuationMode, assumptions.valuations, assumptions.revenueMultiples, pnl]);

  const safeShareInfo = useMemo(() => {
    const perSafeShares = (assumptions.safes ?? []).map(s => ({ ...s, sharesAtCap: ((s.amount ?? 0) / (s.cap || 1)) * TOTAL_SHARES }));
    const perSharePrice = selectedValuations.map(v => (v ?? 0) / TOTAL_SHARES);
    const valuesByYear = perSafeShares.map(s => selectedValuations.map(v => s.sharesAtCap * ((v ?? 0) / TOTAL_SHARES)));
    return { perSafeShares, perSharePrice, valuesByYear };
  }, [assumptions.safes, selectedValuations]);

  // ---------- Charts
  const revenueChart = pnl.map(r => ({ year: r.label, Revenue: Math.round(r.revenue), Opex: Math.round(r.opex), Profit: Math.round(r.profit) }));
  const valuationChart = selectedValuations.map((v, i) => ({ year: YEARS[i], Valuation: v }));

  // ---------- State Updaters / Mutators
  function updateNested(path: string, value: any) {
    setAssumptions(prev => {
      const copy: any = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cursor: any = copy;
      for (let i = 0; i < keys.length - 1; i++) cursor = cursor[keys[i]];
      cursor[keys[keys.length - 1]] = value;
      return copy;
    });
  }

  // --- OPEX helpers (including DnD order)
  function mutateOpex(yearKey: YearKey, mut: (obj: Record<string, number>) => Record<string, number>) {
    setAssumptions(prev => { const copy: any = JSON.parse(JSON.stringify(prev)); copy.opex = copy.opex || {}; copy.opex[yearKey] = mut(copy.opex[yearKey] || {}); return copy; });
  }

  function ensureOpexOrder(yearKey: YearKey) {
    setAssumptions(prev => {
      const copy: any = JSON.parse(JSON.stringify(prev));
      copy.opexOrder = copy.opexOrder || {};
      if (!Array.isArray(copy.opexOrder[yearKey])) {
        copy.opexOrder[yearKey] = Object.keys(copy.opex?.[yearKey] || {});
      }
      return copy;
    });
  }

  function getOrderedEntries(yearKey: YearKey): [string, number][] {
    const obj = assumptions.opex?.[yearKey] || {};
    const order = (assumptions as any).opexOrder?.[yearKey] as string[] | undefined;
    const keys = order && order.length ? order : Object.keys(obj);
    const seen = new Set<string>();
    const list: [string, number][] = [];
    // first, in saved order
    keys.forEach(k => { if (Object.prototype.hasOwnProperty.call(obj, k) && !seen.has(k)) { seen.add(k); list.push([k, obj[k]]);} });
    // then, any new keys not yet in order
    Object.keys(obj).forEach(k => { if (!seen.has(k)) list.push([k, obj[k]]); });
    return list;
  }

  function setOrder(yearKey: YearKey, newOrder: string[]) {
    setAssumptions(prev => { const copy: any = JSON.parse(JSON.stringify(prev)); copy.opexOrder = copy.opexOrder || {}; copy.opexOrder[yearKey] = newOrder; return copy; });
  }

  function moveOrder(yearKey: YearKey, from: number, to: number) {
    const entries = getOrderedEntries(yearKey).map(([k]) => k);
    const arr = [...entries];
    const [m] = arr.splice(from,1);
    arr.splice(to,0,m);
    setOrder(yearKey, arr);
  }

  function uniqueKey(yearKey: YearKey, desired: string) {
    let base = (desired || '').trim();
    if (!base) base = 'Untitled';
    const obj = (assumptions.opex?.[yearKey]) || {};
    if (!Object.prototype.hasOwnProperty.call(obj, base)) return base;
    let i = 1; let candidate = `${base}_${i}`;
    while (Object.prototype.hasOwnProperty.call(obj, candidate)) { i++; candidate = `${base}_${i}`; }
    return candidate;
  }

  function addOpexLine(yearKey: YearKey) {
    const key = uniqueKey(yearKey, 'New Cost');
    mutateOpex(yearKey, (obj) => ({ ...obj, [key]: 0 }));
    ensureOpexOrder(yearKey);
    // append to order (after state updates land)
    setTimeout(() => {
      const keys = getOrderedEntries(yearKey).map(([k]) => k);
      if (!keys.includes(key)) keys.push(key);
      setOrder(yearKey, keys);
    });
  }

  function deleteOpexLine(yearKey: YearKey, key: string) {
    mutateOpex(yearKey, (obj) => { const { [key]: _, ...rest } = obj; return rest; });
    setAssumptions(prev => { const copy: any = JSON.parse(JSON.stringify(prev)); const arr: string[] = (copy.opexOrder?.[yearKey] || []).filter((k:string)=>k!==key); copy.opexOrder = { ...(copy.opexOrder||{}), [yearKey]: arr }; return copy; });
  }

  function renameOpexKey(yearKey: YearKey, oldKey: string, newKey: string) {
    const safeNew = uniqueKey(yearKey, newKey);
    if (!safeNew || oldKey === safeNew) return;
    mutateOpex(yearKey, (obj) => { const { [oldKey]: val, ...rest } = obj; return { ...rest, [safeNew]: (val ?? 0) }; });
    setAssumptions(prev => { const copy: any = JSON.parse(JSON.stringify(prev)); const arr: string[] = (copy.opexOrder?.[yearKey] || Object.keys(copy.opex?.[yearKey]||{})); copy.opexOrder = copy.opexOrder || {}; copy.opexOrder[yearKey] = arr.map(k => k === oldKey ? safeNew : k); return copy; });
  }

  function setOpexAmount(yearKey: YearKey, key: string, amount: number) { mutateOpex(yearKey, (obj) => ({ ...obj, [key]: amount })); }

  // ---------- Render
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-semibold">Cleeri • 10‑Year Finance & SAFE Dashboard</h1>
            <div className="text-sm text-slate-500">Total Shares Issued: <span className="font-medium">{TOTAL_SHARES.toLocaleString()}</span></div>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <TabBar label="Pages" tabs={["overview","pnl","assumptions","opex","safe"]} active={page} onChange={v=>setPage(v as any)} />
          </div>
        </header>

        {/* ASSUMPTIONS */}
        {page === 'assumptions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="space-y-6">
              <Card title="Growth & Exchange Assumptions">
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Starting Providers" hint="Existing wellness providers at the start of Year 1." value={assumptions.startingProviders} onChange={v => updateNested("startingProviders", v)} />
                  <PercentInput label="Provider Growth (YoY)" hint="Annual growth rate for providers." value={assumptions.providerGrowth} onChange={v => updateNested("providerGrowth", v)} />
                  <NumberInput label="Starting Brands" hint="Number of brand partners at the start of Year 1." value={assumptions.startingBrands} onChange={v => updateNested("startingBrands", v)} />
                  <PercentInput label="Brand Growth (YoY)" hint="Annual growth rate for brands." value={assumptions.brandGrowth} onChange={v => updateNested("brandGrowth", v)} />
                  <MoneyInput label="Avg GMV / Provider / mo (Y1)" hint="Average monthly GMV per provider in Year 1." value={assumptions.avgGMVperProviderY1} onChange={v => updateNested("avgGMVperProviderY1", v)} />
                  <PercentInput label="GMV/Provider Growth" hint="YoY increase in GMV per provider." value={assumptions.gmvPerProviderGrowth} onChange={v => updateNested("gmvPerProviderGrowth", v)} />
                  <PercentInput label="Cleeri Take Rate" hint="Marketplace take rate." value={assumptions.cleeriTakeRate} onChange={v => updateNested("cleeriTakeRate", v)} />
                  <MoneyInput label="Brand GMV / brand / mo" hint="Monthly GMV uplift per brand." value={assumptions.brandGMVperMonth} onChange={v => updateNested("brandGMVperMonth", v)} />
                </div>
              </Card>

              <Card title="Subscriptions (start Y3)">
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Start Year" hint="Year subscriptions begin (1–10)." value={assumptions.subStartsYear} onChange={v => updateNested("subStartsYear", v)} />
                  <MoneyInput label="Pro Price ($)" value={assumptions.proPrice} onChange={v => updateNested("proPrice", v)} />
                  <MoneyInput label="Plus Price ($)" value={assumptions.plusPrice} onChange={v => updateNested("plusPrice", v)} />
                  <PercentInput label="Paid % (Y3)" hint="Used only from year 3 onward; Y5+ uses Y5 value." value={assumptions.paidPenetrationY3} onChange={v => updateNested("paidPenetrationY3", v)} />
                  <PercentInput label="Paid % (Y4)" value={assumptions.paidPenetrationY4} onChange={v => updateNested("paidPenetrationY4", v)} />
                  <PercentInput label="Paid % (Y5+)" value={assumptions.paidPenetrationY5} onChange={v => updateNested("paidPenetrationY5", v)} />
                </div>
              </Card>
            </section>

            <section className="space-y-6">
              <Card title="Topline Metrics">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KPI label="Providers (Y10)" value={providerByYear[9]?.toLocaleString?.() ?? '—'} />
                  <KPI label="Brands (Y10)" value={brandsByYear[9]?.toLocaleString?.() ?? '—'} />
                  <KPI label="Revenue (Y10)" value={currency(pnl[9]?.revenue ?? 0)} />
                  <KPI label="Profit (Y10)" value={currency(pnl[9]?.profit ?? 0)} positive={(pnl[9]?.profit ?? 0) >= 0} />
                </div>
              </Card>
              <Card title="Company Valuation (Mode‑dependent)">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={valuationChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(v) => `$${(v/1_000_000).toFixed(0)}M`} />
                      <Tooltip formatter={(v: any) => currency(v)} />
                      <Legend />
                      <Bar dataKey="Valuation" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-slate-500 mt-2">Per‑share price by year: {safeShareInfo.perSharePrice.map(p => `$${(p ?? 0).toFixed(4)}`).join(" • ")}</div>
              </Card>
            </section>
          </div>
        )}

        {/* OVERVIEW */}
        {page === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card title="Revenue vs OPEX vs Profit (Y1–Y10)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => `$${(v/1_000_000).toFixed(1)}M`} />
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="Revenue" stroke="#0ea5e9" strokeWidth={2} />
                    <Line type="monotone" dataKey="Opex" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Company Valuation (Mode‑dependent)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={valuationChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => `$${(v/1_000_000).toFixed(0)}M`} />
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Legend />
                    <Bar dataKey="Valuation" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-slate-500 mt-2">Per‑share price by year: {safeShareInfo.perSharePrice.map(p => `$${(p ?? 0).toFixed(4)}`).join(" • ")}</div>
            </Card>

            <Card title="SelfTest (sanity checks)">
              <SelfTest providers={providerByYear} brands={brandsByYear} gmvs={avgGMVperProvByYear} opexTotals={opexTotals} pnl={pnl} valuations={selectedValuations} />
            </Card>
          </div>
        )}

        {/* P&L */}
        {page === 'pnl' && (
          <Card title="P&L (Annual)">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2 pr-4">Year</th>
                    <th className="py-2 pr-4">Exchange Rev</th>
                    <th className="py-2 pr-4">Subscription Rev</th>
                    <th className="py-2 pr-4">Total Revenue</th>
                    <th className="py-2 pr-4">OPEX</th>
                    <th className="py-2 pr-4">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {YEARS.map((y, i) => (
                    <tr key={y} className="border-t">
                      <td className="py-2 pr-4 font-medium">{y}</td>
                      <td className="py-2 pr-4">{currency(Math.round(exchange[i]?.revenue ?? 0))}</td>
                      <td className="py-2 pr-4">{currency(Math.round(subs[i] ?? 0))}</td>
                      <td className="py-2 pr-4">{currency(Math.round(pnl[i]?.revenue ?? 0))}</td>
                      <td className="py-2 pr-4">{currency(Math.round(pnl[i]?.opex ?? 0))}</td>
                      <td className={`py-2 pr-4 ${(pnl[i]?.profit ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{currency(Math.round(pnl[i]?.profit ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* OPEX */}
        {page === 'opex' && (
          <Card title="Annual OPEX (edit per year)">
            <YearTabs tabs={YEARS} active={opexTab} onChange={(t)=>setOpexTab(t as YearKey)} />
            {(() => {
              const yk = opexTab as YearKey; const entries = getOrderedEntries(yk);
              return (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="py-2 pr-4 w-6">↕︎</th>
                        <th className="py-2 pr-4">Line Item</th>
                        <th className="py-2 pr-4">Annual Amount</th>
                        <th className="py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(([k,v], i) => (
                        <tr key={k} className="border-t" onDragOver={(e)=>{e.preventDefault();}} onDrop={()=>{ if(dragIndex!==null && dragIndex!==i) moveOrder(yk, dragIndex, i); setDragIndex(null); }}>
                          <td className="py-2 pr-4 text-slate-400">
                            <span
                              className="cursor-grab inline-block"
                              title="Drag to reorder"
                              draggable
                              onDragStart={()=>setDragIndex(i)}
                              onDragEnd={()=>setDragIndex(null)}
                            >
                              ⋮⋮
                            </span>
                          </td>
                          <td className="py-2 pr-4">
                            <input className="rounded-md border px-2 py-1" defaultValue={k} onBlur={(e)=>renameOpexKey(yk, k, e.target.value)} />
                          </td>
                          <td className="py-2 pr-4">
                            <input type="number" step={100} className="rounded-md border px-2 py-1" value={v} onChange={(e)=>setOpexAmount(yk, k, Number(e.target.value))} />
                          </td>
                          <td className="py-2 pr-4">
                            <button className="text-rose-600 hover:underline" onClick={()=>deleteOpexLine(yk, k)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2"><button className="px-3 py-1.5 rounded-md border bg-slate-100 hover:bg-white" onClick={()=>addOpexLine(yk)}>+ Add line</button></div>
                </div>
              );
            })()}
            <div className="mt-3 text-xs text-slate-500">Edits here immediately update P&L, charts, and valuation.</div>
          </Card>
        )}

        {/* SAFE */}
        {page === 'safe' && (
          <div className="space-y-6">
            <TabBar label="SAFE Page" tabs={["notes","valuation inputs","valuation"]} active={safeTab} onChange={(v)=>setSafeTab(v as any)} />

            {safeTab === 'notes' && (
              <Card title="SAFE Notes (Edit Inputs)">
                <div className="space-y-3">
                  {assumptions.safes.map((s, idx) => (
                    <div key={idx} className="rounded-lg border bg-white p-3 space-y-2">
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <MoneyInput label="Amount" value={s.amount} onChange={v => updateNested(`safes.${idx}.amount`, v)} />
                        <MoneyInput label="Cap" value={s.cap} onChange={v => updateNested(`safes.${idx}.cap`, v)} />
                      </div>
                      <div className="text-xs text-slate-500">Shares @ cap: <span className="font-medium">{Math.round((s.amount / s.cap) * TOTAL_SHARES).toLocaleString()}</span></div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {safeTab === 'valuation inputs' && (
              <Card title="Valuation Inputs">
                <div className="rounded-lg border bg-white p-3">
                  <div className="text-sm font-medium mb-2 flex items-center">Valuation Mode <Help text="Manual values or Revenue × Multiple." /></div>
                  <div className="flex items-center gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={assumptions.valuationMode === 'manual'} onChange={() => updateNested('valuationMode','manual')} /> Manual
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={assumptions.valuationMode === 'multiple'} onChange={() => updateNested('valuationMode','multiple')} /> Revenue × Multiple
                    </label>
                  </div>
                  {assumptions.valuationMode === 'manual' ? (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {YEARS.map((y,i) => (
                        <MoneyInput key={y} label={y} hint="Manual valuation for this year." value={assumptions.valuations[i] ?? 0}
                          onChange={val => updateNested(`valuations.${i}`, val)} compact />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {YEARS.map((y,i) => (
                        <NumberInput key={y} label={`${y} ×`} hint="EV/Revenue multiple" value={assumptions.revenueMultiples[i] ?? (assumptions.revenueMultiples.at(-1) || 5)}
                          onChange={val => updateNested(`revenueMultiples.${i}`, val)} compact />
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-2">Per‑share (Y1→Y10): {safeShareInfo.perSharePrice.map(p => `$${(p ?? 0).toFixed(4)}`).join(" • ")}</div>
                </div>
              </Card>
            )}

            {safeTab === 'valuation' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card title="SAFE Value by Year (based on selected valuation mode)">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500">
                          <th className="py-2 pr-4">Investor</th>
                          {YEARS.map(y => (<th key={y} className="py-2 pr-4">{y}</th>))}
                          <th className="py-2 pr-4">Shares @ cap <Help text="(Investment / Cap) × 20,000,000." /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {assumptions.safes.map((s, i) => {
                          const shares = Math.round((s.amount / s.cap) * TOTAL_SHARES);
                          return (
                            <tr key={s.name} className="border-t">
                              <td className="py-2 pr-4 font-medium">{s.name}</td>
                              {safeShareInfo.valuesByYear[i].map((val, idx) => (
                                <td key={idx} className="py-2 pr-4">{currency(val)}</td>
                              ))}
                              <td className="py-2 pr-4">{shares.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <Card title="Stage Valuation Calculator (Any Stage)">
                  <StageCalculator
                    safes={assumptions.safes}
                    years={YEARS as string[]}
                    selectedValuations={selectedValuations}
                    linkedYearIdx={YEARS.indexOf(opexTab)}
                    setLinkedYearIdx={(idx)=>setOpexTab(YEARS[idx])}
                    onApply={(val: number, yIdx: number) => { updateNested('valuationMode','manual'); updateNested(`valuations.${yIdx}`, val); }}
                    onManualSetForYear={(val:number, i:number)=>{ updateNested('valuationMode','manual'); updateNested(`valuations.${i}`, val); }}
                  />
                </Card>
              </div>
            )}
          </div>
        )}

        <footer className="mt-8 text-xs text-slate-500">
          First two years revenue is Exchange‑only; subscriptions begin in Year 3. SAFE values reflect shares at cap times per‑share price from the selected valuation mode.
        </footer>
      </div>
    </div>
  );
}

// ---------- UI primitives
function TabBar({ label, tabs, active, onChange }: { label: string; tabs: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="w-full">
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t} onClick={()=>onChange(t)} className={`px-3 py-2 rounded-lg border text-sm ${active===t? 'bg-white shadow-sm':'bg-slate-100 hover:bg-white'}`}>{t}</button>
        ))}
      </div>
    </div>
  );
}

function YearTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t} onClick={()=>onChange(t)} className={`px-3 py-1.5 rounded-full border text-xs ${active===t? 'bg-indigo-50 border-indigo-200 text-indigo-700':'bg-slate-100 hover:bg-white'}`}>{t}</button>
        ))}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function KPI({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${positive === undefined ? "" : positive ? "text-emerald-600" : "text-rose-600"}`}>{value}</div>
    </div>
  );
}

function Help({ text }: { text: string }) {
  return (
    <span className="ml-1 inline-block align-middle relative group cursor-help select-none">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border text-[10px] leading-none text-slate-600 bg-slate-50">?</span>
      <span className="absolute z-20 hidden group-hover:block left-1/2 -translate-x-1/2 mt-2 w-64 max-w-xs rounded-md border bg-white p-2 text-xs text-slate-700 shadow-lg">
        {text}
      </span>
    </span>
  );
}

function NumberInput({ label, value, onChange, compact, hint }: { label: string; value: number; onChange: (v: number) => void; compact?: boolean; hint?: string }) {
  return (
    <label className={`block ${compact ? "text-xs" : "text-sm"}`}>
      <span className="block text-slate-600 mb-1 flex items-center">{label}{hint ? <Help text={hint} /> : null}</span>
      <input type="number" className="w-full rounded-md border px-2 py-1" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function MoneyInput({ label, value, onChange, compact, hint }: { label: string; value: number; onChange: (v: number) => void; compact?: boolean; hint?: string }) {
  return (
    <label className={`block ${compact ? "text-xs" : "text-sm"}`}>
      <span className="block text-slate-600 mb-1 flex items-center">{label}{hint ? <Help text={hint} /> : null}</span>
      <input type="number" step="100" className="w-full rounded-md border px-2 py-1" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function PercentInput({ label, value, onChange, compact, hint }: { label: string; value: number; onChange: (v: number) => void; compact?: boolean; hint?: string }) {
  return (
    <label className={`block ${compact ? "text-xs" : "text-sm"}`}>
      <span className="block text-slate-600 mb-1 flex items-center">{label}{hint ? <Help text={hint} /> : null}</span>
      <div className="flex items-center gap-2">
        <input type="number" step="0.01" className="w-full rounded-md border px-2 py-1" value={Math.round((value ?? 0) * 1000) / 10} onChange={(e) => onChange(Number(e.target.value) / 100)} />
        <span className="text-slate-500">%</span>
      </div>
    </label>
  );
}

// ---------- Stage calculator component (with Auto/Manual tabs)
function StageCalculator({ safes, years, onApply, selectedValuations, linkedYearIdx, setLinkedYearIdx, onManualSetForYear }: { safes: SafeNote[]; years: string[]; onApply: (valuation: number, yearIndex: number) => void; selectedValuations: number[]; linkedYearIdx: number; setLinkedYearIdx: (i:number)=>void; onManualSetForYear: (valuation:number, yearIndex:number)=>void; }) {
  const [tab, setTab] = React.useState<'auto'|'manual'>('auto');

  // Manual calculator state
  const [annualRevenue, setAnnualRevenue] = React.useState(500_000);
  const [multiple, setMultiple] = React.useState(8);
  const [manualYearIdx, setManualYearIdx] = React.useState(0);
  const impliedValuation = Math.max(0, annualRevenue) * Math.max(0, multiple);
  const impliedPerShare = impliedValuation / TOTAL_SHARES;

  // Auto view derives from model valuation + linked year
  const autoValuation = Math.max(0, selectedValuations[linkedYearIdx] ?? 0);
  const autoPerShare = autoValuation / TOTAL_SHARES;

  return (
    <div>
      <div className="mb-3">
        <TabBar label="Calculator Mode" tabs={["auto","manual"]} active={tab} onChange={(t)=>setTab(t as any)} />
      </div>

      {tab === 'auto' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="rounded-lg border p-3 bg-white">
              <div className="text-slate-500">Model Valuation</div>
              <div className="text-lg font-semibold">{currency(autoValuation)}</div>
              <div className="text-xs text-slate-500">Reflects current mode (Manual or Revenue×Multiple)</div>
            </div>
            <div className="rounded-lg border p-3 bg-white">
              <div className="text-slate-500">Per‑Share Price</div>
              <div className="text-lg font-semibold">${autoPerShare.toFixed(4)}</div>
              <div className="text-xs text-slate-500">Using {TOTAL_SHARES.toLocaleString()} total shares</div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Linked Year</div>
              <select className="rounded-md border px-2 py-1" value={linkedYearIdx} onChange={e=>setLinkedYearIdx(Number(e.target.value))}>
                {years.map((y, i)=>(<option key={y} value={i}>{y}</option>))}
              </select>
              <div className="text-xs text-slate-500 mt-1">Defaults to the currently selected year elsewhere in the model.</div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-4">Investor</th>
                  <th className="py-2 pr-4">Shares @ cap</th>
                  <th className="py-2 pr-4">Value @ linked year</th>
                </tr>
              </thead>
              <tbody>
                {safes.map(s => {
                  const shares = (s.amount / s.cap) * TOTAL_SHARES;
                  return (
                    <tr key={s.name} className="border-t">
                      <td className="py-2 pr-4 font-medium">{s.name}</td>
                      <td className="py-2 pr-4">{Math.round(shares).toLocaleString()}</td>
                      <td className="py-2 pr-4">{currency(shares * autoPerShare)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'manual' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <MoneyInput label="Annual Revenue ($)" hint="Trailing 12‑month or annualized." value={annualRevenue} onChange={setAnnualRevenue} />
            <NumberInput label="Revenue Multiple (×)" hint="EV/Revenue multiple." value={multiple} onChange={setMultiple} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm items-end">
            <div className="rounded-lg border p-3 bg-white"><div className="text-slate-500">Implied Valuation</div><div className="text-lg font-semibold">{currency(impliedValuation)}</div></div>
            <div className="rounded-lg border p-3 bg-white"><div className="text-slate-500">Per‑Share Price</div><div className="text-lg font-semibold">${impliedPerShare.toFixed(4)}</div></div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Apply to Year</div>
              <select className="rounded-md border px-2 py-1" value={manualYearIdx} onChange={e=>setManualYearIdx(Number(e.target.value))}>
                {years.map((y, i)=>(<option key={y} value={i}>{y}</option>))}
              </select>
              <button className="ml-2 px-3 py-1.5 rounded-md border bg-slate-100 hover:bg-white" onClick={()=>onApply(impliedValuation, manualYearIdx)}>Apply</button>
              <div className="text-xs text-slate-500 mt-1">Switches mode to Manual for that year.</div>
            </div>
          </div>

          <div className="rounded-lg border p-3 bg-white">
            <div className="text-sm font-medium mb-2">Direct Manual Edit (by Year)</div>
            <div className="grid grid-cols-5 gap-2">
              {years.map((y, i) => (
                <MoneyInput key={y} label={y} value={selectedValuations[i] ?? 0} onChange={(v)=>onManualSetForYear(v, i)} compact />
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-2">These write directly to Manual valuation values.</div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-4">Investor</th>
                  <th className="py-2 pr-4">Shares @ cap</th>
                  <th className="py-2 pr-4">Value @ selected year</th>
                </tr>
              </thead>
              <tbody>
                {safes.map(s => {
                  const shares = (s.amount / s.cap) * TOTAL_SHARES;
                  const perShare = (selectedValuations[manualYearIdx] ?? 0) / TOTAL_SHARES;
                  return (
                    <tr key={s.name} className="border-t">
                      <td className="py-2 pr-4 font-medium">{s.name}</td>
                      <td className="py-2 pr-4">{Math.round(shares).toLocaleString()}</td>
                      <td className="py-2 pr-4">{currency(shares * perShare)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Lightweight self-test component (acts like test cases)
function SelfTest({ providers, brands, gmvs, opexTotals, pnl, valuations }:{ providers:number[]; brands:number[]; gmvs:number[]; opexTotals:OpexYear[]; pnl:{label:string;revenue:number;opex:number;profit:number}[]; valuations:number[]; }) {
  const tests: {name:string; pass:boolean; detail?:string}[] = [];
  const lenOK = providers.length===10 && brands.length===10 && gmvs.length===10 && opexTotals.length===10 && pnl.length===10 && valuations.length===10;
  tests.push({ name: 'Arrays are all length 10', pass: lenOK, detail: `${providers.length}/${brands.length}/${gmvs.length}/${opexTotals.length}/${pnl.length}/${valuations.length}`});
  tests.push({ name: 'No undefined opexTotals[i].total', pass: opexTotals.every(o => typeof o.total === 'number') });
  tests.push({ name: 'No NaN in P&L rows', pass: pnl.every(r => isFinite(r.revenue) && isFinite(r.opex) && isFinite(r.profit)) });
  const anyFail = tests.some(t=>!t.pass);
  return (
    <div className={`rounded-lg border p-3 ${anyFail ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'}`}>
      <div className="font-medium mb-2">{anyFail ? 'SelfTest: Issues found' : 'SelfTest: All checks passed'}</div>
      <ul className="list-disc pl-5 text-sm">
        {tests.map((t,i)=>(<li key={i} className={t.pass ? 'text-emerald-700' : 'text-rose-700'}>{t.pass ? '✔︎' : '✖︎'} {t.name}{t.detail ? ` — ${t.detail}` : ''}</li>))}
      </ul>
    </div>
  );
}

