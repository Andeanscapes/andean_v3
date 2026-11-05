'use client';

import { memo, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Star, ExternalLink, ArrowUpRight, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type {
  LandingContent,
  LandingReviewContent,
  LandingReviewPlatformContent,
} from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';

interface ReviewsProps {
  landingData: LandingContent;
  className?: string;
}

function Stars({ rating, label, size }: { rating: number; label: string; size: number }) {
  return (
    <div role="img" className="flex items-center gap-0.5" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < Math.round(rating) ? 'currentColor' : 'none'}
          stroke="currentColor"
          className="text-primary"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/**
 * Neutral traveler mark with the review platform's logo as a micro badge. No
 * initials and no stock faces: a real `avatarUrl` replaces the icon when the
 * feed publishes one.
 */
function ReviewAvatar({ review }: { review: LandingReviewContent }) {
  return (
    <div className="relative h-10 w-10 shrink-0">
      {review.avatarUrl ? (
        <Image
          src={review.avatarUrl}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-base-content/70 ring-2 ring-primary/20"
        >
          <UserRound size={20} strokeWidth={1.75} />
        </span>
      )}
      {review.isVerified && review.sourceLogo ? (
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-base-100">
          <img
            src={review.sourceLogo}
            alt=""
            width={12}
            height={12}
            loading="lazy"
            decoding="async"
            className="h-3 w-3 object-contain"
          />
        </span>
      ) : null}
    </div>
  );
}

/** Long reviews are clamped to four lines with an inline toggle; the full text stays in the DOM. */
function ReviewBody({ id, comment, readMore, readLess }: {
  id: string;
  comment: string;
  readMore: string;
  readLess: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const bodyId = `review-body-${id}`;

  // Measured, not guessed from length: whether four lines overflow depends on the column width.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    if (typeof window.ResizeObserver === 'undefined') return;
    const observer = new window.ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        id={bodyId}
        ref={textRef}
        className={`text-xs leading-relaxed text-base-content/80 md:text-sm ${expanded ? '' : 'line-clamp-3 md:line-clamp-4'}`}
      >
        {comment}
      </div>
      {overflows || expanded ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {expanded ? readLess : readMore}
        </button>
      ) : null}
    </>
  );
}

function ReviewCard({
  review,
  outOf5Aria,
  readMore,
  readLess,
}: {
  review: LandingReviewContent;
  outOf5Aria: string;
  readMore: string;
  readLess: string;
}) {
  const t = useTranslations('Landing.reviews');
  const verifiedLabel = t('verifiedGuest');

  return (
    <article className="flex h-full flex-col rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-card md:p-6 dark:border-base-content/10 dark:bg-base-100 dark:shadow-sm">
      <Stars rating={review.rating} label={`${review.rating} ${outOf5Aria}`} size={14} />

      {review.headline ? (
        <h3 className="mt-3 text-sm font-semibold tracking-tight text-base-content md:mt-4 md:text-base">
          &ldquo;{review.headline}&rdquo;
        </h3>
      ) : null}

      <blockquote className={`mb-6 ${review.headline ? 'mt-2' : 'mt-4'}`}>
        <ReviewBody id={review.id} comment={review.comment} readMore={readMore} readLess={readLess} />
      </blockquote>

      <footer className="mt-auto flex items-center gap-3 border-t border-base-content/10 pt-5">
        <ReviewAvatar review={review} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-base-content">
            <cite className="not-italic">{review.name}</cite>
            {review.country ? (
              <span className="font-normal text-base-content/70"> · {review.country}</span>
            ) : null}
          </p>
          {review.isVerified && review.verifiedExperience && review.sourceUrl ? (
            <a
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm text-xs text-base-content/70 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {verifiedLabel} &bull; {review.verifiedExperience}
              <ExternalLink size={10} className="shrink-0" aria-hidden="true" />
              <span className="sr-only">{t('opensInNewTab')}</span>
            </a>
          ) : review.isVerified && review.verifiedExperience ? (
            <p className="text-xs text-base-content/70">
              {verifiedLabel} &bull; {review.verifiedExperience}
            </p>
          ) : null}
        </div>
      </footer>
    </article>
  );
}

function PlatformLink({ platform }: { platform: LandingReviewPlatformContent }) {
  return (
    <a
      href={platform.href}
      target="_blank"
      rel="noopener noreferrer"
      data-event={`reviews_platform_${platform.id}_click`}
      className="flex min-h-11 flex-col items-center justify-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white px-2 py-2.5 shadow-card dark:border-base-content/10 dark:bg-base-100 dark:shadow-none text-center transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 sm:flex-row sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-left"
    >
      {/* White tile: the logo sources carry a white background. Name is in the text, so alt="". */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-base-content/10 sm:h-11 sm:w-11 sm:rounded-xl sm:p-1.5">
        <img
          src={platform.logo}
          alt=""
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
          className="h-6 w-6 object-contain sm:h-8 sm:w-8"
        />
      </span>
      <span className="min-w-0 max-w-full">
        <span className="line-clamp-2 text-[11px] font-medium leading-tight text-base-content/80 sm:line-clamp-1 sm:text-sm sm:font-semibold sm:text-base-content">{platform.label}</span>
        {/* The CTA verb is redundant on a 3-up chip row; kept from sm up. */}
        <span className="hidden items-center gap-1 text-xs text-base-content/80 sm:inline-flex">
          {platform.cta}
          <ArrowUpRight size={12} aria-hidden="true" />
        </span>
      </span>
      <span className="sr-only">{platform.opensInNewTab}</span>
    </a>
  );
}

/**
 * Social proof: aggregate pill, review grid and the trust-metrics strip.
 * Every figure comes from the feed (`reviewSummary`, `metrics`); headlines are
 * verbatim pull-quotes from each review, never editorial copy.
 */
function ReviewsComponent({ landingData, className = '' }: ReviewsProps) {
  const { reviews, trustStats } = landingData;
  const { aggregateRating } = reviews;

  return (
    <SectionContainer
      labelledBy="landing-reviews"
      sectionClassName={`bg-base-200/40 px-4 py-10 md:px-6 md:py-20 lg:px-10 ${className}`.trim()}
    >
      <header className="mb-8 max-w-3xl md:mb-10">
        <h2 id="landing-reviews" className="text-balance text-md font-bold sm:text-2md leading-tight tracking-tight text-base-content md:text-4xl">
          {reviews.sectionTitle}
        </h2>
        <p className="mt-2 text-base text-base-content/80">{reviews.subtitle}</p>

        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100 px-3.5 py-1.5 text-sm text-base-content/80">
          <Star size={14} fill="currentColor" className="text-primary" aria-hidden="true" />
          <span className="font-semibold text-base-content">{aggregateRating.ratingValue.toFixed(1)}</span>
          <span aria-hidden="true">·</span>
          <span>{reviews.ratingSource}</span>
        </p>
      </header>

      <ul role="list" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {reviews.items.map((review) => (
          <li key={review.id}>
            <ReviewCard
              review={review}
              outOf5Aria={reviews.outOf5Aria}
              readMore={reviews.readMore}
              readLess={reviews.readLess}
            />
          </li>
        ))}
      </ul>

      {reviews.platforms.length > 0 ? (
        <div className="mt-10">
          <h3 id="landing-review-platforms" className="text-sm font-semibold text-base-content/80">
            {reviews.platformsTitle}
          </h3>
          <ul
            role="list"
            aria-labelledby="landing-review-platforms"
            className="mt-3 grid grid-cols-3 gap-2 sm:gap-3"
          >
            {reviews.platforms.map((platform) => (
              <li key={platform.id}>
                <PlatformLink platform={platform} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {trustStats.items.length > 0 ? (
        <>
          <h3 id="landing-truststats-title" className="sr-only">
            {trustStats.srTitle}
          </h3>
          <dl
            aria-labelledby="landing-truststats-title"
            className="mt-8 grid grid-cols-3 divide-x divide-base-content/10 rounded-2xl border border-base-content/10 bg-base-100 px-2 py-3 md:mt-12 md:px-8 md:py-6"
          >
            {trustStats.items.map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-1 px-2 text-center">
                {/* DOM order dt → dd (valid dl group); `order-*` shows the value first. */}
                <dt className="order-2 text-[11px] leading-tight tracking-wide text-base-content/80 md:text-sm md:tracking-normal">{item.label}</dt>
                <dd className="order-1 text-2md font-bold tracking-tight text-base-content md:text-4xl">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
    </SectionContainer>
  );
}

ReviewsComponent.displayName = 'Reviews';

export default memo(ReviewsComponent);
