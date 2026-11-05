'use client';

import { memo, useState, type ReactNode } from 'react';
import { Award, BookOpen, ChevronDown, Coffee, Gem, Hotel, Images, Mountain, Route, Search, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ExperienceData, ItineraryDayStopContent } from '@/lib/schemas';
import { useDetailSelectedTier } from '@/hooks/experiences/useExperienceDetailContext';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { GalleryModal } from '@/components/ui/GalleryModal/GalleryModal';

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  BookOpen,
  Coffee,
  Gem,
  Hotel,
  Mountain,
  Route,
  Search,
};

interface StopCardProps {
  stop: ItineraryDayStopContent;
}

function StopCard({ stop }: StopCardProps) {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const CategoryIcon = stop.categoryIcon ? (ICON_MAP[stop.categoryIcon] ?? null) : null;
  const hasGallery = stop.images && stop.images.length > 0;

  return (
    <>
      <GlassCard variant="auto" className="overflow-hidden rounded-2xl">
        {/* Header — always visible, click to toggle */}
        <button
          type="button"
          className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:px-5 md:py-4"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-content [font-variant-numeric:tabular-nums]">
            {stop.time}
          </span>

          {CategoryIcon ? (
            <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
              <CategoryIcon className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold leading-snug text-base-content md:text-base">{stop.title}</h4>
            {stop.shortDescription && !isExpanded ? (
              <p className="mt-0.5 truncate text-xs text-base-content/70">{stop.shortDescription}</p>
            ) : null}
          </div>

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-base-content/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {/* Expandable body — CSS grid trick for smooth height animation */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-base-content/10">
              {stop.imageUrl ? (
                <div className="flex flex-col md:grid md:grid-cols-[1.2fr_1fr]">
                  <div className="p-4 md:p-6">
                    {stop.description ? (
                      <p className="text-sm text-base-content/80">{stop.description}</p>
                    ) : null}

                    {stop.notes && stop.notes.length > 0 ? (
                      <ul className="mt-3 space-y-1.5">
                        {stop.notes.map((note) => (
                          <li key={note} className="flex items-start gap-2 text-xs font-medium text-base-content/80">
                            <span className="mt-0.5 shrink-0 text-primary">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {hasGallery ? (
                      <button
                        type="button"
                        className="btn btn-outline mt-4 h-11 min-h-11 gap-1.5 border-base-content/20 font-semibold text-base-content hover:border-primary hover:bg-primary/10"
                        onClick={(e) => { e.stopPropagation(); setIsGalleryOpen(true); }}
                      >
                        <Images className="h-4 w-4" aria-hidden="true" />
                        {t('experiences.ui.experienceDetails.viewGalleryLabel')}
                      </button>
                    ) : null}
                  </div>

                  <div className="aspect-[4/3] overflow-hidden md:aspect-auto md:h-full md:min-h-[200px]">
                    <img
                      src={stop.imageUrl}
                      alt={stop.title}
                      className="h-full w-full object-cover md:rounded-r-2xl"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 md:p-6">
                  {stop.description ? (
                    <p className="text-sm text-base-content/80">{stop.description}</p>
                  ) : null}

                  {stop.notes && stop.notes.length > 0 ? (
                    <ul className="mt-3 space-y-1.5">
                      {stop.notes.map((note) => (
                        <li key={note} className="flex items-start gap-2 text-xs font-medium text-base-content/80">
                          <span className="mt-0.5 shrink-0 text-primary">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {hasGallery ? (
                    <button
                      type="button"
                      className="btn btn-outline mt-4 h-11 min-h-11 gap-1.5 border-base-content/20 font-semibold text-base-content hover:border-primary hover:bg-primary/10"
                      onClick={() => setIsGalleryOpen(true)}
                    >
                      <Images className="h-4 w-4" aria-hidden="true" />
                      {t('experiences.ui.experienceDetails.viewGalleryLabel')}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {hasGallery ? (
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          images={stop.images!}
          title={stop.title}
          subtitle={t('experiences.ui.experienceDetails.activityGallerySubtitle')}
        />
      ) : null}
    </>
  );
}

interface ItineraryProps {
  className?: string;
  experienceData: ExperienceData;
  sidebar?: ReactNode;
}

function ItineraryComponent({ className = '', experienceData, sidebar }: ItineraryProps) {
  const { selectedTierId } = useDetailSelectedTier();

  // Derive itinerary from selected tier, fallback to top-level itineraryContent
  const selectedTierContent = selectedTierId
    ? experienceData.accommodationTiersContent?.tiers.find((t) => t.id === selectedTierId)
    : null;
  const itineraryContent = selectedTierContent?.itinerary
    ? { sectionTitle: experienceData.itineraryContent?.sectionTitle ?? '', days: selectedTierContent.itinerary }
    : experienceData.itineraryContent;

  if (!itineraryContent?.days || itineraryContent.days.length === 0) return null;

  const allStops = itineraryContent.days.flatMap((day) => day.stops);
  let globalIndex = 0;

  return (
    <SectionContainer sectionClassName={`relative px-4 py-6 sm:py-10 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}>
      <div className="relative">
        <h2 className="mb-4 text-balance text-md font-bold leading-tight text-base-content sm:text-2md md:mb-8 md:text-5xl lg:text-6xl">
          {itineraryContent.sectionTitle}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: timeline */}
          <div className="w-full">
            <div className="relative ml-0 md:ml-12">
              <div className="space-y-5 md:space-y-6">
                {itineraryContent.days.map((day) => (
                  <div key={day.day}>
                    <h3 className="mb-3 ml-8 text-md font-bold text-primary min-[380px]:ml-10 md:mb-4 md:ml-16 md:text-lg">
                      {day.label}
                    </h3>

                    <div className="space-y-3 md:space-y-4">
                      {day.stops.map((stop) => {
                        const isLast = globalIndex === allStops.length - 1;
                        globalIndex++;
                        return (
                          <div key={`${day.day}-${stop.time}`} className="relative ml-8 min-[380px]:ml-10 md:ml-16">
                            {/* Timeline dot */}
                            <div
                              aria-hidden="true"
                              className="absolute -left-[calc(2rem+6px)] top-5 h-3 w-3 rounded-full bg-primary ring-2 ring-base-100 min-[380px]:-left-[calc(2.5rem+6px)] md:-left-[calc(4rem+6px)]"
                            />

                            {/* Vertical line below dot */}
                            {!isLast && (
                              <div
                                aria-hidden="true"
                                className="absolute -left-[calc(2rem+1px)] top-[calc(1.25rem+6px)] w-[2px] bg-primary/30 min-[380px]:-left-[calc(2.5rem+1px)] md:-left-[calc(4rem+1px)]"
                                style={{ height: 'calc(100% + 1rem)' }}
                              />
                            )}

                            <StopCard stop={stop} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: sticky sidebar */}
          {sidebar ? (
            <div className="h-fit w-full self-start lg:sticky lg:top-24">
              {sidebar}
            </div>
          ) : null}
        </div>
      </div>
    </SectionContainer>
  );
}

ItineraryComponent.displayName = 'Itinerary';

export default memo(ItineraryComponent);

