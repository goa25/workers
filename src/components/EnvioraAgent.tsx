import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, X, Volume2, VolumeX, Sparkles } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };
const FAQ = (q: string, c: any): string => {
  q = q.toLowerCase();
  if (/emission|co2|carbon now|footprint/.test(q)) return c?.liveEmissionKgPerHour != null ? `Right now your connected devices emit about ${c.liveEmissionKgPerHour.toFixed(2)} kilograms of CO2 per hour, with ${c.devicesOnline} devices online.` : 'Open the Live Monitor page to see your real-time emissions.';
  if (/leader|rank/.test(q)) return 'The leaderboard updates every few seconds. Verified evidence moves you up the ranks.';
  if (/otp|verify|email/.test(q)) return 'When you submit evidence, TerraLedger emails you a six digit code to confirm it is really you.';
  if (/evidence|submit/.test(q)) return 'Pick a pledge, enter your monthly numbers, upload a photo or PDF, verify with the email code, and a reviewer checks it.';
  return 'I am Enviora. Ask me about your emissions, devices, pledges, evidence or the leaderboard.';
};

const EnvioraAgent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', content: "Hi, I'm Enviora. Ask me about your emissions, devices or the leaderboard. Tap the mic to talk." }]);
  const [text, setText] = useState(''); const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false); const [voice, setVoice] = useState(true);
  const rec = useRef<any>(null); const end = useRef<HTMLDivElement>(null);
  const SR = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  const speak = (t: string) => { if (!voice || !('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 1.03; window.speechSynthesis.speak(u); };
  const ask = async (q: string) => {
    if (!q.trim() || busy) return; const next: Msg[] = [...msgs, { role: 'user', content: q }]; setMsgs(next); setText(''); setBusy(true);
    const context = (window as any).__terraContext || {}; let reply = '';
    try {
      const r = await fetch('/api/enviora', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content })), context }) });
      const j = await r.json(); reply = j.reply || ''; if (!reply) throw new Error(j.error);
    } catch { reply = FAQ(q, context); }
    setMsgs(m => [...m, { role: 'assistant', content: reply }]); setBusy(false); speak(reply);
  };
  const mic = () => {
    if (!SR) return alert('Voice input needs Chrome or Edge.');
    if (listening) { rec.current?.stop(); return; }
    const r = new SR(); r.lang = 'en-IN'; r.interimResults = false; rec.current = r;
    r.onresult = (e: any) => ask(e.results[0][0].transcript); r.onend = () => setListening(false); r.onerror = () => setListening(false);
    window.speechSynthesis?.cancel(); setListening(true); r.start();
  };

  return (<>
    <button onClick={() => setOpen(o => !o)} aria-label="Open Enviora" className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-white shadow-xl transition hover:scale-105">
      {open ? <X /> : <Sparkles />}{listening && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />}</button>
    {open && <div className="fixed bottom-24 right-5 z-[60] flex h-[30rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-sky-600 px-4 py-3 text-white"><div><p className="font-semibold">Enviora</p><p className="text-xs opacity-80">Emissions voice assistant</p></div>
        <button onClick={() => { setVoice(v => !v); window.speechSynthesis?.cancel(); }}>{voice ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button></div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">{msgs.map((m, i) => <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.role === 'user' ? 'ml-auto bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'}`}>{m.content}</div>)}{busy && <div className="text-xs text-slate-400">Enviora is thinking…</div>}<div ref={end} /></div>
      <div className="flex items-center gap-2 border-t p-2"><button onClick={mic} className={`rounded-full p-2 ${listening ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask(text)} placeholder="Ask about your emissions…" className="flex-1 rounded-full border px-3 py-2 text-sm outline-none" />
        <button onClick={() => ask(text)} className="rounded-full bg-emerald-600 p-2 text-white"><Send className="h-4 w-4" /></button></div>
    </div>}
  </>);
};
export default EnvioraAgent;
