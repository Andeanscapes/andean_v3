import { locales, LOCALE_CONFIG, type Locale } from '@/i18n/locales';

export type Language = { code: Locale; label: string };

export const languages: Language[] = locales.map((code) => ({ code, label: LOCALE_CONFIG[code].label }));

/**
 * Copy for the language suggestion bar, written in the language it suggests: a
 * visitor offered Spanish may not read the page's current language. Kept here
 * rather than in the message bundles because the client only loads the current
 * locale's messages.
 */
export const LOCALE_SUGGESTION_COPY: Record<Locale, { question: string; accept: string; dismiss: string }> = {
  en: { question: 'Prefer to view this site in English?', accept: 'View in English', dismiss: 'No, thanks' },
  es: { question: '¿Prefieres ver este sitio en español?', accept: 'Ver en español', dismiss: 'No, gracias' },
  fr: { question: 'Préférez-vous voir ce site en français ?', accept: 'Voir en français', dismiss: 'Non, merci' },
  de: { question: 'Möchten Sie diese Seite auf Deutsch sehen?', accept: 'Auf Deutsch ansehen', dismiss: 'Nein, danke' },
  it: { question: 'Preferisci vedere questo sito in italiano?', accept: 'Vedi in italiano', dismiss: 'No, grazie' },
};
