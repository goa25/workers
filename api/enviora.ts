// Enviora: Claude-powered voice/chat assistant. Key stays server-side (ANTHROPIC_API_KEY).
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'ANTHROPIC_API_KEY not set' });
  const { messages = [], context = {} } = req.body || {};
  const system = `You are Enviora, the voice assistant of TerraLedger, an Indian carbon-pledge platform where people take climate pledges, submit evidence (verified after email OTP), connect devices (smart meter, EV charger, solar inverter), and climb a live leaderboard. Be warm and concise (max 3 short sentences, spoken style, no markdown). Help track emissions and explain platform features. Live platform data: ${JSON.stringify(context)}. India grid factor ~0.71 kg CO2/kWh. Never invent data beyond what is given.`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.ENVIORA_MODEL || 'claude-sonnet-5-5', max_tokens: 300, system, messages: messages.slice(-12) }),
  });
  const j: any = await r.json();
  if (!r.ok) return res.status(502).json({ error: j?.error?.message || 'Claude error' });
  res.json({ reply: (j.content || []).map((c: any) => c.text || '').join('') });
}
