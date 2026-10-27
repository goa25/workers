import { useNavigate } from 'react-router-dom'
import {
  Target, ArrowRight, BarChart3, Award, Users, Shield,
  Cpu, TreePine, Bus, Lightbulb, Recycle, Thermometer,
  CheckCircle, Salad, UserPlus, ClipboardCheck, TrendingUp, MapPin
} from 'lucide-react'

const features = [
  { icon: Target, t: 'Track 11 Core Pledges', d: 'Scientifically validated pledges covering mobility, food, energy and materials, built for Indian households.', c: 'bg-brand-50 text-brand-600' },
  { icon: BarChart3, t: 'India-Specific Carbon Calculations', d: 'IPCC AR6, GHG Protocol, CPCB and CEA India Grid emission factors, with no guesswork.', c: 'bg-blue-50 text-blue-600' },
  { icon: Award, t: 'Earn Certificates', d: 'Verified participation and annual recognition certificates.', c: 'bg-amber-50 text-amber-600' },
  { icon: Users, t: 'Compete on Leaderboards', d: 'Individual, organisation, city, and school rankings from Mumbai to Guwahati.', c: 'bg-violet-50 text-violet-600' },
  { icon: Shield, t: 'Verified Impact', d: 'i-Pledge reviewers verify all submitted evidence before CO₂e is counted.', c: 'bg-rose-50 text-rose-600' },
  { icon: Cpu, t: 'AI-Powered Insights', d: 'Advanced analytics and intelligence for your carbon impact.', c: 'bg-indigo-50 text-indigo-600' },
]

const pledgeList = [
  { icon: Bus, t: 'Switch to Metro, Bus or Carpool', d: '2.1 kg CO₂e per km avoided from car' },
  { icon: TreePine, t: 'Plant and Nurture a Tree', d: '21.77 kg CO₂e sequestered per tree/year' },
  { icon: Lightbulb, t: 'Replace Bulbs with LEDs', d: 'Up to 75% energy saving per bulb' },
  { icon: Salad, t: 'Choose a Veg / Plant-Based Thali', d: '1.5 kg CO₂e per non-veg meal switched' },
  { icon: Recycle, t: 'Segregate and Reduce Waste', d: '2.53 kg CO₂e per kg diverted from landfill' },
  { icon: Thermometer, t: 'Set AC to 24°C', d: '0.3 kWh saved per degree per hour' },
]

const steps = [
  { icon: UserPlus, t: 'Sign up in seconds', d: 'Join free with an OTP on your mobile or Microsoft SSO. No app download needed.' },
  { icon: Target, t: 'Make your pledges', d: 'Pick from 11 science-backed actions that fit your daily life across India.' },
  { icon: ClipboardCheck, t: 'Submit evidence', d: 'Upload a photo or reading. i-Pledge reviewers verify before your CO₂e counts.' },
  { icon: TrendingUp, t: 'Track & climb', d: 'Watch your savings grow and rise up your city and organisation leaderboards.' },
]

const stats = [
  { value: '28+', label: 'States & UTs reached' },
  { value: '12 lakh', label: 'kg CO₂e pledged' },
  { value: '11', label: 'Verified pledges' },
  { value: '100%', label: 'Science-based factors' },
]

