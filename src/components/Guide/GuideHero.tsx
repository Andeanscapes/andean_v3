import type { ReactNode } from 'react';
import { HeroPicture } from '@/components/ui/HeroPicture/HeroPicture';

interface GuideHeroProps {
  title: string;
  lead: string;
  /** Desktop `.webp` hero; `HeroPicture` derives the mobile and AVIF variants. */
  imageUrl: string;
  /** Breadcrumb and date line, rendered above the title. */
  children?: ReactNode;
}

/**
 * Text-first hero for editorial pages. Dark overlay keeps the transparent
 * header legible, like the other public heroes. The image is decorative
 * (the H1 carries the meaning), as in every `HeroPicture` hero.
 */
export function GuideHero({ title, lead, imageUrl, children }: GuideHeroProps) {
  // No HeroPreload here: React applies preload hints from prefetched RSC payloads,
  // so the header's /guides link would download this hero on every page. The
  // <picture> is early in the HTML with fetchpriority=high, which is enough.
  return (
    <header className="relative isolate overflow-hidden bg-neutral text-white">
      <div className="absolute inset-0 -z-10">
        <HeroPicture src={imageUrl} width={1600} height={900} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      <div className="container mx-auto max-w-4xl px-4 pb-12 pt-28 md:pb-16 md:pt-36 lg:px-6">
        {children}
        <h1 className="mt-4 text-balance text-2xl font-bold leading-tight drop-shadow-md md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/90 md:text-lg">{lead}</p>
      </div>
    </header>
  );
}
