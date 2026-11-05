'use client';

import { memo, useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import type { LandingSafetyContent, LandingSafetyGroupContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { getLandingIcon } from '@/utils/landingIconMap';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

interface Props {
  safety: LandingSafetyContent;
  className?: string;
}

function SafetyGroupCard({ group }: { group: LandingSafetyGroupContent }) {
  if (group.items.length === 0) return null;

  // The financial card is the tall bento anchor on md+ with more prominent copy.
  const isFinancial = group.id === 'financial';
  const titleId = `landing-safety-group-${group.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className={`flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-card md:p-6 dark:border-base-content/10 dark:bg-base-100 dark:shadow-none ${isFinancial ? 'md:row-span-2' : ''}`.trim()}
    >
      <h3
        id={titleId}
        className="text-xs font-bold uppercase tracking-widest text-base-content/80"
      >
        {group.title}
      </h3>
      <ul role="list" className="mt-4 flex flex-col gap-4">
        {group.items.map((item) => {
          const Icon = getLandingIcon(item.iconName);
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary md:h-10 md:w-10">
                <Icon className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              </span>
              <span
                className={`self-center text-pretty text-base-content ${isFinancial ? 'text-sm font-medium leading-snug md:text-xl md:font-semibold md:leading-normal' : 'text-sm font-medium leading-snug md:text-base'}`}
              >
                {item.title}
              </span>
            </li>
          );
        })}
      </ul>
      {group.cta ? (
        <a
          href={group.cta.href}
          target="_blank"
          rel="noopener noreferrer"
          data-event="safety_whatsapp_click"
          className="mt-5 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-content transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
        >
          {group.cta.label}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{group.cta.opensInNewTab}</span>
        </a>
      ) : null}
    </article>
  );
}

/**
 * Brand "safety & guarantees" section.
 * Bento grid grouping reassurance items by objection type (financial, operational, assistance).
 * Optional "View Safety & Logistics Protocol" link reinforces system-provider positioning.
 */
function LandingSafetyComponent({ safety, className = '' }: Props) {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const comingSoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
  }, []);

  if (safety.groups.every((group) => group.items.length === 0)) return null;

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
      sectionClassName={`bg-base-100 py-6 sm:py-10 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mb-8 max-w-3xl md:mb-10">
        <h2
          id="landing-safety-title"
          className="text-balance text-md font-bold sm:text-2md tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {safety.sectionTitle}
        </h2>
        <p className="mt-3 text-pretty text-base text-base-content/75 md:text-lg">
          {safety.lead}
        </p>
      </header>

      <div
        role="group"
        aria-labelledby="landing-safety-title"
        className="grid grid-cols-1 gap-3 rounded-3xl border border-base-content/10 bg-base-200/40 p-3 md:grid-cols-2 md:gap-4 md:p-4">
        {safety.groups.map((group) => (
          <SafetyGroupCard key={group.id} group={group} />
        ))}
      </div>

      {safety.protocolLinkLabel && safety.protocolHref ? (
        <div className="mt-8 max-w-3xl">
          <Link
            href={safety.protocolHref}
            onClick={handleProtocolClick}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/80 underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

