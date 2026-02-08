/**
 * Mock implementations for Next.js and next-intl hooks for Storybook
 * 
 * These mocks allow components that use Next.js specific hooks to work in Storybook
 * without requiring the full Next.js runtime environment.
 */

import React from 'react';

// Re-export all mocks from decorators
export { 
  useMockThemeContext as useThemeContext,
  useMockLanguageContext as useLanguageContext, 
  useMockLayoutContext as useLayoutContext,
  useMockTranslations as useTranslations,
  mockRouter
} from './decorators';

// Mock usePathname
export function usePathname() {
  return '/en';
}

// Mock useRouter
export function useRouter() {
  return {
    push: (href: string) => void href,
    replace: (href: string) => void href,
    refresh: () => void 0,
    prefetch: (href: string) => void href,
    back: () => void 0,
    forward: () => void 0,
  };
}

// Mock useLocale
export function useLocale() {
  return 'en';
}

// Mock Next.js Image component for Storybook
function MockImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority,
  style
}: {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}) {
  return React.createElement('img', {
    src,
    alt,
    width,
    height,
    className,
    style,
    loading: priority ? 'eager' : 'lazy'
  });
}

export default MockImage;
export { MockImage as Image };

// Mock Next.js Link component for Storybook
function MockLink({ 
  href, 
  children, 
  className
}: { 
  href: string; 
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}) {
  return React.createElement('a', {
    href,
    className,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
    }
  }, children);
}

export { MockLink as Link };
