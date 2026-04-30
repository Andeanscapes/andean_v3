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
      className={`flex flex-wrap gap-2 ${className}`.trim()}
    >
      {trustChips.map((chip) => {
        const Icon = getLandingIcon(chip.iconName);
        return (
          <li
            key={chip.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm md:text-sm"
          >
            {Icon ? <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" /> : null}
            <span>{chip.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
