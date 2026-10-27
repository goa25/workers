import { X, ShieldCheck, Calculator, Target, AlertTriangle } from 'lucide-react';
import { PLEDGES, METHODOLOGY_NOTE } from '../data/pledges';

interface Props {
  pledgeId: string | null;
  onClose: () => void;
}

export default function PledgeLearnMoreModal({ pledgeId, onClose }: Props) {
  if (!pledgeId) return null;
  const data = PLEDGES.find((p) => p.id === pledgeId);
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>

        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{data.category}</p>
        <h2 className="mb-1 pr-8 text-xl font-bold text-slate-800">{data.title}</h2>
        {data.officialTitle !== data.title && (
          <p className="mb-4 text-sm italic leading-relaxed text-slate-500">"{data.officialTitle}"</p>
        )}

        <div className="mb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Background</p>
          <p className="text-sm leading-relaxed text-slate-700">{data.longDescription}</p>
        </div>

        {data.note && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <AlertTriangle size={12} /> What this pledge covers
            </p>
            <p className="text-sm leading-relaxed text-slate-700">{data.note}</p>
          </div>
        )}

        <div className="mb-4 rounded-xl bg-emerald-50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            <Target size={12} /> Why it matters
          </p>
          <p className="text-sm text-slate-700">{data.impact}</p>
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Calculator size={12} /> How your impact is measured
          </p>
          <p className="text-sm leading-relaxed text-slate-600">{METHODOLOGY_NOTE}</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <ShieldCheck size={12} /> Required evidence
          </p>
          <p className="text-sm leading-relaxed text-slate-700">{data.evidence}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span><strong className="text-slate-700">Difficulty:</strong> {data.difficulty}</span>
          <span><strong className="text-slate-700">Commitment:</strong> {data.timeCommitment}</span>
          <span><strong className="text-slate-700">SDGs:</strong> {data.sdgGoals.join(', ')}</span>
        </div>
      </div>
    </div>
  );
}
