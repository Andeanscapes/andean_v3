'use client'

import {memo} from 'react';
import {useTranslations} from 'next-intl';
import {useThemeContext} from '@/contexts/ThemeContext';
import {useLayoutContext} from '@/contexts/LayoutContext';
import {Moon, Sun} from 'lucide-react';

const ThemeToggle = ({ colorOverride }: { colorOverride?: string } = {}) => {
  const {theme, toggleTheme} = useThemeContext();
  const {variant, isSticky} = useLayoutContext();
  const t = useTranslations('Header');

  const isDarkThemeVariant =
    variant === 'black' || variant === 'transparent' || variant === 'transparent-V2';

  // CSS `dark:` (theme is on <html> before paint), not JS: the context starts as 'dark'.
  const textColorClass = colorOverride ??
    (isSticky
      ? (isDarkThemeVariant ? 'text-gray-900 dark:text-white' : 'text-gray-900')
      : (isDarkThemeVariant ? 'text-white' : 'text-gray-900'));

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${textColorClass} hover:text-primary-1`}
      aria-label={t('toggleTheme')}
      title={theme === 'dark' ? t('lightMode') : t('darkMode')}
    >
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
    </button>
  );
};

export default memo(ThemeToggle);
