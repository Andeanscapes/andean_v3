'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function MetaPixelPageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocalhost) {
      return;
    }

    if (typeof window.fbq !== 'function') {
      return;
    }

    window.fbq('track', 'PageView');
  }, [pathname]);

  return null;
}
