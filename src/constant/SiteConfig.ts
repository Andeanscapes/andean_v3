/**
 * Centralized configuration for Andean Scapes site
 * Contains all social media links, contact information, and other site-wide constants
 */

import type { ExperienceId, ReviewSourceCode } from '@/lib/schemas/feed/v2';
import { LANDING_STRUCTURE } from '@/lib/content/landing.structure';

/**
 * Public business phone, digits only (E.164 without `+`).
 *
 * Single source of truth in the app. The value comes from the build environment
 * (`.env.local` locally, the `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` CI variable in
 * CI; see `.env.example`) and `NEXT_PUBLIC_` inlines it into the client bundle,
 * because the WhatsApp CTAs render in Client Components. Public configuration,
 * not a credential — the same number is visible in every rendered link.
 *
 * No hardcoded fallback on purpose. A default here is what let the configured
 * and the rendered number disagree silently; an empty value now produces a
 * visibly broken link instead of a plausible wrong one.
 */
const WHATSAPP_PHONE_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ?? '';

/**
 * Digits → display form, so the dialable value and the rendered one cannot drift.
 *
 * Assumes the Colombian shape (country code `57` + 10 digits), which is the only
 * one this business uses. Anything else falls back to `+<digits>` rather than
 * inventing grouping for a format it does not know.
 */
function formatPhoneDisplay(digits: string): string {
  if (!digits) return '';
  if (!digits.startsWith('57') || digits.length !== 12) return `+${digits}`;

  const national = digits.slice(2);
  return `+57 ${national.slice(0, 3)}-${national.slice(3)}`;
}

export const SOCIAL_LINKS = {
  // `whatsapp` is intentionally absent: a WhatsApp link needs a *localized*
  // prefill message, so call sites build it with `whatsappUrl(t(...))` from
  // `@/utils/whatsapp`. A constant here could only carry hardcoded copy.
  instagram: "https://www.instagram.com/andean_scapes/",
  facebook: "/",
  twitter: "/",
  pinterest: "/",
  youtube: "/",
} as const;

export const CONTACT_INFO = {
  phone: WHATSAPP_PHONE_NUMBER,
  phoneDisplay: formatPhoneDisplay(WHATSAPP_PHONE_NUMBER),
  email: "info@andeanscapes.com",
  address: "Colombia",
} as const;

/**
 * Phone shown in the footer bottom bar only. Deliberately separate from
 * `CONTACT_INFO.phone`, which stays the WhatsApp number for every CTA.
 */
const FOOTER_PHONE_NUMBER = '573124815443';

export const FOOTER_PHONE = {
  phone: FOOTER_PHONE_NUMBER,
  phoneDisplay: formatPhoneDisplay(FOOTER_PHONE_NUMBER),
} as const;

/**
 * Registered company and operating base, used for structured data only.
 * The legal address (Bogotá) differs from where tours run (Hacienda El Recuerdo,
 * Mundo Nuevo - Ubalá, next to Chivor); keep both in sync with the Google
 * Business Profile.
 */
export const BUSINESS_INFO = {
  legalName: 'Andean Scapes Colombia SAS',
  taxId: '9021124608',
  legalAddress: {
    streetAddress: 'Calle 78A #63-50',
    addressLocality: 'Bogotá',
    addressRegion: 'Bogotá D.C.',
    addressCountry: 'CO',
  },
  operatingBase: {
    name: 'Hacienda El Recuerdo',
    addressLocality: 'Ubalá',
    addressRegion: 'Cundinamarca',
    addressCountry: 'CO',
  },
  areaServed: [
    { name: 'Chivor', region: 'Boyacá' },
    { name: 'Ubalá', region: 'Cundinamarca' },
  ],
  /** Builds this site and runs the online reservation process. */
  technologyProvider: {
    name: 'Andean Heritage LLC',
  },
} as const;

export const BOOKING_LINKS = {
  airbnb:
    "https://www.airbnb.com.co/rp/heinnerz?p=recommendations&product=experience&listing_id=6782419&s=67&unique_share_id=bc818263-c312-42e1-a495-74cf6d678b58",
} as const;

