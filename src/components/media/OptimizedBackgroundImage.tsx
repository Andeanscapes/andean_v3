'use client';

import { memo, useState } from 'react';

type OptimizedBackgroundImageProps = {
  src: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  placeholderClassName?: string;
};

function OptimizedBackgroundImage({
  src,
  className = 'absolute inset-0 h-full w-full object-cover',
  loading = 'lazy',
  fetchPriority = 'auto',
  placeholderClassName = 'absolute inset-0 animate-pulse bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70',
}: OptimizedBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded ? <div aria-hidden="true" className={placeholderClassName} /> : null}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        onLoad={() => setIsLoaded(true)}
        className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`.trim()}
      />
    </>
  );
}

export default memo(OptimizedBackgroundImage);
