import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PledgeLearnMoreModal from '../components/PledgeLearnMoreModal';
import { PLEDGES, METHODOLOGY_NOTE } from '../data/pledges';
import type { Pledge } from '../data/pledges';
import {
  Search, ChevronDown, ChevronUp, CheckCircle, Clock, Info, Calculator, ShieldCheck,
  Bus, Car, Bike, Thermometer, Lightbulb, Fan, Refrigerator, Sun, Salad, Package, Zap,
  ArrowRight, Camera, CalendarDays,
} from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  Bus, Car, Bike, Thermometer, Lightbulb, Fan, Refrigerator, Sun, Salad, Package, Zap,
};

const difficultyBadge: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-red-100 text-red-700',
};

const pledgeVisuals: Record<string, { image: string; position: string; eyebrow: string }> = {
  'public-transport': { image: '/images/dashboard-commute.jpg', position: 'object-center', eyebrow: 'Everyday commute' },
  carpooling: { image: '/images/pledge-carpool-india.png', position: 'object-[58%_center]', eyebrow: 'Shared journeys' },
  'walk-cycle': { image: '/images/pledge-walk-cycle-india.png', position: 'object-[63%_center]', eyebrow: 'Short local trips' },
  'ac-optimisation': { image: '/images/pledge-ac-efficiency-india.png', position: 'object-[48%_center]', eyebrow: 'Smarter cooling' },
  'led-lighting': { image: '/images/pledge-led-lighting-india.png', position: 'object-[52%_center]', eyebrow: 'Simple home upgrade' },
  'bldc-fans': { image: '/images/pledge-bldc-fan-india.png', position: 'object-[50%_35%]', eyebrow: 'Efficient comfort' },
  'efficient-appliance': { image: '/images/pledge-efficient-appliance-india.png', position: 'object-[60%_center]', eyebrow: 'Better buying choice' },
  'rooftop-solar': { image: '/images/pledge-rooftop-solar-india.png', position: 'object-[48%_center]', eyebrow: 'Clean power at home' },
  'plant-based-meals': { image: '/images/pledge-plant-based-meal-india.png', position: 'object-[52%_center]', eyebrow: 'Climate-friendly meals' },
  'avoid-plastic': { image: '/images/pledge-avoid-plastic-india.png', position: 'object-[56%_center]', eyebrow: 'Lower-waste routine' },
  'electric-two-wheeler': { image: '/images/pledge-electric-two-wheeler.png', position: 'object-[68%_center]', eyebrow: 'Cleaner daily travel' },
};

const categoryAccent: Record<string, string> = {
  Mobility: 'bg-sky-500',
  Energy: 'bg-amber-500',
  Food: 'bg-lime-500',
  Materials: 'bg-violet-500',
};

