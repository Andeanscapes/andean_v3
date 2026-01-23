'use client'

import {useEffect, useMemo, useRef, useState, useTransition} from 'react';
import type {Locale} from '@/i18n/routing';
import {routing} from '@/i18n/routing';
import {languages} from '@/i18n/languages';
import type {HeaderVariant} from '@/types/ui';
import {useLocale} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';
import Link from 'next/link';

type LanguageSelectorProps = {
  variant?: HeaderVariant;
  isSticky?: boolean;
};

const LanguageSelector = ({variant = 'default', isSticky = false}: LanguageSelectorProps) => {
  const currentLocale = (useLocale() as Locale) || routing.defaultLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentLanguage = languages.find((l) => l.code === currentLocale);

  const isDarkTheme = variant === 'black' || variant === 'transparent' || variant === 'transparent-V2';

  const getTextColor = () => (isDarkTheme ? 'text-white' : 'text-dark-1');

  const getHoverColor = () => (isDarkTheme ? 'hover:text-yellow-400' : 'hover:text-primary-1');

  const isDarkDropdown = () => isDarkTheme;

  const getDropdownBg = () => {
    if (isDarkDropdown()) return 'bg-dark-1/95 border border-white/10';
    return 'bg-white border border-stock-1';
  };

  const getDropdownTextColor = () => (isDarkDropdown() ? 'text-white/90 hover:text-white' : 'text-dark-1 hover:text-primary-1');

  const stripLeadingLocale = (path: string) => {
    const withSlashPrefixes = routing.locales.map((l) => `/${l}/`);
    for (const pref of withSlashPrefixes) {
      if (path.startsWith(pref)) return `/${path.slice(pref.length)}`;
    }
    for (const l of routing.locales) {
      if (path === `/${l}`) return '/';
    }
    return path;
  };

  const buildHref = (target: Locale) => {
    const path = pathname || '/';
    const rest = stripLeadingLocale(path);
    const needsPrefix = target !== routing.defaultLocale;
    return needsPrefix ? `/${target}${rest === '/' ? '' : rest}` : rest;
  };

  const linkMap = useMemo(() => {
    const map = {} as Record<Locale, string>;
    languages.forEach((l) => {
      map[l.code] = buildHref(l.code);
    });
    return map;
  }, [pathname, variant, isSticky, currentLocale]);

  useEffect(() => {
    const hrefs = Object.values(linkMap);
    hrefs.forEach((href) => {
      try {
        router.prefetch(href as any);
      } catch {}
    });
  }, [router, linkMap]);

  const setLocaleCookie = (code: Locale) => {
    try {
      document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  };

  const onSelect = (code: Locale) => {
    if (code === currentLocale) {
      setIsOpen(false);
      return;
    }
    
    setLocaleCookie(code);
    setIsOpen(false);
    
    const targetHref = buildHref(code);
    startTransition(() => {
      router.push(targetHref);
      router.refresh();
    });
  };

  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      setIsOpen(false);
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${getTextColor()} ${getHoverColor()}`}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="text-xs font-medium uppercase tracking-wide hidden sm:inline">{currentLanguage?.code}</span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-50 overflow-hidden ${getDropdownBg()} backdrop-blur-sm`} role="menu" aria-orientation="vertical">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              disabled={isPending || currentLocale === lang.code}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${isPending ? 'opacity-50 cursor-wait' : ''} ${
                currentLocale === lang.code
                  ? isDarkDropdown()
                    ? 'bg-primary-1 text-white'
                    : 'bg-primary-1/10 text-primary-1'
                  : `${getDropdownTextColor()} ${isDarkDropdown() ? 'hover:bg-white/10' : 'hover:bg-dark-1/5'}`
              }`}
              role="menuitem"
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.label}</span>
              {currentLocale === lang.code && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default LanguageSelector;

