import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Activity, Zap, Sun, Plug, Thermometer, Wind, Gauge, Trophy, Radio, Server } from 'lucide-react';
import { fetchLeaderboard } from '../api';
import type { IndividualEntry } from '../api';

const GRID = 0.71; // kg CO2 per kWh (India grid average)
type Dev = { id: string; name: string; icon: React.ReactNode; kw: number; solar?: boolean; on: boolean };
const seed: Dev[] = [
  { id: 'meter', name: 'Smart Energy Meter', icon: <Gauge className="h-5 w-5" />, kw: 1.6, on: true },
  { id: 'solar', name: 'Rooftop Solar Inverter', icon: <Sun className="h-5 w-5" />, kw: -1.2, solar: true, on: true },
  { id: 'ev', name: 'EV Charger', icon: <Plug className="h-5 w-5" />, kw: 3.3, on: false },
  { id: 'ac', name: 'Inverter AC Controller', icon: <Thermometer className="h-5 w-5" />, kw: 1.1, on: true },
  { id: 'heater', name: 'Water Heater Relay', icon: <Zap className="h-5 w-5" />, kw: 1.5, on: false },
  { id: 'air', name: 'Air-Quality Sensor', icon: <Wind className="h-5 w-5" />, kw: 0.02, on: true },
];
const BINS = ['<0.5', '0.5–1', '1–1.5', '1.5–2', '2–2.5', '2.5–3', '3+'];

export default function Monitor() {
  const [devs, setDevs] = useState(seed);
  const [samples, setSamples] = useState<{ t: string; kg: number }[]>([]);
  const [board, setBoard] = useState<IndividualEntry[]>([]);
  const [prev, setPrev] = useState<Record<string, number>>({});

  useEffect(() => {
    const t = setInterval(() => {
      setDevs(d => {
        const net = d.filter(x => x.on).reduce((a, x) => a + (x.solar ? x.kw * (0.8 + Math.random() * 0.4) : x.kw * (0.85 + Math.random() * 0.3)), 0);
        const kg = Math.max(0, net * GRID);
        setSamples(s => [...s.slice(-59), { t: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }), kg: Math.round(kg * 100) / 100 }]);
        return d;
      });
    }, 1500);
    const lb = () => fetchLeaderboard('individual').then(r => { setBoard(b => { setPrev(Object.fromEntries(b.map((e, i) => [e.user_id, i]))); return r.slice(0, 8); }); }).catch(() => {});
    lb(); const t2 = setInterval(lb, 3500);
    return () => { clearInterval(t); clearInterval(t2); };
  }, []);

  const hist = useMemo(() => {
    const c = BINS.map(b => ({ bin: b, count: 0 }));
    samples.forEach(s => { const k = s.kg / GRID; c[Math.min(6, Math.floor(k / 0.5))].count++; });
    return c;
  }, [samples]);
  const total = samples.reduce((a, s) => a + s.kg / 3600 * 1.5, 0);
  const now = samples[samples.length - 1]?.kg ?? 0;
  const online = devs.filter(d => d.on).length;

  useEffect(() => { (window as any).__terraContext = { liveEmissionKgPerHour: now, sessionKg: Math.round(total * 1000) / 1000, devicesOnline: online, devices: devs.map(d => ({ name: d.name, connected: d.on, kw: d.kw })), leaderboardTop3: board.slice(0, 3).map(b => ({ name: b.full_name, kg: b.total_carbon_saved_kg })), histogram: hist }; });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400"><Radio className="h-3.5 w-3.5 animate-pulse" />Live telemetry</p>
            <h1 className="mt-1 text-3xl font-bold">Platform & Emissions Monitor</h1>
            <p className="mt-1 text-sm text-slate-400">Connected devices, real-time CO₂ histogram and the live leaderboard, all in one view. Ask Enviora (bottom-right) about any of it.</p></div>
          <div className="flex gap-3 text-sm">
            {[['Now', `${now.toFixed(2)} kg/h`], ['Devices', `${online}/${devs.length}`], ['Session', `${total.toFixed(3)} kg`]].map(([k, v]) => <div key={k} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2"><p className="text-xs text-slate-500">{k}</p><p className="font-bold text-emerald-300">{v}</p></div>)}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
            <h2 className="mb-1 flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-emerald-400" />Live emission rate (kg CO₂/h)</h2>
            <div className="h-56"><ResponsiveContainer><AreaChart data={samples}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.5} /><stop offset="100%" stopColor="#34d399" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#1e293b" /><XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 10 }} /><YAxis stroke="#64748b" tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Area type="monotone" dataKey="kg" stroke="#34d399" fill="url(#g)" isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>
            <h2 className="mb-1 mt-4 font-semibold">Histogram: distribution of load (kW) over last 60 readings</h2>
            <div className="h-52"><ResponsiveContainer><BarChart data={hist}><CartesianGrid stroke="#1e293b" vertical={false} /><XAxis dataKey="bin" stroke="#64748b" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} stroke="#64748b" tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} /><Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Plug className="h-4 w-4 text-sky-400" />Connected devices</h2>
            <ul className="space-y-2">{devs.map(d => (
              <li key={d.id} className="flex items-center gap-3 rounded-xl bg-slate-950 p-3">
                <span className={d.on ? 'text-emerald-400' : 'text-slate-600'}>{d.icon}</span>
                <div className="flex-1"><p className="text-sm font-medium">{d.name}</p><p className="text-xs text-slate-500">{d.on ? `${d.kw > 0 ? '' : 'generating '}${Math.abs(d.kw)} kW` : 'offline'}</p></div>
                <button onClick={() => setDevs(x => x.map(y => y.id === d.id ? { ...y, on: !y.on } : y))} className={`h-6 w-11 rounded-full transition ${d.on ? 'bg-emerald-500' : 'bg-slate-700'}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${d.on ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
              </li>))}</ul>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Trophy className="h-4 w-4 text-amber-400" />Live leaderboard <span className="ml-2 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">updates every 3.5s</span></h2>
            <ol className="space-y-1.5">{board.map((e, i) => { const was = prev[e.user_id]; const mv = was === undefined ? 0 : was - i; return (
              <li key={e.user_id} className="flex items-center gap-3 rounded-lg bg-slate-950 px-3 py-2 text-sm"><span className="w-6 font-bold text-slate-500">{i + 1}</span><span className="flex-1">{e.full_name}<span className="ml-2 text-xs text-slate-500">{e.location_city}</span></span>
                <span className={`text-xs ${mv > 0 ? 'text-emerald-400' : mv < 0 ? 'text-red-400' : 'text-slate-600'}`}>{mv > 0 ? `▲${mv}` : mv < 0 ? `▼${-mv}` : '•'}</span><span className="font-semibold text-emerald-300">{Math.round(e.total_carbon_saved_kg).toLocaleString()} kg</span></li>); })}</ol>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Server className="h-4 w-4 text-violet-400" />Platform health</h2>
            {[['Leaderboard sync', 'Operational'], ['Evidence pipeline', 'Operational'], ['Email OTP service', 'Operational'], ['Enviora (Claude)', 'Operational']].map(([k, v]) => <div key={k} className="flex justify-between border-b border-slate-800 py-2 text-sm last:border-0"><span className="text-slate-400">{k}</span><span className="flex items-center gap-1.5 text-emerald-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />{v}</span></div>)}
          </section>
        </div>
      </div>
    </div>
  );
}