export default function PledgeCatalog() {
  const navigate = useNavigate();
  const { state, enrollPledge } = useApp();
  const isAuthenticated = state.isAuthenticated;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedPledge, setExpandedPledge] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [learnMoreId, setLearnMoreId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(PLEDGES.map(p => p.category)))];

  const filtered = PLEDGES.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.officialTitle.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEnroll = (pledge: Pledge) => {
    
    setEnrollingId(pledge.id);
    setExpandedPledge(pledge.id);
  };

  const handleSubmitEnroll = async (pledgeId: string) => {
    await enrollPledge(pledgeId);
    setEnrolledIds(prev => new Set([...prev, pledgeId]));
    setEnrollingId(null);
    setExpandedPledge(null);
    setToast('Pledge enrolled! File a monthly report to track your impact.');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="app-page-surface app-page-pledges min-h-screen">

      <div className="overflow-hidden bg-emerald-950">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[minmax(0,1fr)_minmax(300px,42%)] text-white">
        <div className="order-2 px-4 sm:px-6 lg:pl-8 lg:pr-10 py-10 md:order-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle size={18} className="text-white" />
            </div>
            <span className="text-sm font-medium text-emerald-100 tracking-wide uppercase">i-Pledge · India Campaign</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-3">I Pledge To…</h1>
          <p className="text-emerald-100 max-w-2xl text-base leading-relaxed">
            The 11 recommended core pledges, selected for carbon impact, relevance to daily life,
            evidence availability and methodological defensibility.
          </p>
          <div className="flex flex-wrap gap-3 mt-5 text-sm">
            <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
              <CheckCircle size={14} /> {enrolledIds.size} of 11 pledges enrolled
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
              <Clock size={14} /> Industry-standard methodology · Reviewed
            </span>
          </div>
        </div>
        <div className="relative order-1 h-56 sm:h-64 md:order-2 md:h-auto md:min-h-full"><img src="/images/pledges-household.jpg" alt="An Indian household taking practical sustainability actions" className="absolute inset-0 h-full w-full object-cover object-[70%_center]" /></div>
        </div>
      </div>

      {/* Search + Category filters */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pledges…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-medium px-3.5 py-2 rounded-full border transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pledge grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Search size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No pledges match your search</p>
          </div>
        )}

        <div className="grid grid-cols-6 gap-5">
          {filtered.map((pledge, index) => {
            const Icon = ICONS[pledge.icon] || Zap;
            const visual = pledgeVisuals[pledge.id];
            const isEnrolled = enrolledIds.has(pledge.id);
            const isEnrolling = enrollingId === pledge.id;
            const isExpanded = expandedPledge === pledge.id;
            const isLastCard = index === filtered.length - 1;
            const isInLastPair = index >= filtered.length - 2;
            const tabletSpan = filtered.length % 2 === 1 && isLastCard ? 'sm:col-span-6' : 'sm:col-span-3';
            const desktopSpan = filtered.length % 3 === 1 && isLastCard
              ? 'lg:col-span-6'
              : filtered.length % 3 === 2 && isInLastPair
                ? 'lg:col-span-3'
                : 'lg:col-span-2';

            return (
              <div
                key={pledge.id}
                className={`pledge-card group relative col-span-6 ${tabletSpan} ${desktopSpan} bg-white rounded-[1.35rem] border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/50 ${isEnrolled ? 'border-emerald-300 shadow-md' : 'border-slate-200 shadow-sm'}`}
              >
                <div className={`h-1.5 ${categoryAccent[pledge.category]}`} />
                <div className={`bg-gradient-to-br ${pledge.gradient} relative h-52 overflow-hidden px-5 py-5`}>
                  <img src={visual.image} alt="" aria-hidden="true" loading="lazy" className={`absolute inset-0 h-full w-full object-cover ${visual.position} transition-transform duration-700 group-hover:scale-105`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-950/15" />
                  <div className="relative flex items-start justify-between">
                    <span className="rounded-full border border-white/30 bg-slate-950/35 px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] text-white backdrop-blur-sm">
                      {String(index + 1).padStart(2, '0')} / 11
                    </span>
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm">
                      {pledge.category}
                    </span>
                  </div>
                  {isEnrolled && (
                    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      <CheckCircle size={11} strokeWidth={2.5} /> Enrolled
                    </div>
                  )}
                  <div className="absolute inset-x-5 bottom-5">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/80">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${pledge.iconBg} text-white ring-1 ring-white/30 backdrop-blur-sm`}>
                        <Icon size={17} />
                      </div>
                      {visual.eyebrow}
                    </div>
                    <h3 className="max-w-[88%] font-display text-xl font-bold leading-tight text-white">{pledge.title}</h3>
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-col flex-1 px-5 py-5">
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyBadge[pledge.difficulty]}`}>{pledge.difficulty}</span>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CalendarDays size={11} /> {pledge.timeCommitment}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed min-h-[3.75rem]">{pledge.description}</p>

                  <div className="my-4 rounded-2xl bg-emerald-50/80 p-3.5 ring-1 ring-inset ring-emerald-100">
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      <Calculator size={12} /> Potential impact
                    </div>
                    <p className="text-sm font-bold leading-snug text-emerald-950">{pledge.impact}</p>
                  </div>

                  <div className="mb-4 flex items-start gap-2.5 border-t border-slate-100 pt-3.5">
                    <Camera size={15} className="mt-0.5 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Evidence accepted</p>
                      <p className="pledge-evidence-preview mt-0.5 text-xs leading-relaxed text-slate-500">{pledge.evidence}</p>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-1 gap-2 min-[360px]:grid-cols-[1fr_auto]">
                    {isEnrolled ? (
                      <span className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold py-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                        <CheckCircle size={13} /> Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(pledge)}
                        className="group/enroll flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                      >
                        Enroll <ArrowRight size={14} className="transition-transform group-hover/enroll:translate-x-0.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setLearnMoreId(pledge.id)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      Explore
                    </button>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => setExpandedPledge(isExpanded ? null : pledge.id)}
                      aria-expanded={isExpanded || isEnrolling}
                      aria-controls={`pledge-details-${pledge.id}`}
                      aria-label={isExpanded ? 'Hide details' : 'Show details'}
                      className="flex w-full items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
                    >
                      <Info size={14} />
                      {isExpanded ? 'Hide pledge details' : 'View pledge details'}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {(isExpanded || isEnrolling) && (
                  <div id={`pledge-details-${pledge.id}`} className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                    {isEnrolling ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Confirm your pledge</p>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                          You will report your monthly activity for this pledge under
                          <strong> Activity Report</strong>, where the required inputs and evidence are collected.
                        </p>
                        <div className="flex items-start gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 mb-4">
                          <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-slate-700">Evidence you will need</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{pledge.evidence}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmitEnroll(pledge.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                          >
                            Confirm Pledge
                          </button>
                          <button
                            onClick={() => { setEnrollingId(null); setExpandedPledge(null); }}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">What counts</p>
                        <p className="text-sm text-slate-600 mb-3 leading-relaxed">{pledge.longDescription}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><ShieldCheck size={14} className="text-emerald-600" /> What to submit</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{pledge.evidence}</p>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500">Official wording: <span className="font-medium text-slate-700">{pledge.officialTitle}</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">How impact is measured</p>
          <p>
            {METHODOLOGY_NOTE} The review team approves the factor library, eligibility rules and monthly caps.
            Only quantified, evidence-supported activities enter the official monthly score, and the
            same journey, electricity saving or purchase must not be credited twice.
          </p>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-emerald-700 px-4 py-3 text-white shadow-lg sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md sm:px-5">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
      <PledgeLearnMoreModal pledgeId={learnMoreId} onClose={() => setLearnMoreId(null)} />
    </div>
  );
}
