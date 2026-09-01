/**
 * Centralized configuration for Andean Scapes site
 * Contains all social media links, contact information, and other site-wide constants
 */

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

export const BOOKING_LINKS = {
  airbnb:
    "https://es-l.airbnb.com/rooms/1323950663214484960?guests=1&adults=1&s=67&unique_share_id=d46f7320-cf46-44c7-93f2-35781c413e15",
} as const;

export const MOBILE_MENU_CHIPS = [
  { id: 'emerald', i18nKey: 'chips.emerald', href: '/experiences' },
  { id: 'nature', i18nKey: 'chips.nature', href: '/experiences' },
  { id: 'rural', i18nKey: 'chips.rural', href: '/experiences' },
  { id: 'horseback', i18nKey: 'chips.horseback', href: '/experiences' },
] as const;

export const SITE_INFO = {
  name: "Andean Scapes",
  url: "https://www.andeanscapes.com",
  logo: "/assets/images/logo.png",
  logoWhite: "/assets/images/logo-white.png",
} as const;
