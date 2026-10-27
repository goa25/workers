import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900 py-8 text-slate-300 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 sm:px-6 md:flex-row lg:px-8">
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1" aria-label="i-Pledge India">
            <span className="font-display text-sm font-semibold text-white">i-Pledge India</span>
          </div>
        </div>
        <p className="max-w-xs text-center text-xs leading-relaxed">Evidence-led climate action for Indian communities</p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center text-xs font-medium">
          <Link to="/standards" className="transition-colors hover:text-white">Standards & methodology</Link>
          <Link to="/appeals" className="transition-colors hover:text-white">Request review</Link>
        </div>
      </div>
    </footer>
  );
}
