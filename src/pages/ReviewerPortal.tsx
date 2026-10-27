import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Clock, Eye, FileText, Search, ChevronDown, ChevronUp, Flag, Building2, Bell, RefreshCw, ShieldAlert, ShieldCheck, Bot, ScanLine } from 'lucide-react'
import { fetchPendingSubmissions, fetchAiLog, verifySubmission, rejectSubmission, flagSubmission, ApiError } from '../api'
import type { PendingSubmission, AiLogEntry, AiStatus } from '../api'
import { useAuth } from '../App'
import IndiaPageHeader from '../components/IndiaPageHeader'

type LocalStatus = 'Pending' | 'Verified' | 'Rejected' | 'Flagged'

interface LocalSub extends PendingSubmission {
  localStatus: LocalStatus
  rejectionReason?: string
  flagReason?: string
}

const STATUS_CFG: Record<LocalStatus, { label: string; color: string; icon: React.ElementType }> = {
  Pending: { label: 'Pending', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  Verified: { label: 'Verified', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
  Rejected: { label: 'Rejected', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
  Flagged: { label: 'Flagged', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: Flag },
}

// Automated pre-screen verdict shown alongside the human status
const AI_CFG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ai_verified: { label: 'AI Passed',   color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: ShieldCheck },
  ai_flagged:  { label: 'AI Flagged',  color: 'text-orange-700 bg-orange-50 border-orange-200',    icon: ShieldAlert },
  ai_rejected: { label: 'AI Rejected', color: 'text-red-700 bg-red-50 border-red-200',             icon: ShieldAlert },
}

const CHECK_META: Record<string, { step: string; label: string; icon: React.ElementType }> = {
  rule_based:         { step: '1', label: 'Rule-Based Check',   icon: ScanLine },
  evidence_check:     { step: '2', label: 'Evidence Check',     icon: FileText },
  authenticity_check: { step: '3', label: 'Image Authenticity', icon: ShieldAlert },
  ai_reasoning:       { step: '4', label: 'AI Reasoning',       icon: Bot },
  vision_check:       { step: '5', label: 'Vision Check',       icon: Eye },
}

const DECISION_COLOR: Record<string, string> = {
  verified: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  flagged:  'text-orange-700 bg-orange-50 border-orange-200',
  rejected: 'text-red-700 bg-red-50 border-red-200',
}

function parseFlags(raw: string | null): string[] {
  if (!raw) return []
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v.filter(Boolean) : [] } catch { return [] }
}

/** Automated verification audit trail for one submission. */
function AiAuditTrail({ submissionId, aiStatus, aiNotes }: { submissionId: string; aiStatus: AiStatus; aiNotes: string | null }) {
  const [log, setLog] = useState<AiLogEntry[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    setLoading(true); setErr('')
    fetchAiLog(submissionId)
      .then(setLog)
      .catch(e => setErr(e instanceof ApiError ? e.message : 'Could not load AI audit trail'))
      .finally(() => setLoading(false))
  }, [submissionId])

  const cfg = aiStatus ? AI_CFG[aiStatus] : null
  const AiIcon = cfg?.icon || Bot

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-2 bg-slate-50 border-b border-slate-200 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Bot className="w-3.5 h-3.5 text-slate-500" /> Automated Verification
        </span>
        {cfg && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
            <AiIcon className="w-3 h-3" />{cfg.label}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {aiNotes && <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2">{aiNotes}</p>}
        {loading && <p className="text-xs text-slate-400">Loading audit trail…</p>}
        {err && <p className="text-xs text-red-600">{err}</p>}
        {log && log.length === 0 && !loading && (
          <p className="text-xs text-slate-400">No automated checks recorded for this submission.</p>
        )}

        {log?.map((entry, i) => {
          const meta = CHECK_META[entry.check_type] || { step: '•', label: entry.check_type, icon: Bot }
          const StepIcon = meta.icon
          const flags = parseFlags(entry.red_flags)
          return (
            <div key={i} className="border border-slate-100 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <StepIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">{meta.step}.</span> {meta.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {entry.confidence != null && (
                    <span className="text-[10px] text-slate-400">{Math.round(entry.confidence * 100)}% conf</span>
                  )}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${DECISION_COLOR[entry.decision] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                    {entry.decision}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{entry.reasoning}</p>
              {flags.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {flags.map((f, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-[11px] text-orange-700">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" /><span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
              {entry.model_used && <p className="mt-1.5 text-[10px] text-slate-400">Model: {entry.model_used}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ReviewerPortal() {
  const { user } = useAuth()
  const reviewerId = user?.id || 'reviewer'

  const [subs, setSubs] = useState<LocalSub[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<LocalStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [actionModal, setActionModal] = useState<{ id: string; action: 'reject' | 'flag' } | null>(null)
  const [actionNote, setActionNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 4000) }

  const load = () => {
    setLoading(true); setError('')
    fetchPendingSubmissions()
      .then(data => setSubs(data.map(s => ({ ...s, localStatus: s.status as LocalStatus }))))
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load submissions'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleVerify = async (id: string) => {
    setActionLoading(true)
    try {
      await verifySubmission(id, reviewerId)
      setSubs(p => p.map(s => s.id === id ? { ...s, localStatus: 'Verified' } : s))
      notify('Submission verified. The leaderboard was updated automatically.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Verify failed.')
    } finally { setActionLoading(false) }
  }

  const handleRejectOrFlag = async () => {
    if (!actionModal) return
    if (!actionNote.trim()) { notify('Please provide a reason.'); return }
    setActionLoading(true)
    try {
      if (actionModal.action === 'reject') {
        await rejectSubmission(actionModal.id, reviewerId, actionNote)
        setSubs(p => p.map(s => s.id === actionModal.id ? { ...s, localStatus: 'Rejected', rejectionReason: actionNote } : s))
        notify('Submission rejected. The participant will be notified.')
      } else {
        await flagSubmission(actionModal.id, reviewerId)
        setSubs(p => p.map(s => s.id === actionModal.id ? { ...s, localStatus: 'Flagged', flagReason: actionNote } : s))
        notify('Submission flagged for senior review.')
      }
      setActionModal(null); setActionNote('')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Action failed.')
    } finally { setActionLoading(false) }
  }

  const filtered = subs.filter(s => {
    const matchFilter = filter === 'all' || s.localStatus === filter
    const matchSearch = !search || s.full_name.toLowerCase().includes(search.toLowerCase())
      || s.pledge_name.toLowerCase().includes(search.toLowerCase())
      || s.organization.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const stats = {
    total: subs.length,
    pending: subs.filter(s => s.localStatus === 'Pending').length,
    verified: subs.filter(s => s.localStatus === 'Verified').length,
    rejected: subs.filter(s => s.localStatus === 'Rejected').length,
    flagged: subs.filter(s => s.localStatus === 'Flagged').length,
    totalCO2: subs.filter(s => s.localStatus === 'Verified').reduce((a, s) => a + s.carbon_saved_kg, 0),
  }

  return (
    <div className="app-page-surface app-page-reviewer min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        <IndiaPageHeader eyebrow="India verification" title="Evidence Review Desk" description="Review participant evidence alongside automated checks, confidence signals and a complete decision trail." imageSrc="/images/reviewer-office.jpg" imageAlt="Sustainability reviewers examining climate-action evidence" chips={['Five-step automated screening', 'Human decision remains final', 'Review reasons recorded']} action={<div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 whitespace-nowrap">
              <Bell className="w-4 h-4 text-amber-500" />
              <span className="font-semibold">{stats.pending}</span> pending
            </div>
            <button onClick={load} className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium px-3 py-2 border border-slate-200 rounded-xl bg-white whitespace-nowrap">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>} />

        {notification && (
          <div className="mb-6 flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-xl px-5 py-3 text-brand-800 text-sm font-medium">
            {notification}
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4" />{error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-slate-700' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
            { label: 'Verified', value: stats.verified, color: 'text-green-600' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-600' },
            { label: 'CO₂e Verified', value: stats.totalCO2.toFixed(1) + ' kg', color: 'text-brand-600' },
          ].map(s => (
            <div key={s.label} className="stat-card p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{loading ? '…' : s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name, pledge, org…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'Pending', 'Verified', 'Rejected', 'Flagged'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${filter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-300 hover:border-brand-300'}`}>
                {f === 'all' ? 'All' : f}
                {f !== 'all' && <span className="ml-1.5 opacity-70">{subs.filter(s => s.localStatus === f).length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions */}
        {loading ? (
          <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">No submissions match your filter.</div>
            )}
            {filtered.map(sub => {
              const sc = STATUS_CFG[sub.localStatus]
              const StatusIcon = sc.icon
              return (
                <div key={sub.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                    className="w-full text-left px-4 sm:px-5 py-4 flex items-center gap-2 sm:gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">{sub.full_name}</span>
                        <span className="hidden sm:inline text-xs text-slate-400">·</span>
                        <span className="hidden sm:flex text-xs text-slate-500 items-center gap-1"><Building2 className="w-3 h-3" />{sub.organization || 'Not provided'}</span>
                        <span className="hidden sm:inline text-xs text-slate-400">·</span>
                        <span className="hidden sm:inline text-xs text-slate-500">{sub.location_city || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm font-medium text-slate-700">{sub.pledge_name}</span>
                        <span className="hidden sm:inline text-xs text-slate-400">·</span>
                        <span className="hidden sm:inline text-xs text-slate-500">{new Date(sub.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="hidden sm:inline text-xs text-slate-400">·</span>
                        <span className="text-xs font-medium text-brand-700 whitespace-nowrap">{sub.carbon_saved_kg.toFixed(1)} kg CO₂e</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sub.ai_status && AI_CFG[sub.ai_status] && (
                        <span className={`hidden sm:flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${AI_CFG[sub.ai_status].color}`}>
                          {React.createElement(AI_CFG[sub.ai_status].icon, { className: 'w-3.5 h-3.5' })}
                          {AI_CFG[sub.ai_status].label}
                        </span>
                      )}
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${sc.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{sc.label}</span>
                      </span>
                      {expanded === sub.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {expanded === sub.id && (
                    <div className="border-t border-slate-100 px-4 sm:px-5 pb-5 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-slate-500">ID</span><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{sub.id.slice(0, 8)}…</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="text-slate-700 text-xs">{sub.email}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">CO₂e Claimed</span><span className="font-bold text-brand-700">{sub.carbon_saved_kg.toFixed(2)} kg</span></div>
                          {sub.blob_url && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Evidence</span>
                              <a href={sub.blob_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline text-xs flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" /> View File
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
                          <p className="text-xs font-semibold text-slate-600 mb-1.5">Reported values</p>
                          {(() => {
                            let parsed: Record<string, unknown> = {}
                            try { parsed = JSON.parse(sub.inputs || '{}') } catch { /* keep empty */ }
                            const rows = Object.entries(parsed)
                            return rows.length ? (
                              <dl className="space-y-0.5">
                                {rows.map(([k, v]) => (
                                  <div key={k} className="flex justify-between gap-3 text-xs">
                                    <dt className="text-slate-500">{k.replace(/_/g, ' ')}</dt>
                                    <dd className="text-slate-700 font-medium text-right break-all">{String(v)}</dd>
                                  </div>
                                ))}
                              </dl>
                            ) : <p className="text-xs text-slate-400">No input data recorded.</p>
                          })()}
                          {sub.rejectionReason && <div className="mt-2 pt-2 border-t border-slate-200"><span className="text-xs font-semibold text-red-700">Rejection: </span><span className="text-xs text-red-600">{sub.rejectionReason}</span></div>}
                          {sub.flagReason && <div className="mt-2 pt-2 border-t border-slate-200"><span className="text-xs font-semibold text-orange-700">Flag: </span><span className="text-xs text-orange-600">{sub.flagReason}</span></div>}
                        </div>
                      </div>

                      {/* Automated verification audit trail */}
                      <div className="mb-4">
                        <AiAuditTrail submissionId={sub.id} aiStatus={sub.ai_status} aiNotes={sub.ai_notes} />
                      </div>

                      {(sub.localStatus === 'Pending' || sub.localStatus === 'Flagged') && (
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => handleVerify(sub.id)} disabled={actionLoading}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                            <CheckCircle className="w-4 h-4" /> Verify
                          </button>
                          <button onClick={() => { setActionModal({ id: sub.id, action: 'reject' }); setActionNote('') }}
                            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                          {sub.localStatus !== 'Flagged' && (
                            <button onClick={() => { setActionModal({ id: sub.id, action: 'flag' }); setActionNote('') }}
                              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                              <Flag className="w-4 h-4" /> Flag
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1 capitalize">{actionModal.action} Submission</h3>
            <p className="text-sm text-slate-500 mb-4">
              {actionModal.action === 'reject' ? 'Provide a reason. The participant will be notified by email.' : 'Flag this submission for closer investigation.'}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {actionModal.action === 'reject' ? 'Rejection reason *' : 'Flag reason *'}
              </label>
              <textarea value={actionNote} onChange={e => setActionNote(e.target.value)} rows={3}
                placeholder={actionModal.action === 'reject' ? 'e.g. Evidence does not match the reporting month…' : 'e.g. CO₂e claim is unusually high and needs manual verification…'}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setActionModal(null); setActionNote('') }}
                className="flex-1 border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 text-sm">
                Cancel
              </button>
              <button onClick={handleRejectOrFlag} disabled={actionLoading}
                className={`flex-1 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 ${actionModal.action === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                {actionLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" /> : ('Confirm ' + (actionModal.action === 'reject' ? 'Rejection' : 'Flag'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
