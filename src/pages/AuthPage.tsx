import React, { useState } from 'react'
import {
  Eye, EyeOff, ArrowRight, Mail, Lock, User, Building2, Phone,
  Shield, AlertCircle, CheckCircle, MapPin, Briefcase, Users, ChevronDown
} from 'lucide-react'
import { registerUser, loginUser, verifyOtp, ApiError } from '../api'

type AuthMode = 'login' | 'register' | 'otp'

interface AuthUser {
  name: string; email: string; phone: string; organization: string;
  city: string; state: string; ageGroup: string; occupation: string;
  role: 'user' | 'reviewer';
}
interface AuthPageProps {
  onAuth: (user: { name: string; email: string; userId: string; organization?: string; role: 'user' | 'reviewer' | 'admin' }) => void
}

const AGE_GROUPS = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+']
const OCCUPATIONS = ['Student', 'Working Professional', 'Self-Employed / Entrepreneur', 'Homemaker', 'Government Employee', 'NGO / Non-Profit', 'Retired', 'Other']
const INDIA_STATES = ['Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Other']

export default function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPass, setShowPass] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingUserId, setPendingUserId] = useState('')
  const [form, setForm] = useState<AuthUser>({
    name: '', email: '', phone: '', organization: '', city: '', state: '',
    ageGroup: '', occupation: '', role: 'user'
  })
  const [step, setStep] = useState(1)

  const update = (field: keyof AuthUser, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleMSLogin = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onAuth({ name: 'Priya Sharma', email: 'priya@example.com', userId: 'ms-sso', organization: 'Demo Organisation', role: 'user' })
    }, 1500)
  }

  // Dev/demo one-click sign-in — uses the devOtp the backend returns in dev mode
  const quickLogin = async (email: string) => {
    setLoading(true); setError('')
    try {
      const res = await loginUser(email)
      if (!res.devOtp) { setError('Dev OTP unavailable. Is the backend running in dev mode?'); return }
      const v = await verifyOtp({ userId: res.userId, otp: res.devOtp })
      const role: 'user' | 'reviewer' | 'admin' = v.role === 'participant' ? 'user' : v.role
      onAuth({ name: v.name, email: v.email, userId: v.userId, role })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Quick login failed')
    } finally {
      setLoading(false)
    }
  }

  // Login: register (sends OTP) then go to OTP screen
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email) { setError('Please enter your email'); return }
    setLoading(true); setError('')
    try {
      const res = await registerUser({ full_name: form.name || 'User', email: form.email })
      setPendingUserId(res.userId)
      setMode('otp')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Register: collect profile then call /users/register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!form.name || !form.email || !form.phone) { setError('Please fill in all required fields'); return }
      setError(''); setStep(2); return
    }
    if (!form.city || !form.state || !form.ageGroup || !form.occupation) { setError('Please complete your profile'); return }
    setLoading(true); setError('')
    try {
      const res = await registerUser({
        full_name: form.name,
        email: form.email,
        mobile: form.phone,
        location_city: form.city,
        location_state: form.state,
        age_group: form.ageGroup,
        occupation: form.occupation,
        organization: form.organization || undefined,
      })
      setPendingUserId(res.userId)
      setMode('otp')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // OTP verify
  const handleOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.some(d => !d)) { setError('Enter the 6-digit code'); return }
    setLoading(true); setError('')
    try {
      const res = await verifyOtp({ userId: pendingUserId, otp: otp.join('') })
      const role: 'user' | 'reviewer' | 'admin' = res.role === 'participant' ? 'user' : (res.role || form.role)
      onAuth({ name: res.name, email: res.email, userId: res.userId, organization: form.organization, role })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (i: number, val: string) => {
    if (val.length > 1) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) { document.getElementById('otp-' + (i + 1))?.focus() }
  }

  const inp = 'w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white transition-all'
  const sel = 'w-full pl-10 pr-9 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white appearance-none transition-all'

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4 pt-20 relative overflow-hidden">
      <img src="/images/auth-terrace.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-emerald-950/90 to-slate-950/90" />
      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1fr_460px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        <aside className="hidden lg:flex relative min-h-[690px] p-10 text-white flex-col justify-between overflow-hidden">
          <img src="/images/auth-terrace.jpg" alt="A participant using the climate-action platform from a community terrace" className="absolute inset-0 w-full h-full object-cover object-[65%_center]" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/55 to-emerald-950/10" />
          <div className="relative inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-100"><MapPin className="w-4 h-4" /> Climate action, close to home</div>
          <div className="relative">
            <h2 className="font-display text-4xl font-bold leading-tight mb-4">Small actions.<br />A shared Indian impact.</h2>
            <p className="text-emerald-50/80 leading-relaxed max-w-sm">Track meaningful changes across your commute, home, food and neighbourhood. See the verified difference add up.</p>
            <div className="flex flex-wrap gap-2 mt-6">
              {['India-specific factors', '11 core pledges', 'Verified by reviewers'].map(item => <span key={item} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium">{item}</span>)}
            </div>
          </div>
        </aside>
        <div className="p-5 sm:p-8 lg:p-9 bg-slate-50">

        {/* Branding */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 shadow-sm mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold text-slate-900">TerraLedger Carbon Platform</h1>
          <p className="text-slate-500 text-sm mt-1">Global Sustainability Summit 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-200">

          {/* Mode tabs */}
          {mode !== 'otp' && (
            <div className="flex border-b border-slate-100">
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setStep(1) }}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                    mode === m
                      ? 'text-brand-600 border-b-2 border-brand-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          <div className="p-6">
            {error && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            {/* LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <p className="text-xs text-slate-500 -mt-1">Enter your email and we will send a one-time sign-in code.</p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" placeholder="Email address" value={form.email} onChange={e => update('email', e.target.value)} className={inp} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><ArrowRight className="w-4 h-4" />Send Sign-In Code</>}
                </button>
                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 border-t border-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">or continue with</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <button type="button" onClick={handleMSLogin} disabled={loading} className="w-full flex items-center justify-center gap-2.5 border border-slate-200 hover:border-azure-400 hover:bg-azure-50 py-2.5 rounded-lg text-sm font-semibold text-slate-700 transition-all">
                  <svg width="18" height="18" viewBox="0 0 21 21" fill="none"><rect width="10" height="10" fill="#F25022"/><rect x="11" width="10" height="10" fill="#7FBA00"/><rect y="11" width="10" height="10" fill="#00A4EF"/><rect x="11" y="11" width="10" height="10" fill="#FFB900"/></svg>
                  Sign in with Microsoft (Entra ID)
                </button>
              </form>
            )}

            {/* REGISTER */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  {[1, 2].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
                      <span className={`text-xs ${step >= s ? 'text-brand-700 font-medium' : 'text-slate-400'}`}>{s === 1 ? 'Credentials' : 'Profile'}</span>
                      {s < 2 && <div className={`w-8 h-px ${step > s ? 'bg-brand-500' : 'bg-slate-200'}`} />}
                    </div>
                  ))}
                </div>
                {step === 1 ? (
                  <>
                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Full Name" value={form.name} onChange={e => update('name', e.target.value)} className={inp} required /></div>
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="email" placeholder="Email address" value={form.email} onChange={e => update('email', e.target.value)} className={inp} required /></div>
                    <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="tel" placeholder="Mobile number (+91)" value={form.phone} onChange={e => update('phone', e.target.value)} className={inp} required /></div>
                    <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Organisation (optional)" value={form.organization} onChange={e => update('organization', e.target.value)} className={inp} /></div>
                    <div className="relative"><Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><select value={form.role} onChange={e => update('role', e.target.value as 'user' | 'reviewer')} className={sel}><option value="user">Campaign Participant</option><option value="reviewer">Reviewer (requires approval)</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
                    <button type="submit" className="btn-primary w-full justify-center">
                      Next: Complete Profile <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 -mt-1">Tell us about yourself. This helps with leaderboards and impact reporting.</p>
                    <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="City / Town" value={form.city} onChange={e => update('city', e.target.value)} className={inp} required /></div>
                    <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><select value={form.state} onChange={e => update('state', e.target.value)} className={sel} required><option value="">State / UT</option>{INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
                    <div className="relative"><Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><select value={form.ageGroup} onChange={e => update('ageGroup', e.target.value)} className={sel} required><option value="">Age Group</option>{AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
                    <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><select value={form.occupation} onChange={e => update('occupation', e.target.value)} className={sel} required><option value="">Occupation</option>{OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500">
                      <Shield className="inline w-3.5 h-3.5 mr-1" />
                      Your data is protected under GDPR and India DPDP Act. We never share personal data without consent.
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => { setStep(1); setError('') }} className="btn-secondary flex-1 justify-center">&larr; Back</button>
                      <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                        {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                      </button>
                    </div>
                  </>
                )}
                {step === 1 && (
                  <>
                    <div className="relative flex items-center gap-3"><div className="flex-1 border-t border-slate-200" /><span className="text-xs text-slate-400">or</span><div className="flex-1 border-t border-slate-200" /></div>
                    <button type="button" onClick={handleMSLogin} disabled={loading} className="w-full flex items-center justify-center gap-2.5 border border-slate-200 hover:border-azure-400 hover:bg-azure-50 py-2.5 rounded-lg text-sm font-semibold text-slate-700 transition-all">
                      <svg width="18" height="18" viewBox="0 0 21 21" fill="none"><rect width="10" height="10" fill="#F25022"/><rect x="11" width="10" height="10" fill="#7FBA00"/><rect y="11" width="10" height="10" fill="#00A4EF"/><rect x="11" y="11" width="10" height="10" fill="#FFB900"/></svg>
                      Sign up with Microsoft (Entra ID / SSO)
                    </button>
                  </>
                )}
              </form>
            )}

            {/* OTP */}
            {mode === 'otp' && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-display font-bold text-slate-900 mb-1">Verify Your Identity</h3>
                <p className="text-sm text-slate-500 mb-6">
                  We sent a 6-digit code to <span className="font-semibold text-slate-700">{form.email}</span>
                </p>
                <form onSubmit={handleOTP} className="space-y-5">
                  <div className="flex justify-center gap-2">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        className="w-11 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-colors"
                      />
                    ))}
                  </div>
                  {error && <p className="text-sm text-red-600 flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <><CheckCircle className="w-4 h-4" />Verify and Continue</>}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-brand-600 hover:text-brand-800 font-medium"
                    onClick={async () => {
                      try {
                        const res = await registerUser({ full_name: form.name || 'User', email: form.email })
                        setPendingUserId(res.userId)
                      } catch {
                        // silently ignore
                      }
                    }}
                  >
                    Didn't receive a code? Resend
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Dev / demo quick sign-in */}
        <div className="mt-5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" /> Dev Quick Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button" disabled={loading}
              onClick={() => quickLogin('ayushgupta123111@gmail.com')}
              className="rounded-lg bg-brand-700 px-3 py-2.5 text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
            >
              <span className="block text-sm font-semibold">Participant</span>
              <span className="block text-[10px] leading-tight text-white/70">ayushgupta123111@gmail.com</span>
            </button>
            <button
              type="button" disabled={loading}
              onClick={() => quickLogin('ayush.gupta.ug23@nsut.ac.in')}
              className="rounded-lg bg-violet-600 px-3 py-2.5 text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
            >
              <span className="block text-sm font-semibold">Reviewer</span>
              <span className="block text-[10px] leading-tight text-white/70">ayush.gupta.ug23@nsut.ac.in</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Protected under GDPR &amp; India DPDP Act &middot; 2026
        </p>
        </div>
      </div>
    </div>
  )
}
