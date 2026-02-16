'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type FbqWindow = {
  fbq?: (...args: unknown[]) => void;
};

function getFbq() {
  return (globalThis as typeof globalThis & FbqWindow).fbq;
}

export default function MetaPixelPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? '';

  useEffect(() => {
    const fbq = getFbq();
    if (typeof fbq !== 'function') return;
    fbq('track', 'PageView');
  }, [pathname, search]);

  return null;
}
