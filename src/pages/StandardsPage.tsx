import { ExternalLink, ShieldCheck, Scale, Sparkles } from 'lucide-react';
import IndiaPageHeader from '../components/IndiaPageHeader';

const standards = [
  { title: 'CEA India Grid Emission Factors', body: 'Electricity savings use India-specific grid factors published by the Central Electricity Authority.', href: 'https://cea.nic.in/cdm-co2-baseline-database/?lang=en' },
  { title: 'IPCC Assessment Guidance', body: 'Carbon accounting assumptions are aligned with internationally recognised IPCC assessment guidance.', href: 'https://www.ipcc.ch/assessment-report/ar6/' },
  { title: 'GHG Protocol', body: 'Activity boundaries and emissions reporting follow established greenhouse-gas accounting principles.', href: 'https://ghgprotocol.org/' },
  { title: 'Indian policy references', body: 'Pledge-specific guidance also draws on BEE, CPCB, MoEFCC and the Green India Mission.', href: 'https://www.beeindia.gov.in/' },
];

export default function StandardsPage() {
  return (
    <div className="app-page-surface app-page-general min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <IndiaPageHeader title="Standards & Verification" description="See how reported actions become credible carbon-impact estimates, from evidence submission to reviewer approval." imageSrc="/images/reviewer-office.jpg" imageAlt="Reviewers checking climate-action evidence" chips={['Transparent calculations', 'India-specific factors', 'Human review available']} />
        <div className="grid gap-5 md:grid-cols-3 mb-8">
          {[
            { icon: Sparkles, title: 'Automated checks', text: 'Plausibility rules check dates, quantities and activity limits before review.' },
            { icon: ShieldCheck, title: 'Evidence review', text: 'Photos and documents support each report. Uncertain submissions can be flagged for review.' },
            { icon: Scale, title: 'Appeal-ready decisions', text: 'Rejected or unclear evidence should remain explainable and available for reconsideration.' },
          ].map(item => <div key={item.title} className="card p-6"><item.icon className="mb-4 h-6 w-6 text-brand-600" /><h2 className="font-semibold text-slate-900">{item.title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">{item.text}</p></div>)}
        </div>
        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Calculation references</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">Each pledge displays its formula and source while a participant files a report. These references provide the common framework used across the platform.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {standards.map(item => <a key={item.title} href={item.href} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"><span className="flex items-center justify-between gap-3 font-semibold text-slate-800">{item.title}<ExternalLink className="h-4 w-4 text-brand-600" /></span><span className="mt-2 block text-sm leading-relaxed text-slate-500">{item.body}</span></a>)}
          </div>
        </section>
      </div>
    </div>
  );
}
