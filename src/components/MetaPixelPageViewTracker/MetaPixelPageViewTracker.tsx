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
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (process.env.NODE_ENV === 'development' && isLocalhost) {
      return;
    }

    if (typeof window.fbq !== 'function') {
      return;
    }

    window.fbq('track', 'PageView');
  }, [pathname, search]);

  return null;
}
