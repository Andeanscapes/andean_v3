import type { ReactNode } from 'react';

interface ExperienceHeroProps {
  title: string;
  subtitle: string;
  widget: ReactNode;
}

export default function ExperienceHero({
  title,
  subtitle,
  widget,
}: ExperienceHeroProps) {
  return (
    <section className="px-4 pb-6 pt-4 md:px-6 lg:px-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-base-300/60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(8,18,32,0.85), rgba(8,18,32,0.45)), url('/assets/images/hero/h10.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="grid min-h-[560px] grid-cols-1 gap-8 p-6 md:p-8 lg:grid-cols-12 lg:p-10">
          <div className="lg:col-span-7">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold leading-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">{subtitle}</p>
            </div>
          </div>

          <div className="lg:col-span-5 lg:pl-4">{widget}</div>
        </div>
      </div>
    </section>
  );
}