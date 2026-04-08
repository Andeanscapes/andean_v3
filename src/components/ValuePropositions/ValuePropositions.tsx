'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';

interface ValuePropositionsProps {
  className?: string;
}

interface ValuePropositionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  badge?: string;
}

export default function ValuePropositions({ className = '' }: ValuePropositionsProps) {
  const t = useTranslations();

  const items: ValuePropositionItem[] = [
    {
      id: 'tile-1',
      title: t('experiences.ui.experienceDetails.tile1Title'),
      description: t('experiences.ui.experienceDetails.tile1Desc'),
      imageUrl: '/assets/images/hero/h10.webp',
      badge: 'VERIFIED GUIDE',
    },
    {
      id: 'tile-2',
      title: t('experiences.ui.experienceDetails.tile2Title'),
      description: t('experiences.ui.experienceDetails.tile2Desc'),
      imageUrl: '/assets/images/hero/h7.webp',
    },
    {
      id: 'tile-3',
      title: t('experiences.ui.experienceDetails.tile3Title'),
      description: t('experiences.ui.experienceDetails.tile3Desc'),
      imageUrl: '/assets/images/hero/h8.webp',
    },
  ];

  return (
    <section className={`px-4 pb-10 md:px-6 lg:px-8 ${className}`.trim()}>
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-3xl font-semibold text-base-content">
          {t('experiences.ui.experienceDetails.valuePropositionsTitle')}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <Card
              key={item.id}
              padding="sm"
              className="group relative h-[380px] overflow-hidden border-white/15 bg-slate-900/60"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  backgroundImage:
                    `linear-gradient(to top, rgba(5, 10, 20, 0.8), rgba(5, 10, 20, 0.15)), url('${item.imageUrl}')`,
                }}
              />

              <div className="relative z-10 flex h-full flex-col justify-between p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-black/35 px-2 py-1 text-sm font-medium text-white backdrop-blur-sm">
                    Tile {index + 1}
                  </span>
                  {item.badge ? (
                    <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-4xl font-semibold leading-tight text-white">{item.title}</h3>
                  <p className="mt-2 text-lg text-white/80">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
