import crypto from 'node:crypto';
// Stateless email OTP: server signs {email, expiry, code}; no database needed.
const SECRET = process.env.OTP_SECRET || 'terraledger-dev-secret';
const sign = (p: string) => crypto.createHmac('sha256', SECRET).update(p).digest('hex');
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { action, email, code, token } = req.body || {};
  if (action === 'send') {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '')) return res.status(400).json({ error: 'Valid email required' });
    const otp = String(crypto.randomInt(100000, 999999));
    const exp = Date.now() + 10 * 60 * 1000;
    const t = `${email}|${exp}|${sign(`${email}|${exp}|${otp}`)}`;
    const key = process.env.RESEND_API_KEY;
    if (!key) return res.json({ token: t, demo: true, devCode: otp });
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.OTP_FROM || 'TerraLedger <onboarding@resend.dev>', to: [email], subject: `${otp} is your TerraLedger code`,
        html: `<div style="font-family:sans-serif"><h2>TerraLedger</h2><p>Your verification code:</p><p style="font-size:32px;letter-spacing:6px;font-weight:700">${otp}</p><p>Expires in 10 minutes.</p></div>` }),
    });
    return r.ok ? res.json({ token: t }) : res.status(502).json({ error: 'Email provider rejected the request' });
  }
  if (action === 'verify') {
    const [e, exp, mac] = String(token || '').split('|');
    const good = sign(`${e}|${exp}|${code}`);
    const ok = !!e && Number(exp) > Date.now() && (mac || '').length === good.length && crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(good));
    return res.json({ verified: !!ok && e === email });
  }
  res.status(400).json({ error: 'Unknown action' });
}
