'use client';

import { memo, useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import type { LandingSafetyContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { getLandingIcon } from '@/utils/landingIconMap';
import { ExternalLink } from 'lucide-react';

interface Props {
  safety: LandingSafetyContent;
  className?: string;
}

/**
 * Brand "safety & guarantees" section.
 * Compact icon-row card with a lead paragraph + a flat list of reassurance items.
 * Optional "View Safety & Logistics Protocol" link reinforces system-provider positioning.
 */
function LandingSafetyComponent({ safety, className = '' }: Props) {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const comingSoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
  }, []);

  if (safety.items.length === 0) return null;

  const handleProtocolClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!safety.protocolComingSoon) return;
    event.preventDefault();
    setShowComingSoon(true);
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    comingSoonTimer.current = setTimeout(() => setShowComingSoon(false), 3000);
  };

  return (
    <div id="safety-full">
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-100 py-16 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mb-8 max-w-3xl md:mb-10">
        <h2
          id="landing-safety-title"
          className="text-2xl font-bold tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {safety.sectionTitle}
        </h2>
        <p className="mt-3 text-pretty text-base text-base-content/75 md:text-lg">
          {safety.lead}
        </p>
      </header>

      <ul
        role="list"
        aria-labelledby="landing-safety-title"
        className="grid max-w-3xl grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2"
      >
        {safety.items.map((item) => {
          const Icon = getLandingIcon(item.iconName);
          return (
            <li key={item.id} className="flex items-center gap-3 py-2">
              <Icon className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              <span className="text-sm font-medium text-base-content md:text-base">
                {item.title}
              </span>
            </li>
          );
        })}
      </ul>

      {safety.protocolLinkLabel && safety.protocolHref ? (
        <div className="mt-8 max-w-3xl">
          <Link
            href={safety.protocolHref}
            onClick={handleProtocolClick}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/60 underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            {safety.protocolLinkLabel}
          </Link>
          <div role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-primary">
            {showComingSoon ? safety.protocolComingSoon : null}
          </div>
        </div>
      ) : null}
    </SectionContainer>
    </div>
  );
}

LandingSafetyComponent.displayName = 'LandingSafety';

export default memo(LandingSafetyComponent);