export const REVIEW_LINKS = {
  airbnb: "https://www.airbnb.com.co/experiences/6782419",
} as const satisfies Record<ReviewSourceCode, string>;

export type ReviewPlatformId = 'google' | 'airbnb' | 'getyourguide';

/**
 * Public profile/listing per review or booking platform, in display order.
 * `null` hides the platform: never link to a page that is not live yet.
 * Logos live in `REVIEW_PLATFORM_LOGOS` (below).
 */
export const REVIEW_PLATFORM_LINKS: Readonly<Record<ReviewPlatformId, string | null>> = {
  google: "https://share.google/QoyuDoKsJPGL56LIX",
  airbnb: REVIEW_LINKS.airbnb,
  // No locale prefix (e.g. `/en-au/`): GetYourGuide picks the visitor's language.
  getyourguide:
    "https://www.getyourguide.com/boyaca-department-l201598/chivor-2-day-emerald-mine-tour-w-horseback-hacienda-stay-t1486425/",
};

/**
 * Experience FAQ i18n keys (question/answer pairs). Shared by the rendered
 * `<Faqs>` section and the `FAQPage` JSON-LD so the markup always matches what
 * the page shows.
 */
const COMMON_EXPERIENCE_FAQ_KEYS = [
  { id: 'faq-1', question: 'experiences.ui.experienceDetails.faq1Q', answer: 'experiences.ui.experienceDetails.faq1A' },
  { id: 'faq-2', question: 'experiences.ui.experienceDetails.faq2Q', answer: 'experiences.ui.experienceDetails.faq2A' },
  { id: 'faq-3', question: 'experiences.ui.experienceDetails.faq3Q', answer: 'experiences.ui.experienceDetails.faq3A' },
] as const;

const COSCUEZ_FAQ_KEYS = [
  COMMON_EXPERIENCE_FAQ_KEYS[0],
  COMMON_EXPERIENCE_FAQ_KEYS[1],
  {
    id: 'faq-3',
    question: 'experiences.ui.experienceDetails.coscuezTransportFaqQ',
    answer: 'experiences.ui.experienceDetails.coscuezTransportFaqA',
  },
] as const;

type LandingFaqId = (typeof LANDING_STRUCTURE.faqs.itemIds)[number];

/**
 * Chivor facts shared with the landing FAQs, so both pages state the same policy.
 * Deposit, cancellation, pet and age rules mirror the WhatsApp bot config
 * (`cdn.andeanscapes.com/whatsapp_bot/bot-dynamic.json`); update both together.
 */
const landingFaq = (id: LandingFaqId) => ({
  id: `faq-${id}`,
  question: `Landing.faqs.items.${id}.question`,
  answer: `Landing.faqs.items.${id}.answer`,
});

/** Plan-specific difficulty and start time, then the shared Chivor facts. */
function chivorFaqKeys(experienceId: Extract<ExperienceId, `chivor${string}`>) {
  const details = `experiences.${experienceId}.experienceDetails`;
  return [
    // `faq-1` is the item `<Faqs>` opens by default.
    { id: 'faq-1', question: `${details}.faq1Q`, answer: `${details}.faq1A` },
    { id: 'faq-start', question: `${details}.faqStartQ`, answer: `${details}.faqStartA` },
    landingFaq('transportHelp'),
    landingFaq('minerForADay'),
    landingFaq('safety'),
    landingFaq('bestSeason'),
    landingFaq('pets'),
    landingFaq('payment'),
    landingFaq('cancellation'),
  ];
}

const EXPERIENCE_FAQ_KEYS = {
  chivorEmeraldCore: chivorFaqKeys('chivorEmeraldCore'),
  chivorEmeraldBasic: chivorFaqKeys('chivorEmeraldBasic'),
  chivorEmeraldPrime: chivorFaqKeys('chivorEmeraldPrime'),
  coscuezEmeraldCore: COSCUEZ_FAQ_KEYS,
  coscuezEmeraldPrime: COSCUEZ_FAQ_KEYS,
  emeraldMining: COMMON_EXPERIENCE_FAQ_KEYS,
} as const satisfies Record<ExperienceId, readonly { id: string; question: string; answer: string }[]>;

