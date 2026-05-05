'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Star, BadgeCheck, HeadphonesIcon, Lock, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LandingContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';

const TRUST_ICON_MAP: Record<string, React.ReactNode> = {
  BadgeCheck: <BadgeCheck size={18} className="text-primary" aria-hidden="true" />,
  HeadphonesIcon: <HeadphonesIcon size={18} className="text-primary" aria-hidden="true" />,
  Lock: <Lock size={18} className="text-primary" aria-hidden="true" />,
  ShieldCheck: <ShieldCheck size={18} className="text-primary" aria-hidden="true" />,
};

interface ReviewsProps {
  landingData: LandingContent;
  className?: string;
}

function ReviewsComponent({ landingData, className = '' }: ReviewsProps) {
  const { reviews } = landingData;
  const { aggregateRating, trustPanel } = reviews;
  const t = useTranslations('Landing.reviews');

  return (
    <SectionContainer
      sectionClassName={`bg-base-100 px-4 py-16 md:px-6 md:py-20 lg:px-10 ${className}`.trim()}
    >
      {/* Header */}
      <div className="mb-8 md:mb-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">{reviews.eyebrow}</p>
        <h2 className="text-3xl font-bold tracking-tight leading-tight text-base-content md:text-4xl">
          {reviews.sectionTitle}
        </h2>
        <p className="mt-2 text-base text-base-content/65">{reviews.subtitle}</p>

        {/* Aggregate rating */}
        <div className="mt-4 flex items-center gap-2.5">
          <div className="flex items-center gap-0.5" aria-label={`${aggregateRating.ratingValue} ${reviews.outOf5Aria}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                fill={i < Math.round(aggregateRating.ratingValue) ? 'currentColor' : 'none'}
                stroke="currentColor"
                className="text-primary"
              />
            ))}
          </div>
          <span className="text-lg font-bold text-base-content">{aggregateRating.ratingValue.toFixed(1)}</span>
          <span className="text-sm text-base-content/60">({aggregateRating.reviewCount} {reviews.countSuffix})</span>
        </div>
      </div>

      {/* Two column: reviews + trust panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
        {/* Review cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {reviews.items.map((review) => (
            <div
              key={review.id}
              className="flex flex-col gap-3 rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg md:p-6"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5" aria-label={`${review.rating} ${reviews.outOf5Aria}`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    fill={i < review.rating ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    className="text-primary"
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="flex-1 text-sm leading-relaxed text-base-content/85">
                &ldquo;{review.comment}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-2.5 pt-1">
                {review.avatarUrl ? (
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={review.avatarUrl}
                      alt={review.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <span
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                    aria-hidden="true"
                  >
                    {review.name.charAt(0)}
                  </span>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-base-content">{review.name}</p>
                    {review.isVerified ? (
                      <BadgeCheck
                        size={14}
                        className="text-primary flex-shrink-0"
                        aria-label={t('verifiedGuest')}
                      />
                    ) : null}
                  </div>
                  {review.isVerified && review.verifiedExperience ? (
                    <p className="text-[11px] font-medium text-base-content/60">
                      {t('verifiedGuest')} &bull; {review.verifiedExperience}
                    </p>
                  ) : (
                    <p className="text-xs text-base-content/55">
                      {review.countryFlag} {review.country}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust panel */}
        <div className="h-fit rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm lg:sticky lg:top-24">
          <h3 className="mb-4 text-base font-bold text-base-content">{trustPanel.title}</h3>
          <ul className="space-y-3">
            {trustPanel.bullets.map((bullet) => (
              <li key={bullet.id} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  {TRUST_ICON_MAP[bullet.iconName] ?? <BadgeCheck size={18} className="text-primary" aria-hidden="true" />}
                </span>
                <span className="text-sm text-base-content/80">{bullet.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionContainer>
  );
}

ReviewsComponent.displayName = 'Reviews';

export default memo(ReviewsComponent);

