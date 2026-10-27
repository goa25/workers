import React, { useState } from 'react';
import { Mail, ShieldCheck, X } from 'lucide-react';

const call = (body: object) => fetch('/api/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());

const OtpModal: React.FC<{ onVerified: (email: string) => void; onClose: () => void }> = ({ onVerified, onClose }) => {
  const [email, setEmail] = useState(''); const [code, setCode] = useState('');
  const [token, setToken] = useState(''); const [hint, setHint] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true); setErr('');
    try { const j = await call({ action: 'send', email }); if (j.error) throw new Error(j.error); setToken(j.token); if (j.demo) setHint(`Demo mode (no email key set): your code is ${j.devCode}`); }
    catch (e: any) { setErr(e.message || 'Could not send code'); } finally { setBusy(false); }
  };
  const verify = async () => {
    setBusy(true); setErr('');
    try { const j = await call({ action: 'verify', email, code, token }); j.verified ? onVerified(email) : setErr('Incorrect or expired code'); }
    catch { setErr('Verification failed'); } finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-lg font-bold text-slate-900"><ShieldCheck className="h-5 w-5 text-brand-600" />Verify your email</h3><button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button></div>
        {!token ? (<>
          <p className="mb-3 text-sm text-slate-500">We email a 6-digit code to confirm this submission is really yours.</p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3"><Mail className="h-4 w-4 text-slate-400" /><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full py-3 text-sm outline-none" /></div>
          <button disabled={busy || !email} onClick={send} className="mt-4 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send code'}</button>
        </>) : (<>
          <p className="mb-3 text-sm text-slate-500">Enter the code sent to <b>{email}</b>.</p>
          <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="••••••" className="w-full rounded-lg border border-slate-200 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-brand-500" />
          {hint && <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-700">{hint}</p>}
          <button disabled={busy || code.length < 6} onClick={verify} className="mt-4 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Checking…' : 'Verify & submit'}</button>
        </>)}
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      </div>
    </div>
  );
};
export default OtpModal;
