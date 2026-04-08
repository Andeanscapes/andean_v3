'use client';

import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { memo, useState } from 'react';

type ExperienceCardImageProps = {
  src: string;
  alt: string;
  sizes: string;
};

const shimmerBlurDataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9" preserveAspectRatio="none">
    <rect width="16" height="9" fill="#1f2937" />
    <rect width="16" height="9" fill="url(#g)" opacity="0.4" />
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
        <stop stop-color="#1f2937" offset="0%" />
        <stop stop-color="#374151" offset="50%" />
        <stop stop-color="#1f2937" offset="100%" />
      </linearGradient>
    </defs>
  </svg>`
)}`;

function ExperienceCardImage({ src, alt, sizes }: ExperienceCardImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const cdnBaseUrl =
    process.env.NEXT_PUBLIC_CDN_BASE_URL ?? 'https://cdn.andeanscapes.com';
  const normalizedCdnBaseUrl = cdnBaseUrl.replace(/\/$/, '');
  const resolvedSrc = src.startsWith('/images/')
    ? `${normalizedCdnBaseUrl}${src}`
    : src;
  
  // Derive mobile image path from desktop path
  // e.g., 'emerald-mining-card.webp' → 'emerald-mining-card-mobile.webp'
  const mobileSrc = resolvedSrc.replace(/\.webp$/, '-mobile.webp');

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl bg-base-200">
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-br from-base-200 via-base-300 to-base-200 transition-opacity duration-500 ${
          isLoaded ? 'opacity-0' : 'animate-pulse opacity-100'
        }`}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-base-content/10 bg-base-100/70 text-base-content/50 shadow-sm backdrop-blur-sm">
          <ImageIcon className="h-6 w-6" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-500 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <picture>
        <source media="(max-width: 767px)" srcSet={mobileSrc} type="image/webp" />
        <source media="(min-width: 768px)" srcSet={resolvedSrc} type="image/webp" />
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          sizes={sizes}
          loading="lazy"
          decoding="async"
          quality={75}
          placeholder="blur"
          blurDataURL={shimmerBlurDataUrl}
          onLoad={() => setIsLoaded(true)}
          className={`object-cover transition-all duration-500 ${
            isLoaded ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0'
          }`}
        />
      </picture>
    </div>
  );
}

export default memo(ExperienceCardImage);
