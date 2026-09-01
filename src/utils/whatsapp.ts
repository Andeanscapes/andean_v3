/**
 * WhatsApp deep links.
 *
 * The v1 feed shipped a fully-formed URL with a single Spanish prefill for every
 * locale. v2 drops it: a contact channel and a localized message are frontend
 * concerns, so the number comes from `SiteConfig` and the copy from the message
 * bundles.
 *
 * Callers pass an already-translated message — this module stays `t`-free so it
 * is usable from server services and client components alike.
 */

import { CONTACT_INFO } from '@/constant/SiteConfig';

/**
 * `wa.me` link, optionally prefilled.
 *
 * The message is percent-encoded, so caller-supplied copy cannot break out of
 * the query string.
 */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT_INFO.phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
