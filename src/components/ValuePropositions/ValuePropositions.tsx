'use client';

import type { ExperienceData } from '@/lib/schemas';
import { Card } from '@/components/ui/Card/Card';

interface ValuePropositionsProps {
  className?: string;
  experienceData: ExperienceData;
}

export default function ValuePropositions({ className = '', experienceData }: ValuePropositionsProps) {
  const valuePropositions = experienceData.valuePropositionsContent;

  return (
    <section className={`px-4 pb-20 pt-10 md:px-6 md:pb-20 md:pt-20 lg:px-10 ${className}`.trim()}>
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-10 md:mb-12 lg:mb-14">
          <h2 className="text-3xl font-bold leading-tight text-base-content md:text-4xl">
            {valuePropositions?.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
          {valuePropositions?.items.map((item) => (
            <Card
              key={item.id}
              padding="sm"
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border-white/10 bg-slate-900/40 backdrop-blur-md transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:border-[#00F08F]/50 hover:bg-slate-900/60"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: item.id === 'tile-3'
                    ? `linear-gradient(135deg, rgba(8,18,32,0.9), rgba(0,0,0,0.4)), url('${item.imageUrl}')`
                    : `linear-gradient(135deg, rgba(8,18,32,0.85), rgba(8,18,32,0.4)), url('${item.imageUrl}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {item.id === 'tile-3' ? (
                <div className="pointer-events-none absolute inset-0 bg-black/40" />
              ) : null}

              <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
                <div className="flex justify-end">
                  {item.badge ? (
                    <span className="animate-[pulse_2.8s_ease-in-out_infinite] rounded-full bg-emerald-500/85 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-lg">
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-xl font-bold leading-tight text-white drop-shadow-md md:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base font-medium leading-relaxed text-white/85 md:text-lg">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
