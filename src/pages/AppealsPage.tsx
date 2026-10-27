import { useState } from 'react';
import { AlertCircle, CheckCircle, FileSearch, MessageSquareText, ShieldCheck } from 'lucide-react';
import IndiaPageHeader from '../components/IndiaPageHeader';

export default function AppealsPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="app-page-surface app-page-general min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <IndiaPageHeader title="Request a Review" description="If valid evidence was rejected or flagged, ask for a human review and explain what the automated checks may have missed." imageSrc="/images/reviewer-office.jpg" imageAlt="An evidence reviewer assessing a climate-action report" chips={['Human review', 'Transparent outcome', 'No impact penalty while pending']} />
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <section className="card p-6 sm:p-8">
            {sent ? <div className="py-12 text-center"><CheckCircle className="mx-auto h-12 w-12 text-emerald-600" /><h2 className="mt-4 text-xl font-bold text-slate-900">Review request prepared</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">Your request is ready for the reviewer workflow. Backend submission will become active when the appeals endpoint is deployed.</p><button onClick={() => setSent(false)} className="btn-secondary mt-6">Submit another request</button></div> : <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-5">
              <div><label className="label" htmlFor="submission-id">Submission ID</label><input id="submission-id" className="input" placeholder="Shown in your activity history" required /></div>
              <div><label className="label" htmlFor="appeal-reason">Why should this decision be reviewed?</label><textarea id="appeal-reason" className="input min-h-36 resize-y" placeholder="Explain the activity, evidence and any context the automated checks may not have recognised." required /></div>
              <div><label className="label" htmlFor="supporting-note">Supporting evidence link or note <span className="font-normal text-slate-400">(optional)</span></label><input id="supporting-note" className="input" placeholder="Add a document link or short reference" /></div>
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />This screen prepares the participant experience. It does not send data until the backend appeals endpoint is connected.</div>
              <button type="submit" className="btn-primary">Prepare review request</button>
            </form>}
          </section>
          <aside className="space-y-4">
            {[{icon:FileSearch,title:'1. Case review',text:'A reviewer checks the original values, evidence and automated audit trail.'},{icon:MessageSquareText,title:'2. Clarification',text:'The reviewer may request clearer proof instead of issuing an immediate rejection.'},{icon:ShieldCheck,title:'3. Recorded outcome',text:'The final decision and reason remain visible for accountability.'}].map(item => <div key={item.title} className="card p-5"><item.icon className="h-5 w-5 text-brand-600" /><h2 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">{item.text}</p></div>)}
          </aside>
        </div>
      </div>
    </div>
  );
}
