'use client';

import { useState } from 'react';
import { Award, BookOpen, ChevronDown, Coffee, Gem, Hotel, Images, Mountain, Route, Search, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal/Modal';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { GalleryModal } from '@/components/ui/GalleryModal/GalleryModal';
import { useReservationTier, useReservationAccommodationTiers } from '@/hooks/experiences/useReservationContext';
import type { ExperienceData, ItineraryDayContent, ItineraryDayStopContent } from '@/lib/schemas';

const ICON_MAP: Record<string, LucideIcon> = {
  Award, BookOpen, Coffee, Gem, Hotel, Mountain, Route, Search,
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

        <div
          className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-base-content/10">
              {stop.imageUrl ? (
                <div className="flex flex-col">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={stop.imageUrl}
                      alt={stop.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
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

interface ItineraryModalProps {
  open: boolean;
  onClose: () => void;
  experienceData: ExperienceData;
}

export function ItineraryModal({ open, onClose, experienceData }: ItineraryModalProps) {
  const t = useTranslations();
  const { selectedTierId } = useReservationTier();
  const tiersContent = useReservationAccommodationTiers();

  const selectedTierContent = selectedTierId
    ? tiersContent?.tiers.find((tier) => tier.id === selectedTierId)
    : null;

  const days: ItineraryDayContent[] = selectedTierContent?.itinerary
    ?? experienceData.itineraryContent?.days
    ?? [];

  const sectionTitle = experienceData.itineraryContent?.sectionTitle
    ?? t('experiences.ui.experienceDetails.itineraryTitle');

  const allStops = days.flatMap((day) => day.stops);
  let globalIndex = 0;

  return (
    <Modal
      open={open}
      title={sectionTitle}
      closeLabel={t('experiences.ui.closeModal')}
      onClose={onClose}
      contentClassName="w-full max-w-3xl sm:rounded-2xl bg-base-100 text-base-content shadow-2xl"
    >
      <div>
        {days.length === 0 ? (
          <p className="py-6 text-center text-sm text-base-content/70">
            {t('experiences.ui.viewFullDetails')}
          </p>
        ) : (
          <div className="space-y-10 pb-4">
            {days.map((day) => (
              <div key={day.day}>
                <h3 className="mb-4 text-base font-bold text-primary">
                  {day.label}
                </h3>
                <div className="relative ml-6">
                  <div className="space-y-3">
                    {day.stops.map((stop) => {
                      const isLast = globalIndex === allStops.length - 1;
                      globalIndex++;
                      return (
                        <div key={`${day.day}-${stop.time}`} className="relative">
                          {/* Timeline dot */}
                          <div
                            aria-hidden="true"
                            className="absolute -left-[calc(1.5rem+5px)] top-4 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-base-100"
                          />
                          {/* Vertical line below dot */}
                          {!isLast && (
                            <div
                              aria-hidden="true"
                              className="absolute -left-[calc(1.5rem+1px)] top-[calc(1rem+5px)] w-[2px] bg-primary/30"
                              style={{ height: 'calc(100% + 0.75rem)' }}
                            />
                          )}
                          <StopCard stop={stop} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
