'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';

interface HostProps {
  className?: string;
}

export default function Host({ className = '' }: HostProps) {
  const t = useTranslations();

  const idealForItems = ['Adventure Seekers', 'Culture Enthusiasts', 'Nature Lovers'];
  const goodToKnowItems = ['Basic Fitness', 'Closed Shoes', 'Small Group Setting'];

  return (
    <section className={`px-4 pb-12 md:px-6 lg:px-8 ${className}`.trim()}>
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-3xl font-semibold text-base-content">
          {t('experiences.ui.experienceDetails.hostPreparationTitle')}
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card padding="md" className="border-white/15 bg-slate-900/60">
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-emerald-400/80 bg-base-100/20">
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: "url('/assets/images/hero/h7.webp')" }}
                />
                <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-emerald-950">
                  ✓
                </span>
              </div>

              <div>
                <h3 className="text-3xl font-semibold text-white">Carlos</h3>
                <p className="mt-1 inline-block rounded-md bg-emerald-500/20 px-2 py-1 text-sm font-semibold text-emerald-200">
                  VERIFIED GUIDE
                </p>
                <p className="mt-3 text-lg leading-relaxed text-white/75">
                  Local host specialized in emerald mining routes and Andean cultural experiences.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md" className="border-white/15 bg-slate-900/60">
            <div className="space-y-5">
              <div>
                <h3 className="text-3xl font-semibold text-white">
                  {t('experiences.ui.experienceDetails.idealFor')}
                </h3>
                <ul className="mt-3 space-y-2">
                  {idealForItems.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-2xl text-emerald-100">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-3xl font-semibold text-white">
                  {t('experiences.ui.experienceDetails.goodToKnow')}
                </h3>
                <ul className="mt-3 space-y-2">
                  {goodToKnowItems.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-2xl text-emerald-100">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
