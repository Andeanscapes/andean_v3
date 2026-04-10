import { memo, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';

interface ExperienceHeroProps {
  title: string;
  subtitle: string;
  widget: ReactNode;
}

function ExperienceHeroComponent({
  title,
  subtitle,
  widget,
}: ExperienceHeroProps) {
  const t = useTranslations('experiences.ui.experienceDetails');
  const valueStack = [
    t('valueStackPrivateMineAccess'),
    t('valueStackLocalExpertGuides'),
    t('valueStackAllMealsIncluded'),
    t('valueStackPremiumTransport'),
  ];
  const heroBackgroundSrc = '/assets/images/hero/h10.webp';

  return (
    <section className="relative w-full overflow-hidden">
      <img
        src={heroBackgroundSrc}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      <SectionContainer
        as="div"
        sectionClassName="relative"
        containerClassName="grid min-h-[520px] grid-cols-1 gap-6 px-4 pb-8 pt-24 md:min-h-[560px] md:gap-8 md:px-6 md:pb-16 md:pt-32 lg:grid-cols-12 lg:px-10 lg:py-10"
      >
          <div className="lg:col-span-7 pt-0 md:pt-12 lg:pt-16">
            <div className="max-w-3xl">
              <h1 className="mt-4 text-4xl font-bold leading-[0.96] text-white drop-shadow-md md:mt-0 md:text-5xl lg:text-6xl xl:text-7xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-white/85 line-clamp-2 md:mt-5 md:text-base md:leading-relaxed md:line-clamp-none lg:text-[2rem] lg:leading-tight">
                {subtitle}
              </p>
              <p className="mb-5 mt-4 max-w-xl text-sm font-medium leading-relaxed text-white/85 line-clamp-3 md:mb-6 md:mt-6 md:text-base md:line-clamp-none">
                {t('experienceSummary')}
              </p>

              <div className="grid grid-cols-2 gap-2 md:gap-x-6 md:gap-y-3">
                {valueStack.map((item) => (
                  <div key={item} className="flex items-center gap-1.5 md:gap-2">
                    <Check
                      size={14}
                      color="#00C978"
                      strokeWidth={2.25}
                      className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] md:h-[18px] md:w-[18px]"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-white/90 md:text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 lg:col-span-5 lg:pl-4 md:pt-12 lg:pt-16">{widget}</div>
      </SectionContainer>
    </section>
  );
}

ExperienceHeroComponent.displayName = 'ExperienceHero';

export default memo(ExperienceHeroComponent);