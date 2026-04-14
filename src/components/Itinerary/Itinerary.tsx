'use client';

import { memo, useState, type ReactNode } from 'react';
import { Award, BookOpen, ChevronDown, Coffee, Gem, Hotel, Images, Mountain, Search, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ExperienceData, ItineraryDayStopContent } from '@/lib/schemas';
import { useThemeContext } from '@/contexts/ThemeContext';
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
  Search,
};

interface StopCardProps {
  stop: ItineraryDayStopContent;
  cardVariant: 'light' | 'dark';
  cardClass: string;
}

function StopCard({ stop, cardVariant, cardClass }: StopCardProps) {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const CategoryIcon = stop.categoryIcon ? (ICON_MAP[stop.categoryIcon] ?? null) : null;
  const hasGallery = stop.images && stop.images.length > 0;

  return (
    <>
      <GlassCard
        variant={cardVariant}
        hoverEffect
        className={`${cardClass} group overflow-hidden transition-all duration-200`}
      >
        {/* Header — always visible, click to toggle */}
        <button
          type="button"
          className="flex w-full items-center gap-3 px-5 py-4 text-left"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          <span className="shrink-0 rounded-full bg-[#00F08F] px-2.5 py-1 text-[10px] font-bold text-black">
            {stop.time}
          </span>

          {CategoryIcon ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CategoryIcon className="h-4 w-4" />
            </span>
          ) : null}

          <div className="min-w-0 flex-1">
            <h4 className="text-base font-semibold leading-snug text-base-content">{stop.title}</h4>
            {stop.shortDescription && !isExpanded ? (
              <p className="mt-0.5 truncate text-xs text-base-content/55">{stop.shortDescription}</p>
            ) : null}
          </div>

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-base-content/40 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {/* Expandable body — CSS grid trick for smooth height animation */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-base-200/30">
              {stop.imageUrl ? (
                <div className="flex flex-col md:grid md:grid-cols-[1.2fr_1fr]">
                  <div className="p-5 md:p-6">
                    {stop.description ? (
                      <p className="text-sm font-medium text-base-content/70">{stop.description}</p>
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
                        className="btn btn-sm mt-4 gap-1.5 border-0 bg-[#00F08F] font-extrabold text-slate-950 shadow-[0_0_20px_rgba(0,240,143,0.28)] transition-all duration-200 hover:bg-[#00D47E] active:scale-[0.98]"
                        onClick={(e) => { e.stopPropagation(); setIsGalleryOpen(true); }}
                      >
                        <Images className="h-3.5 w-3.5" />
                        {t('experiences.ui.experienceDetails.viewGalleryLabel')}
                      </button>
                    ) : null}
                  </div>

                  <div className="aspect-[4/3] overflow-hidden md:aspect-auto md:h-full md:min-h-[200px]">
                    <img
                      src={stop.imageUrl}
                      alt={stop.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 md:rounded-r-2xl"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-5 md:p-6">
                  {stop.description ? (
                    <p className="text-sm font-medium text-base-content/70">{stop.description}</p>
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
                      className="btn btn-sm mt-4 gap-1.5 border-0 bg-[#00F08F] font-extrabold text-slate-950 shadow-[0_0_20px_rgba(0,240,143,0.28)] transition-all duration-200 hover:bg-[#00D47E] active:scale-[0.98]"
                      onClick={() => setIsGalleryOpen(true)}
                    >
                      <Images className="h-3.5 w-3.5" />
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
  const { theme } = useThemeContext();

  // Derive itinerary from selected tier, fallback to top-level itineraryContent
  const selectedTierContent = selectedTierId
    ? experienceData.accommodationTiersContent?.tiers.find((t) => t.id === selectedTierId)
    : null;
  const itineraryContent = selectedTierContent?.itinerary
    ? { sectionTitle: experienceData.itineraryContent?.sectionTitle ?? '', days: selectedTierContent.itinerary }
    : experienceData.itineraryContent;

  const cardClass =
    theme === 'light'
      ? 'rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]'
      : 'rounded-2xl shadow-sm';
  const cardVariant = theme === 'light' ? 'light' : 'dark';

  if (!itineraryContent?.days || itineraryContent.days.length === 0) return null;

  const allStops = itineraryContent.days.flatMap((day) => day.stops);
  let globalIndex = 0;

  return (
    <SectionContainer sectionClassName={`relative px-4 py-12 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}>
      <div className="relative">
        <h2 className="mb-8 text-3xl font-bold leading-tight text-base-content md:text-5xl lg:text-6xl">
          {itineraryContent.sectionTitle}
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: timeline */}
          <div className="w-full">
            <div className="relative ml-0 md:ml-12">
              <div className="space-y-6">
                {itineraryContent.days.map((day) => (
                  <div key={day.day}>
                    <h3 className="mb-4 ml-8 text-lg font-bold text-primary min-[380px]:ml-10 md:ml-16">
                      {day.label}
                    </h3>

                    <div className="space-y-4">
                      {day.stops.map((stop) => {
                        const isLast = globalIndex === allStops.length - 1;
                        globalIndex++;
                        return (
                          <div key={`${day.day}-${stop.time}`} className="relative ml-8 min-[380px]:ml-10 md:ml-16">
                            {/* Timeline dot */}
                            <div
                              aria-hidden="true"
                              className="absolute -left-[calc(2rem+6px)] top-5 h-3 w-3 rounded-full bg-[#00FF9D] ring-2 ring-base-100 min-[380px]:-left-[calc(2.5rem+6px)] md:-left-[calc(4rem+6px)]"
                            />

                            {/* Vertical line below dot */}
                            {!isLast && (
                              <div
                                aria-hidden="true"
                                className="absolute -left-[calc(2rem+1px)] top-[calc(1.25rem+6px)] w-[2px] bg-[#00FF9D]/30 min-[380px]:-left-[calc(2.5rem+1px)] md:-left-[calc(4rem+1px)]"
                                style={{ height: 'calc(100% + 1rem)' }}
                              />
                            )}

                            <StopCard
                              stop={stop}
                              cardVariant={cardVariant}
                              cardClass={cardClass}
                            />
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

