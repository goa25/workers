import React, { useState } from 'react';
import {
  Users, TrendingUp, CheckCircle, Clock, XCircle, Flag,
  MapPin, Building2, GraduationCap, BarChart3, Globe, Info, TrendingDown
} from 'lucide-react';
import IndiaPageHeader from '../components/IndiaPageHeader';

const pledgeCategoryColors: Record<string, string> = {
  'Public Transport': '#1d7358', 'Plant-Based Meals': '#22c55e', 'LED Replacement': '#0078d4',
  'Tree Plantation': '#16a34a', 'Carpooling': '#0ea5e9', 'Waste Reduction': '#8b5cf6',
  'Line Drying': '#f59e0b', 'Thermostat Opt.': '#ef4444', 'Reusable Products': '#ec4899',
  'Plastic Reduction': '#14b8a6', 'Email Clean-up': '#6366f1', 'Waste Segregation': '#84cc16',
};
const pledgeCategories = Object.keys(pledgeCategoryColors);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="h-44 flex flex-col items-center justify-center text-slate-400 gap-2">
    <Info className="w-8 h-8 text-slate-200" />
    <p className="text-sm text-center max-w-sm leading-relaxed">{message}</p>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; bg: string }> = ({ icon, label, bg }) => (
  <div className="stat-card">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${bg}`}>{icon}</div>
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-slate-400 italic">Connect backend to populate</p>
  </div>
);

const CampaignDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'geographic' | 'organizations' | 'carbon'>('overview');
  const tabs = [
    { id: 'overview' as const,       label: 'Campaign Overview',  icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'geographic' as const,     label: 'Geographic',         icon: <Globe className="w-4 h-4" /> },
    { id: 'organizations' as const,  label: 'Organisations',      icon: <Building2 className="w-4 h-4" /> },
    { id: 'carbon' as const,         label: 'Carbon Impact',      icon: <TrendingDown className="w-4 h-4" /> },
  ];

  return (
    <div className="app-page-surface app-page-general min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        <IndiaPageHeader
          eyebrow="National campaign view"
          title="i-Pledge India Analytics"
          description="Track verified participation across States and Union Territories, organisations, schools, universities and local communities."
          imageSrc="/images/analytics-team.jpg"
          imageAlt="A diverse team reviewing climate campaign analytics"
          chips={['State & UT reporting', 'Organisation participation', 'CEA Grid v21.0']}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users className="w-5 h-5 text-blue-600" />}    label="Total Registered"  bg="bg-blue-50" />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-brand-600" />} label="Active Participants" bg="bg-brand-50" />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} label="Verified Reports"   bg="bg-emerald-50" />
          <StatCard icon={<BarChart3 className="w-5 h-5 text-violet-600" />} label="Total CO\u2082e Saved" bg="bg-violet-50" />
        </div>

        {/* Verification status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Verified',           icon: <CheckCircle className="w-4 h-4" />, cls: 'status-verified' },
            { label: 'Pending Review',     icon: <Clock className="w-4 h-4" />,       cls: 'status-pending' },
            { label: 'Rejected',           icon: <XCircle className="w-4 h-4" />,     cls: 'status-rejected' },
            { label: 'Flagged/Escalated',  icon: <Flag className="w-4 h-4" />,        cls: 'status-flagged' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
              <span className={s.cls}>{s.icon}</span>
              <div>
                <p className="text-xs font-semibold text-slate-700">{s.label}</p>
                <p className="text-xs text-slate-400 italic">Live data</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="tab-group w-fit mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`tab-item ${activeTab === t.id ? 'tab-item-active' : ''}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-900 mb-2">Monthly Submission Trend</h3>
              <p className="text-xs text-slate-400 mb-4">Populated from live submission data once connected to backend.</p>
              <EmptyState message="No submission data yet. Charts will populate as participants file reports." />
            </div>
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-900 mb-2">Participant Growth</h3>
              <p className="text-xs text-slate-400 mb-4">Tracks cumulative registered participants over time.</p>
              <EmptyState message="No registration data yet." />
            </div>
          </div>
        )}

        {activeTab === 'geographic' && (
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-display font-semibold text-slate-900">State-wise Participation</h3>
              <p className="text-sm text-slate-500 mt-0.5">Geographic breakdown from participant registration data.</p>
            </div>
            <div className="p-8">
              <EmptyState message="Geographic data will appear here once participants register with their state and city information." />
            </div>
          </div>
        )}

        {activeTab === 'organizations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card p-6">
                <h3 className="font-display font-semibold text-slate-900 mb-4">Organisation Type Breakdown</h3>
                <EmptyState message="Organisation breakdown will populate as participants register with their organisation details." />
              </div>
              <div className="lg:col-span-2 card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-display font-semibold text-slate-900">Corporate Partners</h3>
                </div>
                <div className="p-6">
                  <EmptyState message="Corporate participation data will appear here once organisations enroll their employees." />
                </div>
              </div>
            </div>
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-display font-semibold text-slate-900">Schools and Universities</h3>
              </div>
              <div className="p-6">
                <EmptyState message="School and university participation data will appear here once institutions enroll." />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'carbon' && (
          <div className="card p-6">
            <h3 className="font-display font-semibold text-slate-900 mb-1">CO\u2082e Reduction by Pledge Category</h3>
            <p className="text-xs text-slate-500 mb-6">Sources: IPCC AR6 &middot; CPCB &middot; GHG Protocol &middot; CEA India Grid v21.0</p>
            <div className="space-y-3 mb-6">
              {pledgeCategories.map(name => (
                <div key={name} className="flex items-center gap-4">
                  <span className="text-sm text-slate-700 w-44 flex-shrink-0">{name}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full">
                    <div className="h-2.5 rounded-full w-0" style={{ backgroundColor: pledgeCategoryColors[name] }} />
                  </div>
                  <span className="text-xs text-slate-400 w-20 text-right italic">No data yet</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 text-center">Carbon totals will populate here as participants submit and reviewers verify activity reports.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CampaignDashboard;
