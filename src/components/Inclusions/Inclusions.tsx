'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';

interface InclusionsProps {
  className?: string;
}

interface LogisticsItem {
  id: string;
  label: string;
  value?: string;
}

export default function Inclusions({ className = '' }: InclusionsProps) {
  const t = useTranslations();

  const logistics: LogisticsItem[] = [
    { id: 'start', label: 'Start', value: '11:00 AM' },
    { id: 'duration', label: '3 Hours' },
    { id: 'transport', label: '4x4' },
    { id: 'difficulty', label: 'Moderate Hiking' },
    { id: 'end', label: 'End Time', value: '8:30 AM' },
  ];

  const includedItems = [
    'Adventure Seekers',
    'Enclusion',
    'Culture vibes',
    'Future parts',
  ];

  const notIncludedItems = ['Backgarable', 'Not included', 'Not included'];

  return (
    <section className={`px-4 pb-10 md:px-6 lg:px-8 ${className}`.trim()}>
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-3xl font-semibold text-base-content">
          {t('experiences.ui.experienceDetails.tripLogisticsTitle')}
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card
            padding="md"
            className="border-white/15 bg-slate-900/60 lg:col-span-5"
          >
            <div className="space-y-4">
              {logistics.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-3xl font-semibold leading-tight text-white">{item.label}</p>
                    {item.value ? (
                      <p className="mt-1 text-lg text-white/70">{item.value}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:col-span-7">
            <Card
              padding="md"
              className="border-emerald-300/25 bg-emerald-900/35"
            >
              <h3 className="mb-3 text-3xl font-semibold text-emerald-100">Included</h3>
              <ul className="space-y-2">
                {includedItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-2xl text-emerald-50">
                    <span className="mt-2 inline-block h-2 w-2 rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card
              padding="md"
              className="border-rose-300/25 bg-rose-950/35"
            >
              <h3 className="mb-3 text-3xl font-semibold text-rose-100">Not Included</h3>
              <ul className="space-y-2">
                {notIncludedItems.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start gap-3 text-2xl text-rose-50">
                    <span className="mt-2 inline-block h-2 w-2 rounded-full bg-rose-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