export function getExperienceFaqKeys(experienceId: ExperienceId) {
  return EXPERIENCE_FAQ_KEYS[experienceId];
}

export const MOBILE_MENU_CHIPS = [
  { id: 'emerald', i18nKey: 'chips.emerald', href: '/experiences' },
  { id: 'nature', i18nKey: 'chips.nature', href: '/experiences' },
  { id: 'rural', i18nKey: 'chips.rural', href: '/experiences' },
  { id: 'horseback', i18nKey: 'chips.horseback', href: '/experiences' },
] as const;

export const SITE_INFO = {
  name: "Andean Scapes",
  url: "https://andeanscapes.com",
  // WebP, converted losslessly from the original PNGs — pixel-identical once
  // composited, and a third of the bytes. `logoWhite` matters most: `Header`
  // swaps to it mid-scroll on the light theme, so it is fetched late and its
  // size is visible as a flash.
  logo: "/assets/images/logo.webp",
  logoWhite: "/assets/images/logo-white.webp",
} as const;

/**
 * Footer trust gallery — brand chrome, not business data.
 *
 * These are CDN-relative paths resolved by `resolveMediaUrl`, the same treatment
 * feed media gets. They live here rather than in a feed resource because the
 * footer renders in the layout on every public route, and no page may fetch a
 * second feed resource to render (see the one-resource-per-page constraint in
 * `docs/V2_REMOTE_RESOURCES_MIGRATION.md`).
 *
 * Swap the images by replacing the R2 objects at these keys — no deploy needed.
 * `media:push` treats them as orphans because no feed references them, so pushes
 * that touch only these keys need `--allow-orphan`.
 */
export const FOOTER_TRUST_GALLERY = [
  "/images/brand/footer/ugc-1.webp",
  "/images/brand/footer/ugc-2.webp",
  "/images/brand/footer/ugc-3.webp",
  "/images/brand/footer/ugc-4.webp",
] as const;

/**
 * Host portrait in the landing "why us" section — brand media, like the footer
 * gallery, so it lives here rather than in the feed: no feed field means no
 * deploy-before-publish ordering. Replace the R2 object (and its `-mobile`
 * sibling) to change the photo; no deploy needed.
 */
export const HOST_PORTRAIT = "/images/brand/card-host-portrait.webp";

export type TravelerSegmentId = 'couples' | 'families' | 'nomads' | 'private' | 'adventure' | 'culture';

/**
 * Photo per traveler profile in "Who comes on our trips" — brand media, owned
 * here like `HOST_PORTRAIT`. Each key needs a `-mobile` sibling (rendered via
 * `<picture>`). Swap a photo by replacing the R2 object; no deploy needed.
 */
export const TRAVELER_SEGMENT_IMAGES: Readonly<Record<TravelerSegmentId, string>> = {
  couples: "/images/brand/segments/couples.webp",
  families: "/images/brand/segments/families.webp",
  nomads: "/images/brand/segments/nomads.webp",
  private: "/images/brand/segments/private.webp",
  adventure: "/images/brand/segments/adventure.webp",
  culture: "/images/brand/segments/culture.webp",
};

/** Background photo of the "Plan your private Andes tour" card in the FAQ section. */
export const FAQ_PLAN_IMAGE = "/images/brand/faq-plan.webp";

/**
 * Review/booking platform logos — brand chrome, not business data, so they live
 * here like `FOOTER_TRUST_GALLERY`. CDN-relative, resolved by `resolveMediaUrl`.
 *
 * Drop any raster (png/jpg/heic/webp, any size) at `r2-cache/<key minus .webp>.*`:
 * the optimizer's `logo` role trims, fits without cropping, re-pads in the
 * logo's own background colour and writes lossless WebP. Render on a light
 * surface, since sources often carry a white background.
 */
export const REVIEW_PLATFORM_LOGOS = {
  google: "/images/brand/platforms/google.webp",
  airbnb: "/images/brand/platforms/airbnb.webp",
  getyourguide: "/images/brand/platforms/getyourguide.webp",
} as const satisfies Record<ReviewPlatformId, string>;
