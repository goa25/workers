import type { ReactNode } from 'react';
import { MapPin } from 'lucide-react';

interface IndiaPageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  chips?: string[];
  action?: ReactNode;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
}

export default function IndiaPageHeader({
  title,
  description,
  eyebrow = 'i-Pledge India',
  chips = [],
  action,
  imageSrc,
  imageAlt,
  imagePosition = '70% center',
}: IndiaPageHeaderProps) {
  return (
    <section className="page-hero relative overflow-hidden rounded-none bg-emerald-950 text-white shadow-none mb-8 border border-emerald-950">
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(280px,42%)]">
        <div className="order-2 p-6 sm:p-8 md:order-1 md:flex md:flex-col md:justify-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            {eyebrow}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm sm:text-base text-emerald-50/80 mt-2 max-w-2xl leading-relaxed">{description}</p>
            </div>
            {action ? <div className="flex-shrink-0">{action}</div> : null}
          </div>
          {chips.length > 0 ? (
            <ul className="grid gap-2 border-t border-white/20 pt-4 mt-5 text-sm sm:grid-cols-3">
              {chips.map(chip => (
                <li key={chip} className="flex items-start gap-2 text-emerald-50">
                  <span className="mt-2 h-1 w-1 flex-none bg-emerald-300" aria-hidden="true" />
                  <span>{chip}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="relative order-1 h-52 sm:h-64 md:order-2 md:h-auto md:min-h-full">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: imagePosition }}
          />
        </div>
      </div>
    </section>
  );
}
