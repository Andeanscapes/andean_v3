'use client'

import {memo} from 'react';
import {useThemeContext} from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const {theme, toggleTheme} = useThemeContext();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 text-white hover:text-primary-1"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};

export default memo(ThemeToggle);
