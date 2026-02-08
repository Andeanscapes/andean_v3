'use client'

import {memo} from 'react';
import {useThemeContext} from '@/contexts/ThemeContext';
import {SunIcon, MoonIcon} from '@/components/ui/icons';

const ThemeToggle = () => {
  const {theme, toggleTheme} = useThemeContext();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle transition-all duration-200 hover:bg-primary-1/10 focus-visible:outline-primary-1 focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={theme === 'dark'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <SunIcon className="w-5 h-5" aria-hidden={true} />
      ) : (
        <MoonIcon className="w-5 h-5" aria-hidden={true} />
      )}
      <span className="sr-only">
        {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  );
};

export default memo(ThemeToggle);
