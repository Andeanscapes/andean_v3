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
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(8,18,32,0.88), rgba(8,18,32,0.5)), url('/assets/images/hero/h10.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <div className="relative mx-auto grid min-h-[560px] max-w-screen-2xl grid-cols-1 gap-8 px-4 py-6 md:px-6 md:py-8 lg:grid-cols-12 lg:px-10 lg:py-10">
          <div className="lg:col-span-7 pt-8 md:pt-12 lg:pt-16">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold leading-[0.96] text-white drop-shadow-md md:text-6xl lg:text-7xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-white/85 md:text-[2rem] md:leading-tight">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 lg:pl-4 pt-8 md:pt-12 lg:pt-16">{widget}</div>
        </div>
    </section>
  );
}