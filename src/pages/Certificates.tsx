import React, { useState, useEffect } from 'react';
import { Award, Download, Star, Calendar, CheckCircle, BarChart3 } from 'lucide-react';
import { fetchCertificates, ApiError } from '../api';
import type { ApiCertificate, CertificateType } from '../api';
import IndiaPageHeader from '../components/IndiaPageHeader';
import { useApp } from '../context/AppContext';

const typeConfig: Record<CertificateType, { label: string; color: string; border: string }> = {
  Participation: { label: 'Participation', color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
  Annual: { label: 'Annual Award', color: 'bg-amber-50 text-amber-700', border: 'border-amber-200' },
  TopPerformer: { label: 'Top Performer', color: 'bg-violet-50 text-violet-700', border: 'border-violet-200' },
};

const CertCard: React.FC<{ cert: ApiCertificate }> = ({ cert }) => {
  const cfg = typeConfig[cert.type] || typeConfig.Participation;
  return (
    <div className={`card border-2 ${cfg.border} hover:shadow-card-hover transition-shadow`}>
      <div className="bg-gradient-to-br from-brand-700 to-brand-800 px-6 py-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <Award className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-display font-bold leading-tight">{cfg.label} Certificate</h3>
          <p className="text-brand-200 text-sm mt-1">TerraLedger Carbon Platform · 2026</p>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className={`badge ${cfg.color} border`}>{cfg.label}</span>
          <span className="status-verified"><CheckCircle className="w-3 h-3" /> Verified</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-slate-500">Issue Date</p>
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {new Date(cert.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        {cert.blob_url ? (
          <a href={cert.blob_url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Certificate
          </a>
        ) : (
          <button disabled className="btn-primary w-full justify-center opacity-50 cursor-not-allowed flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Certificate
          </button>
        )}
      </div>
    </div>
  );
};

const Certificates: React.FC = () => {
  const { state } = useApp();
  const userId = state.user?.id || '';
  const [certs, setCerts] = useState<ApiCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'all' | CertificateType>('all');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchCertificates(userId)
      .then(d => setCerts(d))
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load certificates'))
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = filterType === 'all' ? certs : certs.filter(c => c.type === filterType);

  return (
    <div className="app-page-surface app-page-general min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <IndiaPageHeader
          title="Certificates and Recognition"
          description="Keep a verified record of the climate action you contribute through your home, campus, workplace and community across India."
          imageSrc="/images/certificates-recognition.jpg"
          imageAlt="Community members reviewing a climate-action certificate"
          chips={['Verified', 'India campaign recognition', 'Downloadable certificates']}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Certificates', value: String(certs.length), icon: <Award className="w-4 h-4 text-brand-600" />, bg: 'bg-brand-50' },
            { label: 'Participation', value: String(certs.filter(c => c.type === 'Participation').length), icon: <Calendar className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'Annual Awards', value: String(certs.filter(c => c.type === 'Annual').length), icon: <Star className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50' },
            { label: 'Top Performer', value: String(certs.filter(c => c.type === 'TopPerformer').length), icon: <BarChart3 className="w-4 h-4 text-violet-600" />, bg: 'bg-violet-50' },
          ].map(s => (
            <div key={s.label} className="stat-card flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg}`}>{s.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-900 font-display">{loading ? '…' : s.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'Participation', 'Annual', 'TopPerformer'] as const).map(f => (
            <button key={f} onClick={() => setFilterType(f)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${filterType === f ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-700'}`}>
              {f === 'all' ? 'All' : f === 'TopPerformer' ? 'Top Performer' : f}
            </button>
          ))}
        </div>
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
          <Award className="mt-0.5 h-4 w-4 flex-shrink-0" /><div><p className="text-sm font-semibold">Certificates follow verified impact</p><p className="mt-0.5 text-xs opacity-75">Certificate templates and delivery will appear here after the review team approves the final recognition format. Your verified activity remains recorded in the meantime.</p></div>
        </div>
        {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Award className="w-12 h-12 text-slate-200" />
            <p className="font-semibold text-sm">No certificates yet</p>
            <p className="text-xs text-center">Complete pledges and get verified to earn your first certificate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(cert => <CertCard key={cert.id} cert={cert} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
