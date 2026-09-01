/**
 * v2 landing feed → the raw shape the landing translator pipeline consumes.
 *
 * Mirrors `experienceFeedAdapter`: the feed carries business data and stable
 * domain codes, this file resolves them to **i18n keys** via
 * `src/i18n/mappings/*` and merges them with the frontend-owned structure in
 * `src/lib/content/landing.structure.ts`. The existing projectors in
 * `landingTranslators.ts` then run unchanged.
 *
 * Output is key-resolved, never translated — the `t` pass stays in the
 * translators. Anything user-facing emitted here must be a key, not copy.
 */

import { EXPERIENCE_I18N } from '@/i18n/mappings/experience';
import { LANDING_I18N, countryKeyFor } from '@/i18n/mappings/landing';
import { LANDING_STRUCTURE } from '@/lib/content/landing.structure';
import type { LandingFeed } from '@/lib/schemas/landing.schema';
import type { LandingExperienceV2, LandingFeedV2 } from '@/lib/schemas/feed/v2';
import { experiencePath } from '@/utils/experienceRoutes';
import { whatsappUrl } from '@/utils/whatsapp';

const S = LANDING_STRUCTURE;

/**
 * The flagship experience card.
 *
 * `depositPercent` is optional on the projection during rollout. It is passed
 * through as `undefined` rather than defaulted, so the translator can suppress
 * the deposit note instead of advertising "0%".
 */
function toFlagship(
  entry: LandingExperienceV2,
  feed: LandingFeedV2,
): LandingFeed['flagship'] {
  const mapping = EXPERIENCE_I18N[entry.id];

  return {
    experienceId: entry.id,
    experienceSlug: entry.slug,
    badgeKey: S.featured.badgeKey,
    titleKey: mapping.title,
    subtitleKey: mapping.subtitle,
    descriptionKey: mapping.description,
    backgroundImage: entry.media.hero,
    valueChips: S.hero.trustChips.map((chip) => ({
      id: chip.id,
      iconName: chip.iconName,
      labelKey: chip.labelKey,
    })),
    pricing: {
      fromAmount: entry.fromPrice.amount,
      currency: entry.fromPrice.currency,
      depositPercent: entry.depositPercent,
    },
    availableDates: entry.availableDates,
    // transportOptions / maxPeople / minPeople are intentionally omitted: booking
    // inventory is not projected onto landing, and emitting `0` would be false
    // data rather than absent data.
    whatsappLink: whatsappUrl(),
    reviewsCount: feed.reviewSummary.count,
    reviewsRating: feed.reviewSummary.rating,
  };
}

function toFeaturedExperiences(feed: LandingFeedV2): LandingFeed['featuredExperiences'] {
  const byId = new Map(feed.experiences.map((entry) => [entry.id, entry]));

  const items = feed.featuredExperienceIds
    .map((id) => byId.get(id))
    .filter((entry): entry is LandingExperienceV2 => entry !== undefined)
    .filter((entry) => entry.status === 'published')
    .map((entry) => {
      const mapping = EXPERIENCE_I18N[entry.id];

      return {
        id: entry.id,
        experienceSlug: entry.slug,
        titleKey: mapping.title,
        descriptionKey: mapping.description,
        image: entry.media.card,
        href: experiencePath(entry.slug),
        badgeKey: S.featured.badgeKey,
        // Structured in v2, so the card composes them from ICU keys rather than
        // reading a pre-formatted literal out of the feed.
        durationKey: 'ExperiencesList.cardMeta.durationDaysNights',
        durationValues: { days: entry.duration.days, nights: entry.duration.nights },
        locationKey: 'ExperiencesList.cardMeta.startsIn',
        locationValues: { locality: entry.location.locality },
        fromAmount: entry.fromPrice.amount,
        currency: entry.fromPrice.currency,
      };
    });

  return {
    sectionTitleKey: S.featured.sectionTitleKey,
    viewAllLabelKey: S.featured.viewAllLabelKey,
    viewAllHref: S.featured.viewAllHref,
    items,
  };
}

function toReviews(feed: LandingFeedV2): LandingFeed['reviews'] {
  const featured = new Set(feed.featuredReviewIds);
  const commentKeys: Record<string, string> = EXPERIENCE_I18N[feed.flagshipExperienceId].reviews;

  const items = feed.reviews
    // An empty `featuredReviewIds` means "no explicit selection", so show all.
    .filter((review) => featured.size === 0 || featured.has(review.id))
    .map((review) => {
      const commentKey = commentKeys[review.id];

      // Consistent with the experience adapter: an unmapped code fails loudly.
      // Dropping the review instead would remove it from the trust panel with no
      // signal, and the aggregate count would then disagree with what renders.
      if (!commentKey) {
        throw new Error(
          `[LandingFeedAdapter] No comment mapping for review "${review.id}". ` +
            'Add it to src/i18n/mappings/experience.ts before publishing the feed entry.',
        );
      }

      return {
        id: review.id,
        name: review.authorName,
        countryKey: countryKeyFor(review.countryCode),
        rating: review.rating,
        commentKey,
        isVerified: review.verified,
        verifiedExperienceKey: LANDING_I18N.reviewSource[review.source],
      };
    });

  return {
    sectionTitleKey: S.reviews.sectionTitleKey,
    subtitleKey: S.reviews.subtitleKey,
    items,
    trustPanel: {
      titleKey: S.reviews.trustPanel.titleKey,
      bullets: S.reviews.trustPanel.bullets.map((bullet) => ({
        id: bullet.id,
        iconName: bullet.iconName,
        textKey: bullet.textKey,
      })),
    },
    aggregateRating: {
      ratingValue: feed.reviewSummary.rating,
      reviewCount: feed.reviewSummary.count,
    },
  };
}

