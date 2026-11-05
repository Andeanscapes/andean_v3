'use client';

import { useMemo, useState } from 'react';
import { Bath, Hotel, MapPin, Users, Wifi, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AccommodationTierContent } from '@/lib/schemas';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { GalleryModal } from '@/components/ui/GalleryModal/GalleryModal';

interface StayCardProps {
  tier: AccommodationTierContent;
  locationLabel?: string;
  isSelected?: boolean;
  onSelect?: (tierId: string) => void;
}

export function StayCard({ tier, locationLabel, isSelected = false, onSelect }: StayCardProps) {
  const t = useTranslations();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const galleryImages = useMemo(() => {
    const unique = Array.from(new Set([tier.images.main, ...tier.images.gallery]));
    if (unique.length >= 4) return unique;

    return [...unique, ...Array.from({ length: 4 - unique.length }, () => tier.images.main)];
  }, [tier.images.gallery, tier.images.main]);

  const maxCapacity = Math.max(...tier.rooms.map((room) => room.capacity));
  const { hasPrivateBathroom, hasWifi } = tier.quickSpecs;

  return (
    <>
      <GlassCard
        variant="auto"
        hoverEffect
        className={`cursor-pointer overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={() => onSelect?.(tier.id)}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(tier.id); } }}
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet={getResponsiveImageSrc(tier.images.main).mobile}
            />
            <img
              src={tier.images.main}
              alt={tier.tierLabel}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </picture>

          {tier.isHostChoice ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-900">
              {t('experiences.ui.experienceDetails.hostChoiceLabel')}
            </span>
          ) : null}

          {isSelected ? (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-content">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
              </svg>
              {t('experiences.ui.experienceDetails.selectedLabel')}
            </span>
          ) : null}
        </div>

        <div className="space-y-3 p-4 md:space-y-4 md:p-5">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/50 md:h-14 md:w-14">
                  <img
                    src={tier.images.main}
                    alt={tier.tierLabel}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-base-100 bg-primary text-primary-content md:h-7 md:w-7">
                  <Hotel className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
                </span>
              </div>
              <p className="text-xs font-medium text-base-content/70">
                {tier.tierTag}
              </p>
            </div>
            <h3 className="text-md font-bold leading-tight text-base-content md:text-lg">{tier.tierLabel}</h3>
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-base-content/80 md:mt-2 md:line-clamp-none">{tier.tierDescription}</p>
          </div>

          {locationLabel ? (
            <p className="inline-flex items-center gap-2 text-sm text-base-content/70">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>
                {t('experiences.ui.experienceDetails.locationLabel')}: {locationLabel}
              </span>
            </p>
          ) : null}

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-base-content/10 bg-base-200/40 p-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 text-base-content/80">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('experiences.ui.experienceDetails.maxCapacityLabel', { count: maxCapacity })}
            </span>
            <span className="inline-flex items-center gap-1.5 text-base-content/80">
              <Bath className="h-4 w-4 text-primary" aria-hidden="true" />
              {hasPrivateBathroom
                ? t('experiences.ui.experienceDetails.privateBathroomYes')
                : t('experiences.ui.experienceDetails.privateBathroomNo')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-base-content/80">
              {hasWifi ? (
                <Wifi className="h-4 w-4 text-primary" aria-hidden="true" />
              ) : (
                <WifiOff className="h-4 w-4 text-base-content/70" aria-hidden="true" />
              )}
              {hasWifi
                ? t('experiences.ui.experienceDetails.wifiYes')
                : t('experiences.ui.experienceDetails.wifiNo')}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-outline h-11 min-h-11 w-full border-base-content/20 font-semibold text-base-content hover:border-primary hover:bg-primary/10"
            onClick={() => setIsGalleryOpen(true)}
          >
            {t('experiences.ui.experienceDetails.viewGalleryLabel')}
          </button>
        </div>
      </GlassCard>

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={galleryImages}
        title={locationLabel ? `${tier.tierLabel} · ${locationLabel}` : tier.tierLabel}
        subtitle={t('experiences.ui.experienceDetails.gallerySubtitle')}
      />
    </>
  );
}
