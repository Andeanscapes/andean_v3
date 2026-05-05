'use client';

import type { LandingHeroBrandContent } from '@/lib/schemas/landing.schema';
import { getLandingIcon } from '@/utils/landingIconMap';

interface Props {
  trustChips: LandingHeroBrandContent['trustChips'];
  className?: string;
}

export default function LandingHeroBrandTrustChips({ trustChips, className = '' }: Props) {
  if (trustChips.length === 0) return null;

  return (
    <ul
      role="list"
      className={`no-scrollbar -mx-4 flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 ${className}`.trim()}
    >
      {trustChips.map((chip) => {
        const Icon = getLandingIcon(chip.iconName);
        return (
          <li
            key={chip.id}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm md:text-sm"
          >
            {Icon ? <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" /> : null}
            <span>{chip.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
