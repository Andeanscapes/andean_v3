'use client';

import { useTranslations } from 'next-intl';
import { Accordion } from '@/components/ui/Accordion/Accordion';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';

interface FaqsProps {
  className?: string;
}

export default function Faqs({ className = '' }: FaqsProps) {
  const t = useTranslations();

  const faqItems = [
    {
      id: 'faq-1',
      title: t('experiences.ui.experienceDetails.faq1Q'),
      content: t('experiences.ui.experienceDetails.faq1A'),
    },
    {
      id: 'faq-2',
      title: t('experiences.ui.experienceDetails.faq2Q'),
      content: t('experiences.ui.experienceDetails.faq2A'),
    },
    {
      id: 'faq-3',
      title: t('experiences.ui.experienceDetails.faq3Q'),
      content: t('experiences.ui.experienceDetails.faq3A'),
    },
  ];

  return (
    <section className={`px-4 pb-12 md:px-6 lg:px-8 ${className}`.trim()}>
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-3xl font-semibold text-base-content">
          {t('experiences.ui.experienceDetails.faqsTitle')}
        </h2>

        <Accordion items={faqItems} defaultOpen={['faq-1']} className="mb-6" />

        <Card
          padding="md"
          className="overflow-hidden border-white/20 bg-slate-900/70"
        >
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              backgroundImage:
                "linear-gradient(to top, rgba(5, 10, 20, 0.65), rgba(5, 10, 20, 0.25)), url('/assets/images/hero/h5.webp')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <h3 className="max-w-3xl text-4xl font-semibold uppercase leading-tight text-white md:text-5xl">
              {t('experiences.ui.experienceDetails.exploreHiddenHeart')}
            </h3>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="border-0 bg-success px-8 text-success-content hover:bg-success/90"
              >
                {t('experiences.ui.experienceDetails.checkDatesBtn')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/35 bg-base-100/10 px-8 text-white hover:bg-base-100/20"
              >
                {t('experiences.ui.experienceDetails.talkToHostBtn')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
