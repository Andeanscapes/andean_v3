'use client'

import {useState, useCallback, memo} from 'react';
import {useLayoutContext} from '@/contexts/LayoutContext';
import {useThemeContext} from '@/contexts/ThemeContext';
import {GlobeIcon, USFlagIcon, ESFlagIcon, COFlagIcon, FRFlagIcon} from '@/components/ui/icons';

const flagComponents: Record<string, React.FC<{className?: string; 'aria-hidden'?: boolean}>> = {
  en: USFlagIcon,
  es: ESFlagIcon,
  local: COFlagIcon,
  fr: FRFlagIcon,
};

// Mock languages for Storybook
const mockLanguages = [
  { code: 'en' as const, label: 'English', flag: '🇺🇸' },
  { code: 'es' as const, label: 'Español', flag: '🇪🇸' },
  { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
  { code: 'local' as const, label: 'Local', flag: '🇨🇴' }
];

type LocaleType = 'en' | 'es' | 'fr' | 'local';

type DropdownPlacement = 'up' | 'down';

const LanguageSelectorSimple = ({ placement = 'down' }: { placement?: DropdownPlacement }) => {
  const {variant, isSticky} = useLayoutContext();
  const {theme} = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<LocaleType>('en');

  const currentLanguage = mockLanguages.find((l) => l.code === currentLocale);
  const FlagComponent = flagComponents[currentLocale] || GlobeIcon;

  const isDarkTheme = variant === 'black' || variant === 'transparent' || variant === 'transparent-V2';

  const getTextColor = useCallback(() => {
    if (isSticky && theme === 'light') return 'text-gray-900';
    return isDarkTheme ? 'text-white' : 'text-gray-900';
  }, [isSticky, theme, isDarkTheme]);

  const getDropdownBg = useCallback(() => {
    if (theme === 'dark') return 'bg-dark-1/95 border border-white/10';
    return 'bg-white border border-stock-1';
  }, [theme]);

  const getDropdownTextColor = useCallback(() => 
    (theme === 'dark' ? 'text-white/90 hover:text-white' : 'text-dark-1 hover:text-primary-1')
  , [theme]);

  const onSelect = useCallback((code: LocaleType) => {
    setCurrentLocale(code);
    setIsOpen(false);
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="dropdown dropdown-end relative" style={{zIndex: 9999}}>
      <button
        type="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        style={{position: 'relative', zIndex: 10000, pointerEvents: 'auto'}}
        className={`btn btn-ghost btn-circle transition-all duration-200 hover:bg-primary-1/10 focus-visible:outline-primary-1 focus-visible:outline-2 focus-visible:outline-offset-2 ${getTextColor()}`}
        aria-label={`Current language: ${currentLanguage?.label}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FlagComponent className="w-6 h-6" aria-hidden={true} />
        <span className="sr-only">{currentLanguage?.label}</span>
      </button>

      {isOpen && (
        <ul 
          tabIndex={0} 
          className={`absolute ${placement === 'up' ? 'bottom-full right-0 mb-2' : 'top-full right-0 mt-2'} menu p-2 shadow-lg rounded-box w-52 z-[9999] ${getDropdownBg()} backdrop-blur-md`}
          role="menu" 
          aria-label="Language selection"
        >
          {mockLanguages.map((lang) => {
            const LangFlag = flagComponents[lang.code] || GlobeIcon;
            return (
              <li key={lang.code} role="none">
                <button
                  onClick={() => onSelect(lang.code)}
                  className={`flex items-center gap-3 transition-colors duration-200 focus-visible:outline-primary-1 ${
                    currentLocale === lang.code
                      ? theme === 'dark'
                        ? 'bg-primary-1 text-white active'
                        : 'bg-primary-1/10 text-primary-1 active'
                      : getDropdownTextColor()
                  }`}
                  role="menuitem"
                  aria-current={currentLocale === lang.code ? 'true' : undefined}
                >
                  <LangFlag className="w-5 h-5" aria-hidden={true} />
                  <span className="text-sm font-medium">{lang.label}</span>
                  {currentLocale === lang.code && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20" aria-hidden={true}>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && <div className="fixed inset-0 z-[9998]" onClick={handleCloseDropdown} aria-hidden={true} />}
    </div>
  );
};

export default memo(LanguageSelectorSimple);
