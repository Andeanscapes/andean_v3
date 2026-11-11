import { afterEach, describe, expect, it } from 'vitest';
import {
  dismissSuggestion,
  getHomeRedirectLocale,
  getSavedLocale,
  isSuggestionDismissed,
  matchBrowserLocale,
  saveLocale,
} from './localePreference';

afterEach(() => window.localStorage.clear());

describe('matchBrowserLocale', () => {
  it('maps regional tags to a supported locale, in preference order', () => {
    expect(matchBrowserLocale(['es-CO', 'en'])).toBe('es');
    expect(matchBrowserLocale(['pt-PT', 'fr-FR'])).toBe('fr');
  });

  it('returns null when no language is supported', () => {
    expect(matchBrowserLocale(['pt', 'ja-JP'])).toBeNull();
  });
});

describe('stored preference', () => {
  it('round-trips a valid locale and ignores invalid values', () => {
    saveLocale('fr');
    expect(getSavedLocale()).toBe('fr');
    window.localStorage.setItem('andean.locale', 'pt');
    expect(getSavedLocale()).toBeNull();
  });

  it('remembers a dismissed suggestion', () => {
    expect(isSuggestionDismissed()).toBe(false);
    dismissSuggestion();
    expect(isSuggestionDismissed()).toBe(true);
  });
});

describe('getHomeRedirectLocale', () => {
  it('sends a returning Spanish visitor from the unprefixed home to Spanish', () => {
    expect(getHomeRedirectLocale('es', 'en', '/')).toBe('es');
  });

  it.each([
    ['no saved preference (first visit or crawler)', null, 'en', '/'],
    ['an explicit /es link', 'fr', 'es', '/'],
    ['an inner page', 'es', 'en', '/guides'],
    ['the same locale', 'en', 'en', '/'],
  ] as const)('never redirects with %s', (_label, saved, current, pathname) => {
    expect(getHomeRedirectLocale(saved, current, pathname)).toBeNull();
  });
});
