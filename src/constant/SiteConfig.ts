/**
 * Centralized configuration for Andean Scapes site
 * Contains all social media links, contact information, and other site-wide constants
 */

import type { ReviewSourceCode } from '@/lib/schemas/feed/v2';

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

export const BOOKING_LINKS = {
  airbnb:
    "https://www.airbnb.com.co/rp/heinnerz?p=recommendations&product=experience&listing_id=6782419&s=67&unique_share_id=bc818263-c312-42e1-a495-74cf6d678b58",
} as const;

export const REVIEW_LINKS = {
  airbnb: "https://www.airbnb.com.co/experiences/6782419",
} as const satisfies Record<ReviewSourceCode, string>;

export const MOBILE_MENU_CHIPS = [
  { id: 'emerald', i18nKey: 'chips.emerald', href: '/experiences' },
  { id: 'nature', i18nKey: 'chips.nature', href: '/experiences' },
  { id: 'rural', i18nKey: 'chips.rural', href: '/experiences' },
  { id: 'horseback', i18nKey: 'chips.horseback', href: '/experiences' },
] as const;

export const SITE_INFO = {
  name: "Andean Scapes",
  url: "https://www.andeanscapes.com",
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
