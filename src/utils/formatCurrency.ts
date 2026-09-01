/**
 * Currency formatting helpers.
 *
 * Single source for money formatting so every surface (list cards, widget,
 * transport options, price summary, optional extras) renders the same string
 * for the same amount and currency.
 */

/** Maps an app locale (`en` | `es` | `fr`) to the ICU locale used for formatting. */
const ICU_LOCALE_BY_APP_LOCALE: Record<string, string> = {
  en: 'en-US',
  es: 'es-CO',
  fr: 'fr-FR',
};

const DEFAULT_ICU_LOCALE = 'es-CO';

export function toIcuLocale(locale: string): string {
  return ICU_LOCALE_BY_APP_LOCALE[locale] ?? DEFAULT_ICU_LOCALE;
}

/**
 * Format an amount as Colombian pesos, without decimals.
 *
 * @param value  Amount in COP.
 * @param locale App locale (`en` | `es` | `fr`). Unknown values fall back to `es-CO`.
 */
/**
 * Format an amount in the currency the feed published for it.
 *
 * `currency` is required on purpose: a default would silently render one
 * currency's amount with another's symbol the moment the feed publishes a
 * second currency.
 *
 * @param value    Amount, in the currency's major unit.
 * @param locale   App locale (`en` | `es` | `fr`). Unknown values fall back to `es-CO`.
 * @param currency ISO 4217 code from the feed (`pricing.currency` / `fromPrice.currency`).
 */
/**
 * Formatters are cached per locale+currency. `Intl.NumberFormat` construction is
 * far more expensive than `format()`, and the catalog renders one call per card.
 * The key space is bounded by (3 locales x published currencies).
 */
const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, currency: string): Intl.NumberFormat {
  const icuLocale = toIcuLocale(locale);
  const key = `${icuLocale}|${currency}`;
  let formatter = formatterCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(icuLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    formatterCache.set(key, formatter);
  }

  return formatter;
}

export function formatMoney(value: number, locale: string, currency: string): string {
  return getFormatter(locale, currency).format(value);
}

