'use client';

import { useState } from 'react';
import { Award, BookOpen, ChevronDown, Coffee, Gem, Hotel, Images, Mountain, Search, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal/Modal';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { GalleryModal } from '@/components/ui/GalleryModal/GalleryModal';
import { useReservationTier, useReservationAccommodationTiers } from '@/hooks/experiences/useReservationContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import type { ExperienceData, ItineraryDayContent, ItineraryDayStopContent } from '@/lib/schemas';

const ICON_MAP: Record<string, LucideIcon> = {
  Award, BookOpen, Coffee, Gem, Hotel, Mountain, Search,
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
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          <span className="shrink-0 rounded-full bg-[#00F08F] px-2 py-0.5 text-[10px] font-bold text-black">
            {stop.time}
          </span>

          {CategoryIcon ? (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CategoryIcon className="h-3.5 w-3.5" />
            </span>
          ) : null}

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold leading-snug text-base-content">{stop.title}</h4>
            {stop.shortDescription && !isExpanded ? (
              <p className="mt-0.5 truncate text-xs text-base-content/55">{stop.shortDescription}</p>
            ) : null}
          </div>

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-base-content/40 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-base-200/30">
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
                  <div className="p-4">
                    {stop.description ? (
                      <p className="text-sm text-base-content/70">{stop.description}</p>
                    ) : null}

                    {stop.notes && stop.notes.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {stop.notes.map((note) => (
                          <li key={note} className="flex items-start gap-2 text-xs text-base-content/80">
                            <span className="mt-0.5 shrink-0 text-primary">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {hasGallery ? (
                      <button
                        type="button"
                        className="btn btn-sm mt-3 gap-1.5 border-0 bg-[#00F08F] font-extrabold text-slate-950 shadow-[0_0_20px_rgba(0,240,143,0.28)] transition-all duration-200 hover:bg-[#00D47E] active:scale-[0.98]"
                        onClick={(e) => { e.stopPropagation(); setIsGalleryOpen(true); }}
                      >
                        <Images className="h-3.5 w-3.5" />
                        {t('experiences.ui.experienceDetails.viewGalleryLabel')}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {stop.description ? (
                    <p className="text-sm text-base-content/70">{stop.description}</p>
                  ) : null}

                  {stop.notes && stop.notes.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {stop.notes.map((note) => (
                        <li key={note} className="flex items-start gap-2 text-xs text-base-content/80">
                          <span className="mt-0.5 shrink-0 text-primary">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {hasGallery ? (
                    <button
                      type="button"
                      className="btn btn-sm mt-3 gap-1.5 border-0 bg-[#00F08F] font-extrabold text-slate-950 shadow-[0_0_20px_rgba(0,240,143,0.28)] transition-all duration-200 hover:bg-[#00D47E] active:scale-[0.98]"
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

interface ItineraryModalProps {
  open: boolean;
  onClose: () => void;
  experienceData: ExperienceData;
}

export function ItineraryModal({ open, onClose, experienceData }: ItineraryModalProps) {
  const t = useTranslations();
  const { selectedTierId } = useReservationTier();
  const tiersContent = useReservationAccommodationTiers();
  const { theme } = useThemeContext();

  const selectedTierContent = selectedTierId
    ? tiersContent?.tiers.find((tier) => tier.id === selectedTierId)
    : null;

  const days: ItineraryDayContent[] = selectedTierContent?.itinerary
    ?? experienceData.itineraryContent?.days
    ?? [];

  const sectionTitle = experienceData.itineraryContent?.sectionTitle
    ?? t('experiences.ui.experienceDetails.itineraryTitle');

  const cardClass = theme === 'light'
    ? 'rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]'
    : 'rounded-2xl shadow-sm';
  const cardVariant = theme === 'light' ? 'light' as const : 'dark' as const;

  const allStops = days.flatMap((day) => day.stops);
  let globalIndex = 0;

  return (
    <Modal
      open={open}
      title={sectionTitle}
      closeLabel={t('experiences.ui.closeModal')}
      onClose={onClose}
      contentClassName="w-full max-w-3xl rounded-2xl bg-base-100 p-4 text-base-content shadow-2xl"
    >
      <div className="max-h-[75vh] overflow-y-auto -mx-4 px-4">
        {days.length === 0 ? (
          <p className="py-6 text-center text-sm text-base-content/60">
            {t('experiences.ui.viewFullDetails')}
          </p>
        ) : (
          <div className="space-y-6 pb-4">
            {days.map((day) => (
              <div key={day.day}>
                <h3 className="mb-3 text-base font-bold text-primary">
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
                            className="absolute -left-[calc(1.5rem+5px)] top-4 h-2.5 w-2.5 rounded-full bg-[#00FF9D] ring-2 ring-base-100"
                          />
                          {/* Vertical line below dot */}
                          {!isLast && (
                            <div
                              aria-hidden="true"
                              className="absolute -left-[calc(1.5rem+1px)] top-[calc(1rem+5px)] w-[2px] bg-[#00FF9D]/30"
                              style={{ height: 'calc(100% + 0.75rem)' }}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
