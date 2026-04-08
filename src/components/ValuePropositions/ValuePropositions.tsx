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
    <section className={`px-4 py-10 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}>
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
              className="group relative h-[320px] overflow-hidden border-white/10 bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-slate-900/60"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage:
                    `linear-gradient(135deg, rgba(8,18,32,0.85), rgba(8,18,32,0.4)), url('${item.imageUrl}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
                <div className="flex justify-end">
                  {item.badge ? (
                    <span className="rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-3xl font-bold leading-tight text-white drop-shadow-md md:text-4xl">
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
