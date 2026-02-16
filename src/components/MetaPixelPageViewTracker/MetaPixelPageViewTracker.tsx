'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function MetaPixelPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? '';

  useEffect(() => {
    if (typeof window.fbq !== 'function') {
      console.warn('[Meta Pixel] fbq function not available');
      return;
    }
    const fullPath = search ? `${pathname}?${search}` : pathname;
    console.log('[Meta Pixel] PageView tracked:', fullPath);
    window.fbq('track', 'PageView');
  }, [pathname, search]);

  return null;
}
