'use client'

import Link from 'next/link';
import {memo} from 'react';
import {useTranslations} from 'next-intl';
import {useThemeContext} from '@/contexts/ThemeContext';
import {useLayoutContext} from '@/contexts/LayoutContext';

const Navigation = () => {
  const {theme} = useThemeContext();
  const {variant, isSticky} = useLayoutContext();
  const t = useTranslations('navigation');

  const getTextColor = () => {
    // Para variantes transparentes (transparent, transparent-V2)
    if (variant === 'transparent' || variant === 'transparent-V2') {
      if (isSticky) {
        return theme === 'dark' ? 'text-white' : 'text-gray-900';
      }
      return 'text-white'; // Siempre blanco cuando no es sticky en variantes transparentes
    }
    
    // Para otras variantes, basarse en el tema
    return theme === 'dark' ? 'text-white' : 'text-gray-900';
  };

  const navItems = [
    { href: '/experiences', label: t('experiences') },
    { href: '/reviews', label: t('reviews') },
    { href: '/help', label: t('help') },
  ];

  return (
    <nav 
      className="hidden xl:flex items-center" 
      role="navigation" 
      aria-label="Main navigation"
    >
      <ul className="flex items-center gap-8">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`text-sm font-medium transition-colors duration-200 hover:text-primary-1 focus-visible:outline-primary-1 focus-visible:outline-2 focus-visible:outline-offset-4 rounded px-2 py-1 ${getTextColor()}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default memo(Navigation);
