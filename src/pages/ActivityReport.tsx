import React, { useState, useEffect } from 'react'
import OtpModal from '../components/OtpModal'
import {
  Upload, CheckCircle, AlertTriangle, ChevronDown, ChevronUp,
  FileText, Calculator, Info, X, Bus, Car, Bike, Thermometer,
  Lightbulb, Fan, Refrigerator, Sun, Salad, Package, Zap, ShieldCheck
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getEvidenceUploadUrl, uploadFileToBlob, createSubmission, fetchUserSubmissions, ApiError } from '../api'
import type { AllowedFileType, UserSubmission } from '../api'
import { PLEDGES, PLEDGE_ID_MAP, getPledge, visibleFields, toApiInputs, calculateCO2, METHODOLOGY_NOTE } from '../data/pledges'
import IndiaPageHeader from '../components/IndiaPageHeader'

const ICONS: Record<string, React.ElementType> = {
  Bus, Car, Bike, Thermometer, Lightbulb, Fan, Refrigerator, Sun, Salad, Package, Zap,
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  Pending: { label: 'Pending Review', cls: 'status-pending' },
  Verified: { label: 'Verified', cls: 'status-verified' },
  Rejected: { label: 'Rejected', cls: 'status-rejected' },
  Flagged: { label: 'Flagged', cls: 'status-flagged' },
}

const MONTHS = ['January 2026','February 2026','March 2026','April 2026','May 2026','June 2026','July 2026']

function monthToYYYYMM(m: string): string {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const [mon, yr] = m.split(' ')
  return `${yr}-${String(months.indexOf(mon) + 1).padStart(2, '0')}`
}

