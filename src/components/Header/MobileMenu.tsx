'use client'

import Link from 'next/link';
import {memo, useState, useCallback, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {MenuIcon, CloseIcon} from '@/components/ui/icons';
import {useThemeContext} from '@/contexts/ThemeContext';
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';

const MobileMenu = () => {
  const persistOpenKey = 'mobile-menu-open';
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      const stored = sessionStorage.getItem(persistOpenKey);
      return stored === 'true';
    } catch {
      return false;
    }
  });
  const {theme} = useThemeContext();
  const t = useTranslations('navigation');

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    try {
      sessionStorage.removeItem(persistOpenKey);
    } catch {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    
    // Solo eliminar sessionStorage cuando el menú se CIERRA
    if (!isOpen) {
      try {
        sessionStorage.removeItem(persistOpenKey);
      } catch {
        // Ignore errors
      }
    }
  }, [isOpen]);


  const getTextColor = () => {
    // Siempre basarse en el tema actual:
    // Light theme = texto oscuro, Dark theme = texto blanco
    return theme === 'dark' ? 'text-white' : 'text-gray-900';
  };

  const navItems = [
    { href: '/experiences', label: t('experiences') },
    { href: '/reviews', label: t('reviews') },
    { href: '/help', label: t('help') },
  ];

  return (
    <div className="xl:hidden">
      <button
        onClick={toggleMenu}
        className={`btn btn-ghost btn-circle transition-all duration-200 hover:bg-primary-1/10 focus-visible:outline-primary-1 focus-visible:outline-2 focus-visible:outline-offset-2 ${getTextColor()}`}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        {isOpen ? (
          <CloseIcon className="w-6 h-6" aria-hidden={true} />
        ) : (
          <MenuIcon className="w-6 h-6" aria-hidden={true} />
        )}
        <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
      </button>

      {/* Mobile menu drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Menu content */}
          <div
            id="mobile-navigation"
            className={`fixed top-0 right-0 h-full w-64 z-50 overflow-visible transform transition-transform duration-300 ease-in-out ${
              theme === 'dark' ? 'bg-dark-1' : 'bg-white'
            } shadow-2xl xl:hidden`}
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-stock-1">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-dark-1'}`}>
                  Menu
                </h2>
                <button
                  onClick={closeMenu}
                  className={`btn btn-ghost btn-sm btn-circle ${theme === 'dark' ? 'text-white' : 'text-dark-1'}`}
                  aria-label="Close menu"
                >
                  <CloseIcon className="w-5 h-5" aria-hidden={true} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-4" role="navigation" aria-label="Mobile navigation">
                <ul className="menu menu-lg w-full">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={`text-base font-medium transition-colors duration-200 ${
                          theme === 'dark' ? 'text-white hover:text-primary-1' : 'text-dark-1 hover:text-primary-1'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Book button in mobile */}
                <div className="px-4 mt-6">
                  <Link
                    href="/booking"
                    onClick={closeMenu}
                    className="btn btn-primary w-full"
                  >
                    {t('book')}
                  </Link>
                </div>
              </nav>

              {/* Settings */}
              <div className={`p-4 border-t relative z-[60] overflow-visible ${theme === 'dark' ? 'border-white/10' : 'border-stock-1'}`}>
                <div className="flex items-center justify-around gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-dark-1/70'}`}>Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-dark-1/70'}`}>Language</span>
                    <LanguageSelector placement="up" persistMenuOpenKey={persistOpenKey} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(MobileMenu);
