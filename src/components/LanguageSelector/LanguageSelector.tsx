'use client'

import {useEffect, useRef, useState, useTransition, useCallback, memo} from 'react';
import type {Locale} from '@/i18n/routing';
import {usePathname, useRouter} from '@/i18n/navigation';
import {useLayoutContext} from '@/contexts/LayoutContext';
import {useLanguageContext} from '@/contexts/LanguageContext';
import {useThemeContext} from '@/contexts/ThemeContext';
import {Check, ChevronDown, Languages} from 'lucide-react';

const LanguageSelector = ({ colorOverride }: { colorOverride?: string } = {}) => {
  const {currentLocale, availableLanguages} = useLanguageContext();
  const pathname = usePathname();
  const router = useRouter();
  const {variant, isSticky} = useLayoutContext();
  const {theme} = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentLanguage = availableLanguages.find((l) => l.code === currentLocale);
  const currentLanguageCode = currentLanguage?.code ?? currentLocale;

  const isDarkTheme = variant === 'black' || variant === 'transparent' || variant === 'transparent-V2';

  const getTextColor = useCallback(() => {
    if (colorOverride) return colorOverride;
    // If sticky in light mode, use dark text
    if (isSticky && theme === 'light') return 'text-gray-900';
    // Otherwise use variant-based color
    return isDarkTheme ? 'text-white' : 'text-gray-900';
  }, [colorOverride, isSticky, theme, isDarkTheme]);

  const getHoverColor = useCallback(() => 'hover:text-primary-1', []);

  const getDropdownBg = useCallback(() => {
    if (theme === 'dark') return 'bg-dark-1/95 border border-white/10';
    return 'bg-white border border-stock-1';
  }, [theme]);

  const getDropdownTextColor = useCallback(() => 
    (theme === 'dark' ? 'text-white hover:text-white' : 'text-dark-1 hover:text-primary-1')
  , [theme]);

  const onSelect = useCallback((code: Locale) => {
    if (code === currentLocale) {
      setIsOpen(false);
      return;
    }
    
    setIsOpen(false);
    
    startTransition(() => {
      router.push(pathname || '/', {locale: code});
      router.refresh();
    });
  }, [currentLocale, pathname, startTransition, router]);

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
        aria-label={`Select language ${currentLanguageCode}`}
        aria-expanded={isOpen}
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
        <span className={`text-xs font-medium uppercase tracking-wide hidden sm:inline ${getTextColor()} ${getHoverColor()}`}>{currentLanguageCode}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${getTextColor()} ${getHoverColor()}`} aria-hidden="true" />
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
                  : `${getDropdownTextColor()} ${theme === 'dark' ? 'hover:bg-white/15' : 'hover:bg-dark-1/5'}`
              }`}
              role="menuitem"
            >
              <span className="text-sm font-medium">{lang.label}</span>
              {currentLocale === lang.code && (
                <Check className="h-4 w-4 ml-auto" aria-hidden="true" />
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

