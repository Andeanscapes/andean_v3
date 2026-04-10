'use client';

import { lazy, Suspense } from 'react';

const OptimizedBackgroundImage = lazy(() => import('@/components/media/OptimizedBackgroundImage'));

interface BackgroundImageWithFallbackProps {
  src: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  fallbackClassName?: string;
}

export default function BackgroundImageWithFallback({
  src,
  className = 'absolute inset-0 h-full w-full object-cover',
  loading = 'lazy',
  fetchPriority = 'auto',
  fallbackClassName = 'absolute inset-0 animate-pulse bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/85',
}: BackgroundImageWithFallbackProps) {
  return (
    <Suspense fallback={<div aria-hidden="true" className={fallbackClassName} />}>
      <OptimizedBackgroundImage
        src={src}
        className={className}
        loading={loading}
        fetchPriority={fetchPriority}
      />
    </Suspense>
  );
}
