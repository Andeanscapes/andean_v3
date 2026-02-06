'use client'

import {useEffect, useMemo, useRef, useState, useTransition, useCallback, memo} from 'react';
import type {Locale} from '@/i18n/routing';
import {routing} from '@/i18n/routing';
import {usePathname, useRouter} from 'next/navigation';
import {useLayoutContext} from '@/contexts/LayoutContext';
import {useLanguageContext} from '@/contexts/LanguageContext';
import {useThemeContext} from '@/contexts/ThemeContext';

const LanguageSelector = () => {
  const {currentLocale, availableLanguages} = useLanguageContext();
  const pathname = usePathname();
  const router = useRouter();
  const {variant, isSticky} = useLayoutContext();
  const {theme} = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentLanguage = availableLanguages.find((l) => l.code === currentLocale);

  const isDarkTheme = variant === 'black' || variant === 'transparent' || variant === 'transparent-V2';

  const getTextColor = useCallback(() => {
    // If sticky in light mode, use dark text
    if (isSticky && theme === 'light') return 'text-gray-900';
    // Otherwise use variant-based color
    return isDarkTheme ? 'text-white' : 'text-gray-900';
  }, [isSticky, theme, isDarkTheme]);

  const getHoverColor = useCallback(() => 'hover:text-primary-1', []);

  const getDropdownBg = useCallback(() => {
    if (theme === 'dark') return 'bg-dark-1/95 border border-white/10';
    return 'bg-white border border-stock-1';
  }, [theme]);

  const getDropdownTextColor = useCallback(() => 
    (theme === 'dark' ? 'text-white/90 hover:text-white' : 'text-dark-1 hover:text-primary-1')
  , [theme]);

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
    availableLanguages.forEach((l) => {
      map[l.code] = buildHref(l.code);
    });
    return map;
  }, [pathname, variant, isSticky, currentLocale, availableLanguages]);

  useEffect(() => {
    const hrefs = Object.values(linkMap);
    hrefs.forEach((href) => {
      try {
        router.prefetch(href as unknown as string);
      } catch {}
    });
  }, [router, linkMap]);

  const setLocaleCookie = useCallback((code: Locale) => {
    try {
      document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }, []);

  const onSelect = useCallback((code: Locale) => {
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
  }, [currentLocale, setLocaleCookie, startTransition, router]);

  const handleToggle = useCallback(() => setIsOpen(!isOpen), [isOpen]);
  const handleCloseDropdown = useCallback(() => setIsOpen(false), []);

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
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${getTextColor()} ${getHoverColor()}`}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className={`text-xs font-medium uppercase tracking-wide hidden sm:inline ${getTextColor()} ${getHoverColor()}`}>{currentLanguage?.code}</span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${getTextColor()} ${getHoverColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-50 overflow-hidden ${getDropdownBg()} backdrop-blur-sm`} role="menu" aria-orientation="vertical">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              disabled={isPending || currentLocale === lang.code}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${isPending ? 'opacity-50 cursor-wait' : ''} ${
                currentLocale === lang.code
                  ? theme === 'dark'
                    ? 'bg-primary-1 text-white'
                    : 'bg-primary-1/10 text-primary-1'
                  : `${getDropdownTextColor()} ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-dark-1/5'}`
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

      {isOpen && <div className="fixed inset-0 z-40" onClick={handleCloseDropdown} />}
    </div>
  );
};

export default memo(LanguageSelector);

