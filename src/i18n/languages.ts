import type { Locale } from '@/i18n/routing';

export type Language = { code: Locale; label: string };

export const languages: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' }
];
