'use client';

import { memo, useState } from 'react';
import { getAvifSrc, getResponsiveImageSrc } from '@/utils/responsiveImage';

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
  const { mobile } = getResponsiveImageSrc(src);
  // Hero photos reused as a section background get the AVIF the hero already
  // downloaded (no second, WebP copy). `null` for everything else.
  const avifMobile = getAvifSrc(mobile);
  const avifDesktop = getAvifSrc(src);

  return (
    <>
      {!isLoaded ? <div aria-hidden="true" className={placeholderClassName} /> : null}
      <picture>
        {avifMobile ? <source type="image/avif" media="(max-width: 767px)" srcSet={avifMobile} /> : null}
        <source media="(max-width: 767px)" srcSet={mobile} />
        {avifDesktop ? <source type="image/avif" srcSet={avifDesktop} /> : null}
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
      </picture>
    </>
  );
}

export default memo(OptimizedBackgroundImage);
