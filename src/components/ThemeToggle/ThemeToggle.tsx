'use client'

import {memo} from 'react';
import {useThemeContext} from '@/contexts/ThemeContext';
import {useLayoutContext} from '@/contexts/LayoutContext';
import {Moon, Sun} from 'lucide-react';

const ThemeToggle = ({ colorOverride }: { colorOverride?: string } = {}) => {
  const {theme, toggleTheme} = useThemeContext();
  const {variant, isSticky} = useLayoutContext();

  const isDarkThemeVariant =
    variant === 'black' || variant === 'transparent' || variant === 'transparent-V2';

  const textColorClass = colorOverride ??
    (isSticky && theme === 'light'
      ? 'text-gray-900'
      : isDarkThemeVariant
        ? 'text-white'
        : 'text-gray-900');

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${textColorClass} hover:text-primary-1`}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
};

export default memo(ThemeToggle);