export default function ActivityReport() {
  const { state } = useApp()
  const userId = state.user?.id || ''

  const [submissions, setSubmissions] = useState<UserSubmission[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [activePledgeId, setActivePledgeId] = useState<string | null>(null)
  const [fields, setFields] = useState<Record<string, string | number>>({})
  const [month, setMonth] = useState('July 2026')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)
  const [otpOk, setOtpOk] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const cfg = activePledgeId ? getPledge(activePledgeId) : undefined
  const shownFields = cfg ? visibleFields(cfg, fields) : []
  const liveCarbon = activePledgeId ? calculateCO2(activePledgeId, fields) : 0
  const totalVerified = submissions.filter(s => s.status === 'Verified').reduce((a, s) => a + s.carbon_saved_kg, 0)
  const totalCO2 = submissions.reduce((a, s) => a + s.carbon_saved_kg, 0)

  useEffect(() => {
    if (!userId) return
    setLoadingHistory(true)
    fetchUserSubmissions(userId)
      .then(setSubmissions)
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [userId, submitted])

  // Seed select defaults when a pledge is picked
  const selectPledge = (id: string) => {
    if (id === activePledgeId) { setActivePledgeId(null); return }
    const p = getPledge(id)
    const defaults: Record<string, string | number> = {}
    p?.fields.forEach(f => { if (f.default !== undefined) defaults[f.key] = f.default })
    setActivePledgeId(id); setFields(defaults); setFile(null); setFileError(''); setSubmitError('')
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)) { setFileError('Only JPG, PNG, or PDF accepted.'); return }
    if (f.size > 10 * 1024 * 1024) { setFileError('File must be under 10 MB.'); return }
    setFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cfg || !userId) return
    if (!file) { setFileError('Please upload evidence.'); return }
    setSubmitting(true); setSubmitError('')
    try {
      const { uploadUrl, blobUrl } = await getEvidenceUploadUrl({
        userId, fileType: file.type as AllowedFileType, fileName: file.name,
      })
      await uploadFileToBlob(uploadUrl, file)
      await createSubmission({
        userId,
        pledgeId: PLEDGE_ID_MAP[cfg.id],
        month: monthToYYYYMM(month),
        inputs: toApiInputs(cfg.id, fields),
        blobUrl,
        fileType: file.type as AllowedFileType,
      })
      setSubmitted(true); setFields({}); setFile(null); setActivePledgeId(null)
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-page-surface app-page-activity min-h-screen">
      {otpOpen && <OtpModal onClose={() => setOtpOpen(false)} onVerified={() => { setOtpOk(true); setOtpOpen(false); setTimeout(() => (document.querySelector('form button[type=submit]') as HTMLButtonElement | null)?.click(), 50) }} />}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        <IndiaPageHeader title="Track Your Monthly Activity" description={`Submit evidence for one of the 11 core pledges. ${METHODOLOGY_NOTE}`} imageSrc="/images/activity-evidence.jpg" imageAlt="Residents documenting household energy savings" chips={['11 approved pledges', 'Evidence-led review', 'India-specific factors']} />

        {submitted && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-emerald-700 font-medium text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            Submitted! TerraLedger reviewers will verify your evidence within 3–5 business days.
          </div>
        )}
        {submitError && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 font-medium text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />{submitError}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Reported', value: totalCO2.toFixed(1) + ' kg', sub: 'CO₂e across all pledges' },
            { label: 'Verified Savings', value: totalVerified.toFixed(1) + ' kg', sub: 'CO₂e confirmed by reviewers' },
            { label: 'Submissions', value: String(submissions.length), sub: submissions.filter(s => s.status === 'Pending').length + ' pending review' },
            { label: 'Active Pledges', value: String(new Set(submissions.map(s => s.pledge_id)).size), sub: 'of 11 core pledges' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="text-xl font-bold text-brand-600 font-display">{s.value}</div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">{s.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <div className="card p-6">
              <h2 className="font-display font-semibold text-slate-900 mb-1">Select Pledge to Report</h2>
              <p className="text-xs text-slate-400 mb-4">All 11 core pledges. Each has its own inputs and evidence requirement.</p>
              <div className="mb-4">
                <label className="label">Reporting Month</label>
                <select value={month} onChange={e => setMonth(e.target.value)} className="input">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLEDGES.map(p => {
                  const Icon = ICONS[p.icon] || Zap
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => selectPledge(p.id)}
                      className={`relative min-h-[82px] border-l-4 p-3 text-left transition-all ${p.bgColor} ${activePledgeId === p.id ? 'border-brand-700 ring-2 ring-brand-500 ring-offset-1' : 'border-slate-300 hover:border-brand-500 hover:shadow-sm'}`}
                    >
                      <div className="mb-1.5"><Icon className={`w-5 h-5 ${p.color}`} /></div>
                      <div className="text-xs font-semibold text-slate-800 leading-tight">{p.title}</div>
                      {activePledgeId === p.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {cfg ? (
              <div className={`card border-2 p-6 ${cfg.bgColor} border-slate-200`}>
                <div className="flex items-start justify-between mb-1 gap-3">
                  <div className="flex items-start gap-2">
                    {React.createElement(ICONS[cfg.icon] || Zap, { className: 'w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0' })}
                    <div>
                      <h3 className="font-display font-semibold text-slate-900 leading-tight">{cfg.title}</h3>
                      {cfg.officialTitle !== cfg.title && (
                        <p className="text-xs text-slate-500 mt-0.5 italic">"{cfg.officialTitle}"</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setActivePledgeId(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 flex-shrink-0"><X className="w-4 h-4" /></button>
                </div>

                {/* Scope caveat, where the pledge has one */}
                {cfg.note && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">What this pledge covers</p>
                      <p className="text-xs text-amber-700 leading-relaxed">{cfg.note}</p>
                    </div>
                  </div>
                )}

                {/* Required evidence — per campaign spec */}
                <div className="mt-3 mb-4 flex items-start gap-2 bg-white/70 border border-slate-200 rounded-lg px-3 py-2.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Required evidence</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{cfg.evidence}</p>
                  </div>
                </div>

                <div className="mb-4 flex items-start gap-2 text-xs text-slate-500">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                  <p className="leading-relaxed">{METHODOLOGY_NOTE}</p>
                </div>

                <form onSubmit={(e) => { if (otpOk) return handleSubmit(e); e.preventDefault(); setOtpOpen(true) }} className="space-y-4">
                  {shownFields.map(field => (
                    <div key={field.key}>
                      <label className="label">
                        {field.label}
                        {field.unit && <span className="ml-1 text-slate-400 font-normal">({field.unit})</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={String(fields[field.key] ?? field.default ?? '')}
                          onChange={e => setFields(p => ({ ...p, [field.key]: e.target.value }))}
                          className="input" required
                        >
                          <option value="">Select…</option>
                          {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={fields[field.key] ?? ''}
                          onChange={e => setFields(p => ({ ...p, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                          placeholder={field.placeholder}
                          min={field.min}
                          step={field.type === 'number' ? 'any' : undefined}
                          required
                          className="input"
                        />
                      )}
                    </div>
                  ))}

                  {liveCarbon > 0 && (
                    <div className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
                      <Calculator className="w-5 h-5 text-brand-600 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-brand-800">Live estimate: {liveCarbon.toFixed(2)} kg CO₂e saved</div>
                        <div className="text-xs text-brand-600">Final value is recalculated and verified server-side</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="label">Evidence <span className="text-slate-400 font-normal">(JPG, PNG or PDF, max 10 MB)</span></label>
                    <label className="flex flex-col items-center gap-2 border-2 border-dashed border-slate-300 rounded-xl p-5 cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors bg-white/50">
                      <Upload className="w-6 h-6 text-slate-400" />
                      {file
                        ? <span className="text-sm font-medium text-brand-700 text-center break-all">{file.name} ({(file.size / 1048576).toFixed(2)} MB)</span>
                        : <span className="text-sm text-slate-500">Click to upload or drag and drop</span>}
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} className="hidden" />
                    </label>
                    {fileError && <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600"><AlertTriangle className="w-4 h-4" />{fileError}</p>}
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                    {submitting
                      ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <><CheckCircle className="w-4 h-4" />Submit Report for {month}</>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card-flat p-8 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                <p className="font-medium text-sm">Select any pledge above to file your monthly report</p>
                <p className="text-xs mt-1">All 11 core pledges have specific inputs and evidence rules</p>
              </div>
            )}
          </div>

          {/* Submission history */}
          <div className="space-y-3 order-1 lg:order-2">
            <h2 className="font-display font-semibold text-slate-900">Submission History</h2>
            {loadingHistory && (
              <div className="card-flat p-6 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading submissions…</p>
              </div>
            )}
            {!loadingHistory && submissions.length === 0 && (
              <div className="card-flat p-6 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                <p className="text-xs">No submissions yet</p>
              </div>
            )}
            {submissions.map(sub => {
              const sc = STATUS_CFG[sub.status] || STATUS_CFG['Pending']
              return (
                <div key={sub.id} className="card-flat overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                    className="w-full text-left px-4 py-3 flex items-start justify-between gap-2 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 leading-tight">{sub.pledge_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{sub.month}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={sc.cls}>{sc.label}</span>
                      {expanded === sub.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expanded === sub.id && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">CO₂e Saved</span>
                        <span className="font-bold text-brand-700">{sub.carbon_saved_kg.toFixed(2)} kg</span>
                      </div>
                      {sub.rejection_reason && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Reason</span>
                          <span className="font-medium text-red-600 text-xs text-right max-w-[60%]">{sub.rejection_reason}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Submitted</span>
                        <span className="text-slate-700 text-xs">{new Date(sub.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {sub.blob_url && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Evidence</span>
                          <a href={sub.blob_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline text-xs flex items-center gap-1"><FileText className="w-3.5 h-3.5" />View</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