/** Values come from the feed; only the labels are frontend-owned. */
function toTrustStats(feed: LandingFeedV2): LandingFeed['trustStats'] {
  const { reviewSummary, metrics } = feed;

  return {
    items: [
      { id: 'rating', value: reviewSummary.rating.toFixed(1), labelKey: S.trustStats.ratingLabelKey },
      { id: 'travelers', value: `${metrics.travelersHostedMinimum}+`, labelKey: S.trustStats.travelersLabelKey },
      { id: 'recommend', value: `${metrics.recommendationPercent}%`, labelKey: S.trustStats.recommendLabelKey },
    ],
  };
}

/**
 * Compose the v1-shaped raw landing payload from the v2 feed.
 *
 * Throws when the flagship experience is missing or unmapped: the hero is the
 * page's primary conversion path, so rendering it empty is worse than failing.
 */
export function adaptLandingFeedV2(feed: LandingFeedV2): LandingFeed {
  const flagshipEntry = feed.experiences.find((entry) => entry.id === feed.flagshipExperienceId);

  if (!flagshipEntry) {
    throw new Error(
      `[LandingFeedAdapter] flagshipExperienceId "${feed.flagshipExperienceId}" is not in experiences[].`,
    );
  }

  if (!EXPERIENCE_I18N[flagshipEntry.id]) {
    throw new Error(
      `[LandingFeedAdapter] No i18n mapping for flagship experience "${flagshipEntry.id}". ` +
        'Add it to src/i18n/mappings/experience.ts before publishing the feed entry.',
    );
  }

  return {
    flagship: toFlagship(flagshipEntry, feed),
    heroBrand: {
      eyebrowKey: S.hero.eyebrowKey,
      titleKey: S.hero.titleKey,
      subtitleKey: S.hero.subtitleKey,
      descriptionKey: S.hero.descriptionKey,
      backgroundImage: S.hero.backgroundImage,
      primaryCtaLabelKey: S.hero.primaryCtaLabelKey,
      primaryCtaHref: S.hero.primaryCtaHref,
      secondaryCtaLabelKey: S.hero.secondaryCtaLabelKey,
      secondaryCtaHref: S.hero.secondaryCtaHref,
      trustChips: S.hero.trustChips.map((chip) => ({
        id: chip.id,
        iconName: chip.iconName,
        labelKey: chip.labelKey,
      })),
      bookingCard: { ...S.hero.bookingCard },
    },
    categories: {
      sectionTitleKey: S.categories.sectionTitleKey,
      items: S.categories.items.map((item) => ({
        id: item.id,
        iconName: item.iconName,
        titleKey: item.titleKey,
        descriptionKey: item.descriptionKey,
        imageUrl: item.imageUrl,
        href: item.href,
        ctaLabelKey: S.categories.ctaLabelKey,
        exclusiveAccessKey: 'exclusiveAccessKey' in item ? item.exclusiveAccessKey : undefined,
      })),
    },
    featuredExperiences: toFeaturedExperiences(feed),
    whyUs: {
      sectionTitleKey: S.whyUs.sectionTitleKey,
      leadKey: S.whyUs.leadKey,
      items: S.whyUs.items.map((item) => ({ ...item })),
    },
    howItWorks: {
      sectionTitleKey: S.howItWorks.sectionTitleKey,
      steps: S.howItWorks.steps.map((step) => ({ ...step })),
    },
    travelerSegments: {
      sectionTitleKey: S.travelerSegments.sectionTitleKey,
      segments: S.travelerSegments.segments.map((segment) => ({
        id: segment.id,
        iconName: segment.iconName,
        labelKey: segment.labelKey,
        recommendationKey: segment.recommendationKey,
        ctaLabelKey: S.travelerSegments.ctaLabelKey,
        ctaHref: S.travelerSegments.ctaHref,
      })),
    },
    trustStats: toTrustStats(feed),
    locationBrand: {
      sectionTitleKey: S.location.sectionTitleKey,
      mapImage: S.location.mapImage,
      mapImageAltKey: S.location.mapImageAltKey,
      bullets: S.location.bullets.map((bullet) => ({ ...bullet })),
      ctaLabelKey: S.location.ctaLabelKey,
      ctaHref: S.location.ctaHref,
    },
    safety: {
      sectionTitleKey: S.safety.sectionTitleKey,
      leadKey: S.safety.leadKey,
      items: S.safety.items.map((item) => ({ ...item })),
      protocolLinkLabelKey: S.safety.protocolLinkLabelKey,
      protocolHref: S.safety.protocolHref,
    },
    globalCtas: {
      exploreHref: S.globalCtas.exploreHref,
      whatsappHref: whatsappUrl(),
      fromAmount: flagshipEntry.fromPrice.amount,
      currency: flagshipEntry.fromPrice.currency,
    },
    reviews: toReviews(feed),
    faqs: {
      sectionTitleKey: S.faqs.sectionTitleKey,
      items: S.faqs.itemIds.map((id) => ({
        id,
        questionKey: `Landing.faqs.items.${id}.question`,
        answerKey: `Landing.faqs.items.${id}.answer`,
      })),
    },
    finalCta: {
      sectionTitleKey: S.finalCta.sectionTitleKey,
      subtitleKey: S.finalCta.subtitleKey,
      backgroundImage: S.finalCta.backgroundImage,
      primaryCtaLabelKey: S.finalCta.primaryCtaLabelKey,
      primaryCtaHref: S.finalCta.primaryCtaHref,
      secondaryCtaLabelKey: S.finalCta.secondaryCtaLabelKey,
      trustBadges: S.finalCta.trustBadges.map((badge) => ({ ...badge })),
    },
  };
}
