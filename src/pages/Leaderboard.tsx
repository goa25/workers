import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, Users, Building2, MapPin, GraduationCap, Info, RefreshCw } from 'lucide-react';
import { fetchLeaderboard } from '../api';
import type { IndividualEntry, OrgEntry, CityEntry } from '../api';
import { useApp } from '../context/AppContext';
import IndiaPageHeader from '../components/IndiaPageHeader';

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
    <Info className="w-9 h-9 text-slate-200" />
    <p className="text-sm text-center max-w-md leading-relaxed">{message}</p>
  </div>
);

const MONTHS = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'];
const MONTH_LABELS: Record<string, string> = {
  '2026-01':'Jan 2026','2026-02':'Feb 2026','2026-03':'Mar 2026','2026-04':'Apr 2026',
  '2026-05':'May 2026','2026-06':'Jun 2026','2026-07':'Jul 2026',
};

const Leaderboard: React.FC = () => {
  const { state } = useApp();
  const currentUserId = state.user?.id || '';
  const [activeTab, setActiveTab] = useState<'individual' | 'organization' | 'city'>('individual');
  const [view, setView] = useState<'monthly' | 'cumulative'>('cumulative');
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [data, setData] = useState<(IndividualEntry | OrgEntry | CityEntry)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'individual' as const, label: 'Individual', icon: <Users className="w-4 h-4" /> },
    { id: 'organization' as const, label: 'Organisation', icon: <Building2 className="w-4 h-4" /> },
    { id: 'city' as const, label: 'City', icon: <MapPin className="w-4 h-4" /> },
  ];

  const load = () => {
    setLoading(true); setError('');
    const month = view === 'monthly' ? selectedMonth : undefined;
    fetchLeaderboard(activeTab as any, month)
      .then(d => setData(d))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); const t = setInterval(() => { fetchLeaderboard(activeTab as any, view === 'monthly' ? selectedMonth : undefined).then(setData).catch(() => {}); }, 3500); return () => clearInterval(t); }, [activeTab, view, selectedMonth]);

  const totalCO2 = data.reduce((a, d) => a + (d as any).total_carbon_saved_kg, 0);

  return (
    <div className="app-page-surface app-page-general min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        <IndiaPageHeader
          title="India Climate Action Leaderboard"
          description="Celebrate verified contributions from individuals, organisations and communities. We recognise consistent everyday action, not just the biggest totals."
          imageSrc="/images/leaderboard-community.jpg"
          imageAlt="An inclusive community climate-action team"
          chips={['Individuals', 'Organisations', 'Cities across India']}
        />

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Participants', icon: <Users className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', border: 'border-blue-100',
              value: activeTab === 'individual' ? String(data.length) : String((data as (OrgEntry | CityEntry)[]).reduce((a, d) => a + d.member_count, 0)) },
            { label: 'Total Verified CO₂e Reduced', icon: <Award className="w-5 h-5 text-brand-600" />, bg: 'bg-brand-50', border: 'border-brand-100',
              value: totalCO2 > 0 ? totalCO2.toFixed(1) + ' kg' : 'Not available' },
            { label: activeTab === 'individual' ? 'Top Performer' : activeTab === 'organization' ? 'Top Organisation' : 'Top City',
              icon: <Trophy className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', border: 'border-amber-100',
              value: data.length > 0 ? (activeTab === 'individual' ? (data[0] as IndividualEntry).full_name : activeTab === 'organization' ? (data[0] as OrgEntry).organization : (data[0] as CityEntry).city) : 'Not available' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.bg} border ${s.border}`}>{s.icon}</div>
              <div>
                <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{loading ? '…' : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
          <div className="tab-group flex-wrap">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab-item ${activeTab === t.id ? 'tab-item-active' : ''}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="tab-group">
            {(['monthly', 'cumulative'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`tab-item capitalize ${view === v ? (v === 'monthly' ? 'tab-item-active !bg-amber-100 !text-amber-800 ring-1 ring-amber-300' : 'tab-item-active !bg-brand-100 !text-brand-800 ring-1 ring-brand-300') : ''}`}>
                <TrendingUp className="w-3.5 h-3.5" />{v}
              </button>
            ))}
          </div>
          {view === 'monthly' && (
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="input py-1.5 text-xs w-auto">
              {MONTHS.map(m => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
            </select>
          )}
          <button onClick={load} className="ml-auto flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 ${view === 'monthly' ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div><p className="text-sm font-semibold">{view === 'monthly' ? `${MONTH_LABELS[selectedMonth]} performance` : 'All-time verified impact'}</p><p className="mt-0.5 text-xs opacity-75">{view === 'monthly' ? 'Ranks activity verified for the selected calendar month only.' : 'Ranks the complete verified contribution recorded for each participant or community.'}</p></div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Table */}
        <div className="leaderboard-table bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          {activeTab === 'individual' && (
            <>
              <div className="grid grid-cols-5 gap-4 bg-slate-50 border-b border-slate-200 px-6 py-3">
                {['Rank', 'Name', 'Organisation', 'City', 'CO₂e Reduced'].map(h => (
                  <span key={h} className="text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</span>
                ))}
              </div>
              {loading ? (
                <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
              ) : data.length === 0 ? (
                <EmptyState message="No individual rankings yet. Rankings populate as participants earn verified reports." />
              ) : (
                <div>
                  {(data as IndividualEntry[]).map((entry, i) => (
                    <div key={entry.user_id} className={`grid grid-cols-5 gap-4 px-6 py-4 border-b border-slate-100 last:border-0 items-center ${entry.user_id === currentUserId ? 'bg-brand-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <div className="flex items-center gap-2">
                        {i === 0 ? <Trophy className="w-5 h-5 text-amber-500" /> : i === 1 ? <Award className="w-5 h-5 text-slate-400" /> : i === 2 ? <Award className="w-5 h-5 text-amber-700" /> : <span className="text-sm font-bold text-slate-400 w-5 text-center">{i + 1}</span>}
                      </div>
                      <div className="font-semibold text-sm text-slate-800 flex items-center gap-1">{entry.full_name}{entry.user_id === currentUserId && <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">You</span>}</div>
                      <div className="text-xs text-slate-500">{entry.organization || 'Not provided'}</div>
                      <div className="text-xs text-slate-500">{entry.location_city || 'Not provided'}</div>
                      <div className="font-bold text-brand-700 text-sm">{entry.total_carbon_saved_kg.toFixed(1)} kg</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'organization' && (
            <>
              <div className="grid grid-cols-4 gap-4 bg-slate-50 border-b border-slate-200 px-6 py-3">
                {['Rank', 'Organisation', 'Members', 'CO₂e Reduced'].map(h => (
                  <span key={h} className="text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</span>
                ))}
              </div>
              {loading ? (
                <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
              ) : data.length === 0 ? (
                <EmptyState message="No organisation rankings yet. Rankings will populate once organisations enroll." />
              ) : (
                <div>
                  {(data as OrgEntry[]).map((entry, i) => (
                    <div key={entry.organization} className={`grid grid-cols-4 gap-4 px-6 py-4 border-b border-slate-100 last:border-0 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <div className="flex items-center gap-2">{i === 0 ? <Trophy className="w-5 h-5 text-amber-500" /> : <span className="text-sm font-bold text-slate-400 w-5 text-center">{i + 1}</span>}</div>
                      <div className="font-semibold text-sm text-slate-800">{entry.organization}</div>
                      <div className="text-xs text-slate-500">{entry.member_count}</div>
                      <div className="font-bold text-brand-700 text-sm">{entry.total_carbon_saved_kg.toFixed(1)} kg</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'city' && (
            <>
              <div className="grid grid-cols-4 gap-4 bg-slate-50 border-b border-slate-200 px-6 py-3">
                {['Rank', 'City', 'Participants', 'CO₂e Reduced'].map(h => (
                  <span key={h} className="text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</span>
                ))}
              </div>
              {loading ? (
                <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
              ) : data.length === 0 ? (
                <EmptyState message="No city rankings yet. Rankings will populate as participants register with their city." />
              ) : (
                <div>
                  {(data as CityEntry[]).map((entry, i) => (
                    <div key={entry.city} className={`grid grid-cols-4 gap-4 px-6 py-4 border-b border-slate-100 last:border-0 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <div className="flex items-center gap-2">{i === 0 ? <Trophy className="w-5 h-5 text-amber-500" /> : <span className="text-sm font-bold text-slate-400 w-5 text-center">{i + 1}</span>}</div>
                      <div className="font-semibold text-sm text-slate-800">{entry.city}</div>
                      <div className="text-xs text-slate-500">{entry.member_count}</div>
                      <div className="font-bold text-brand-700 text-sm">{entry.total_carbon_saved_kg.toFixed(1)} kg</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Rankings updated daily · CO₂e calculated using IPCC AR6, GHG Protocol, CPCB and CEA India Grid v21.0
        </p>

      </div>
    </div>
  );
};

export default Leaderboard;