export default function LandingPage() {
  const nav = useNavigate()
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="mx-auto flex h-16 max-w-7xl min-w-0 items-center justify-between gap-2 px-3 min-[360px]:px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
            <span className="truncate font-display text-sm font-bold text-slate-900 sm:text-base">i-Pledge</span>
            <span className="hidden md:block text-xs text-slate-400 font-medium">Carbon Impact Platform</span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3">
            <button onClick={() => nav('/pledges')} className="hidden md:inline-flex px-3 py-2 text-sm font-semibold text-slate-600 hover:text-brand-700 transition-colors">
              Explore pledges
            </button>
            <button onClick={() => nav('/leaderboard')} className="hidden lg:inline-flex px-3 py-2 text-sm font-semibold text-slate-600 hover:text-brand-700 transition-colors">
              Leaderboard
            </button>
            <button onClick={() => nav('/auth')} className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 sm:px-4">
              <span className="min-[370px]:hidden">Join</span>
              <span className="hidden min-[370px]:inline">Join Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 relative overflow-hidden" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        <div className="absolute inset-0">
          <img src="/images/india-community-climate-action.jpg" alt="Indian residents planting and caring for a neighbourhood tree together" className="absolute inset-0 w-full h-full object-cover object-[68%_center]" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/78 to-emerald-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-slate-950/30" />
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-3xl text-left">
          <p className="mb-5 border-l-2 border-emerald-400 pl-3 text-sm font-semibold text-emerald-100">
            Global Sustainability Summit 2026 · Vigyan Bhavan, New Delhi
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.08] mb-6 drop-shadow-xl tracking-tight">
            Turn everyday choices into
            <span className="block text-emerald-300 mt-1">measured climate action.</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 leading-relaxed mb-8 max-w-2xl">
            Choose a practical pledge, record what you did and see the estimated carbon saving. Evidence is reviewed before it is added to the campaign total.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
            <button onClick={() => nav('/auth')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-display font-semibold text-base sm:text-lg rounded-sm transition-colors">
              Make a pledge <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => nav('/pledges')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-white/70 text-white font-display font-semibold text-base sm:text-lg rounded-sm hover:bg-white hover:text-emerald-950 transition-colors">
              View all 11 pledges
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/65">
            <span className="inline-flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Free to join</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> No downloads required</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> OTP & Microsoft SSO</span>
          </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8" aria-label="Built for communities across India">
        <div className="max-w-6xl mx-auto bg-white border border-slate-300 shadow-none p-4 sm:p-5 grid grid-cols-1 md:grid-cols-[1.1fr_2fr] gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
            <div><p className="font-display font-bold text-slate-900">Made for everyday India</p><p className="text-xs text-slate-500 mt-0.5">Practical actions, wherever you live.</p></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-slate-600">
            {['Metro & bus commutes', 'Homes & societies', 'Campuses & offices', 'Towns & villages'].map(item => <span key={item} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center">{item}</span>)}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/15">
            {stats.map(s => (
              <div key={s.label} className="py-8 px-4 text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-white">{s.value}</div>
                <div className="text-xs md:text-sm text-emerald-100 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-700 mb-3">What you can do</p>
            <h2 className="section-heading mb-4">Make a pledge and follow its progress</h2>
            <p className="section-subheading max-w-2xl mx-auto">Choose an action, submit evidence and see the verified result.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.t} className="card p-7 hover:border-brand-500 transition-colors duration-150">
                <div className={`w-11 h-11 rounded-xl ${f.c} flex items-center justify-center mb-5`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-display font-semibold text-slate-900 mb-2">{f.t}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-white to-emerald-50/40 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 mb-3">How It Works</p>
            <h2 className="section-heading mb-4">From pledge to verified result</h2>
            <p className="section-subheading max-w-2xl mx-auto">Four clear steps, with the calculation and review visible along the way.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.t} className="relative bg-white border-t-4 border-brand-700 p-6 shadow-none">
                <div className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-700">Step {i + 1}</div>
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-display font-semibold text-slate-900 mb-2">{s.t}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pledges */}
      <section className="py-20 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 mb-3">The Campaign</p>
            <h2 className="section-heading mb-4">I Pledge To: <span className="text-gradient-brand">11 Ways to Reduce Carbon</span></h2>
            <p className="section-subheading max-w-2xl mx-auto">Each pledge is calibrated for Indian homes, commutes and diets using IPCC AR6, GHG Protocol, CPCB and CEA India Grid emission factors.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pledgeList.map(p => (
              <div key={p.t} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg border border-brand-200 bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <p.icon className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm leading-snug">{p.t}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{p.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => nav('/auth')} className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-display font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md">
              View All 11 Pledges <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs text-slate-400 mt-6">Emission factors: IPCC AR6 &middot; UNFCCC &middot; EPA WARM v15 &middot; GHG Protocol &middot; CEA India Grid v21.0</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 relative overflow-hidden bg-brand-900">
        <img src="https://images.unsplash.com/photo-1597149960419-1c3f1a3b0b3f?auto=format&fit=crop&w=1920&q=80" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 to-teal-900/85" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">Ready to make your pledge?</h2>
          <p className="text-base sm:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">Join citizens across India, from metros to small towns, at the Global Sustainability Summit 2026 and beyond.</p>
          <button onClick={() => nav('/auth')} className="inline-flex items-center gap-2 px-9 py-4 bg-white text-brand-700 font-display font-bold text-lg rounded-xl hover:bg-emerald-50 transition-all hover:-translate-y-0.5 shadow-lg">
            Join i-Pledge Today <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 text-slate-400 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row md:gap-6">
            <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1" aria-label="i-Pledge Carbon Impact Platform">
              <span className="font-display font-bold text-white text-sm">i-Pledge</span>
              <span className="hidden text-slate-500 text-xs sm:inline">Carbon Impact Platform</span>
            </div>
            <div className="max-w-xs text-center text-xs leading-relaxed text-slate-500 sm:text-sm">&copy; 2026 &middot; i-Pledge Carbon Impact Platform</div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">DPDP</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
