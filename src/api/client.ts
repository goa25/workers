// TerraLedger Carbon Platform: API Client
// Base fetch wrapper with auth header + error handling

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://TerraLedger-api.azurewebsites.net/api';

export function getToken(): string | null {
  return localStorage.getItem('TerraLedger_token');
}

export function setToken(token: string): void {
  localStorage.setItem('TerraLedger_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('TerraLedger_token');
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

// Built-in local backend (localStorage + live simulation) so the demo works with zero infrastructure.
const DB = 'terraledger_db_v1';
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const NAMES = ['Aarav Sharma','Diya Patel','Kabir Singh','Ananya Iyer','Rohan Mehta','Meera Nair','Vihaan Gupta','Isha Reddy','Arjun Das','Saanvi Rao','Neil Fernandes','Tara Kapoor','Yash Verma','Riya Joshi','Dev Malhotra'];
const ORGS = ['GreenGrid Labs','Urban Roots','SolarSathi','Delhi Metro Club','Blue Planet NGO','EcoCampus','TerraTech','CycleIndia'];
const CITIES = ['Delhi','Mumbai','Bengaluru','Pune','Chennai','Hyderabad','Kolkata','Jaipur'];
function db(): any {
  try { const d = JSON.parse(localStorage.getItem(DB) || ''); if (d?.ind) return d; } catch { /* seed */ }
  const d = { ind: NAMES.map((n, i) => ({ full_name: n, organization: ORGS[i % 8], location_city: CITIES[(i * 3) % 8], total_carbon_saved_kg: Math.round(rnd(400, 2600)), user_id: 'u' + i })),
    org: ORGS.map(o => ({ organization: o, total_carbon_saved_kg: Math.round(rnd(3000, 14000)), member_count: Math.round(rnd(20, 300)) })),
    city: CITIES.map(c => ({ city: c, total_carbon_saved_kg: Math.round(rnd(5000, 30000)), member_count: Math.round(rnd(80, 900)) })), subs: [] as any[] };
  localStorage.setItem(DB, JSON.stringify(d)); return d;
}
const save = (d: any) => localStorage.setItem(DB, JSON.stringify(d));
function tick(d: any) { // live movement on every poll
  const bump = (a: any[]) => a.forEach(x => { if (Math.random() < 0.55) x.total_carbon_saved_kg = Math.round((x.total_carbon_saved_kg + rnd(1, 18)) * 10) / 10; });
  bump(d.ind); bump(d.org); bump(d.city); save(d);
}
async function localApi(path: string, method: string, body: any): Promise<any> {
  const d = db(); const sorted = (a: any[]) => [...a].sort((x, y) => y.total_carbon_saved_kg - x.total_carbon_saved_kg);
  let m;
  if ((m = path.match(/^\/leaderboard\/(individual|organization|city)/))) { tick(d); return sorted(m[1] === 'individual' ? d.ind : m[1] === 'organization' ? d.org : d.city); }
  if (path === '/pledges') return [];
  if (path === '/pledges/enroll') return { message: 'Enrolled' };
  if (path === '/evidence/upload-url') return { uploadUrl: 'local:', blobUrl: 'local://' + body.fileName, blobName: body.fileName, expiresAt: '' };
  if (path === '/submissions' && method === 'POST') {
    const kg = Math.round(Object.values(body.inputs || {}).reduce((a: number, v: any) => a + (Number(v) || 0), 0) * 0.35 * 10) / 10;
    const s = { id: 's' + Date.now(), user_id: body.userId, pledge_id: body.pledgeId, pledge_name: 'Pledge #' + body.pledgeId, month: body.month, inputs: JSON.stringify(body.inputs),
      carbon_saved_kg: kg, status: 'Pending', rejection_reason: null, submitted_at: new Date().toISOString(), reviewed_at: null, blob_url: body.blobUrl || null, file_type: body.fileType || null,
      full_name: 'Guest Pledger', email: 'guest@terraledger.app', organization: 'TerraLedger', location_city: 'Delhi', ai_status: null };
    d.subs.unshift(s); save(d); return { submissionId: s.id, carbonSaved: kg, status: 'Pending', message: 'Submitted' };
  }
  if ((m = path.match(/^\/submissions\/user\//))) return d.subs;
  if (path === '/submissions/pending') return d.subs.filter((s: any) => s.status === 'Pending');
  if ((m = path.match(/^\/submissions\/(.+)\/(verify|reject|flag)$/))) {
    const s = d.subs.find((x: any) => x.id === m![1]);
    if (s) { s.status = m[2] === 'verify' ? 'Verified' : m[2] === 'reject' ? 'Rejected' : 'Flagged'; s.rejection_reason = body?.reason || null; s.reviewed_at = new Date().toISOString();
      if (s.status === 'Verified') { d.ind[0].total_carbon_saved_kg += s.carbon_saved_kg; } save(d); }
    return { message: 'ok' };
  }
  if (path.includes('/ai-log') || path.startsWith('/certificates')) return [];
  return {};
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  await new Promise(r => setTimeout(r, 120));
  return localApi(path, (options.method || 'GET').toUpperCase(), options.body) as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
