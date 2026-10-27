import React, { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { FileText, TrendingUp, Award, CheckCircle, Clock, ArrowRight, Target } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useApp } from '../context/AppContext'
import { fetchUserSubmissions } from '../api'
import type { UserSubmission } from '../api'
import IndiaPageHeader from '../components/IndiaPageHeader'

const MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const { state } = useApp()
  const userId = state.user?.id || ''
  const [submissions, setSubmissions] = useState<UserSubmission[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchUserSubmissions(userId).then(setSubmissions).catch(() => {}).finally(() => setLoading(false))
  }, [userId])

  const verifiedCO2 = submissions.filter(s => s.status === 'Verified').reduce((a, s) => a + s.carbon_saved_kg, 0)
  const pendingCO2 = submissions.filter(s => s.status === 'Pending').reduce((a, s) => a + s.carbon_saved_kg, 0)
  const totalCO2 = verifiedCO2 + pendingCO2
  const activePledges = new Set(submissions.map(s => s.pledge_id)).size

  // Build monthly chart data from submissions
  const monthlyMap: Record<string, number> = {}
  submissions.filter(s => s.status === 'Verified').forEach(s => {
    const d = new Date(s.submitted_at)
    const key = MONTH_ORDER[d.getMonth()]
    monthlyMap[key] = (monthlyMap[key] || 0) + s.carbon_saved_kg
  })
  const CHART_DATA = MONTH_ORDER.slice(0, 7).map(m => ({ month: m, co2: Math.round((monthlyMap[m] || 0) * 10) / 10 }))
  const maxMonth = CHART_DATA.reduce((a, d) => d.co2 > a.co2 ? d : a, CHART_DATA[0])
  const hasActivity = totalCO2 > 0

  // Recent activity feed
  const recent = [...submissions].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()).slice(0, 5)

  return (
    <div className="app-page-surface app-page-general min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <IndiaPageHeader
          title="Your Climate Dashboard"
          description="See how everyday choices at home, on your commute and in your neighbourhood add up across India."
          imageSrc="/images/dashboard-commute.jpg"
          imageAlt="Commuters using a modern Indian metro"
          chips={['CEA India Grid factors', 'Verified by reviewers', 'kg CO₂e tracking']}
          action={<NavLink to="/activity" className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 shadow-sm hover:bg-emerald-50">Submit monthly report</NavLink>}
        />

        {/* KPI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total CO₂e Saved', value: hasActivity ? totalCO2.toFixed(1) + ' kg' : '-', sub: hasActivity ? 'Verified + pending' : 'File your first report', icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
            { label: 'Verified CO₂e', value: verifiedCO2 > 0 ? verifiedCO2.toFixed(1) + ' kg' : '-', sub: 'Confirmed by reviewers', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Best Month', value: maxMonth.co2 > 0 ? maxMonth.co2 + ' kg' : '-', sub: maxMonth.co2 > 0 ? maxMonth.month + ' 2026' : 'No activity yet', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Active Pledges', value: activePledges > 0 ? String(activePledges) : '-', sub: 'of 11 core pledges', icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="stat-card relative overflow-hidden group">
                <div className={`absolute inset-x-0 top-0 h-1 ${stat.bg}`} />
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  {loading && <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />}
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color} font-display`}>{stat.value}</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">{stat.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.sub}</div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-semibold text-slate-900">Monthly CO₂e Savings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Verified submissions only</p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md font-medium border border-slate-100">kg CO₂e</span>
            </div>
            {hasActivity ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip formatter={(val: number) => [val.toFixed(1) + ' kg CO₂e', 'Verified Savings']} contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="co2" fill="#1d7358" name="CO₂e Saved" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 gap-3">
                <FileText className="w-10 h-10 text-slate-200" />
                <p className="text-sm font-medium">No verified activity yet</p>
                <NavLink to="/activity" className="text-xs text-brand-600 hover:text-brand-800 font-semibold">File your first report</NavLink>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-400 text-right">Sources: GHG Protocol India · IPCC AR6 · CPCB · CEA India Grid v21.0</p>
          </div>

          <div className="card p-5 sm:p-6">
            <h2 className="font-display font-semibold text-slate-900 mb-4">Recent Activity</h2>
            {recent.length === 0 ? (
              <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 gap-3">
                <Clock className="w-10 h-10 text-slate-200" />
                <p className="text-sm text-center">Activity updates appear here after you submit reports.</p>
                <NavLink to="/activity" className="text-xs text-brand-600 hover:text-brand-800 font-semibold">Submit your first report</NavLink>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map(s => (
                  <div key={s.id} className="flex items-start gap-3 text-xs">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'Verified' ? 'bg-emerald-500' : s.status === 'Rejected' ? 'bg-red-400' : 'bg-amber-400'}`} />
                    <div>
                      <p className="font-semibold text-slate-800">{s.pledge_name}</p>
                      <p className="text-slate-400">{s.month} · {s.carbon_saved_kg.toFixed(1)} kg · <span className="capitalize">{s.status}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-emerald-600" /><span className="font-semibold text-emerald-800 text-sm">Verified CO₂e</span></div>
            <div className="text-3xl font-bold text-emerald-700 font-display">{verifiedCO2 > 0 ? verifiedCO2.toFixed(1) : '-'} <span className="text-lg">{verifiedCO2 > 0 ? 'kg' : ''}</span></div>
            <p className="text-xs text-emerald-600 mt-1">Confirmed by reviewers · counts toward leaderboard</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-amber-600" /><span className="font-semibold text-amber-800 text-sm">Pending Review</span></div>
            <div className="text-3xl font-bold text-amber-700 font-display">{pendingCO2 > 0 ? pendingCO2.toFixed(1) : '-'} <span className="text-lg">{pendingCO2 > 0 ? 'kg' : ''}</span></div>
            <p className="text-xs text-amber-600 mt-1">Awaiting reviewer verification · typically 3 to 5 business days</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-slate-900 text-lg">Active Pledges</h2>
            <NavLink to="/pledges" className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 font-medium">Manage pledges <ArrowRight className="w-4 h-4" /></NavLink>
          </div>
          {activePledges === 0 ? (
            <div className="card-flat p-8 flex flex-col items-center justify-center gap-3 text-slate-400">
              <FileText className="w-10 h-10 text-slate-200" />
              <p className="text-sm font-medium">No active pledges yet</p>
              <NavLink to="/pledges" className="text-xs text-brand-600 hover:text-brand-800 font-semibold">Browse and enroll in pledges</NavLink>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from(new Set(submissions.map(s => s.pledge_name))).map(name => (
                <div key={name} className="bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />{name}
                </div>
              ))}
            </div>
          )}
          <NavLink to="/activity" className="mt-4 flex items-center justify-center gap-2 border-2 border-dashed border-brand-200 rounded-xl p-4 text-brand-600 hover:bg-brand-50 transition-colors text-sm font-semibold">
            File this month's activity report
          </NavLink>
        </div>
      </div>
    </div>
  )
}
