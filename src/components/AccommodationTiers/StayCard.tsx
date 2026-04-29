'use client';

import { useMemo, useState } from 'react';
import { Bath, Hotel, MapPin, Users, Wifi, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AccommodationTierContent } from '@/lib/schemas';
import { useThemeContext } from '@/contexts/ThemeContext';
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
  const { theme } = useThemeContext();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const galleryImages = useMemo(() => {
    const unique = Array.from(new Set([tier.images.main, ...tier.images.gallery]));
    const filled = unique.length >= 4
      ? unique.slice(0, 4)
      : [...unique, ...Array.from({ length: 4 - unique.length }, () => tier.images.main)];

    return filled.slice(0, 4);
  }, [tier.images.gallery, tier.images.main]);

  const maxCapacity = Math.max(...tier.rooms.map((room) => room.capacity));
  const { hasPrivateBathroom, hasWifi } = tier.quickSpecs;

  return (
    <>
      <GlassCard
        variant={theme === 'light' ? 'light' : 'dark'}
        hoverEffect
        className={`group overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-[#00F08F] shadow-[0_0_20px_rgba(0,240,143,0.15)]' : ''}`}
        onClick={() => onSelect?.(tier.id)}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(tier.id); } }}
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
          <img
            src={tier.images.main}
            alt={tier.tierLabel}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />

          {tier.isHostChoice ? (
            <span className="absolute left-3 top-3 rounded-sm bg-[#00F08F] px-2.5 py-1 text-[9px] font-bold tracking-widest text-black shadow-[0_0_10px_rgba(0,240,143,0.4)] md:px-3 md:text-[10px]">
              {t('experiences.ui.experienceDetails.hostChoiceLabel')}
            </span>
          ) : null}

          {isSelected ? (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-sm bg-[#00F08F] px-2.5 py-1 text-[9px] font-bold tracking-widest text-black shadow-[0_0_10px_rgba(0,240,143,0.4)] md:px-3 md:text-[10px]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5 md:h-3 md:w-3">
                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
              </svg>
              {t('experiences.ui.experienceDetails.selectedLabel')}
            </span>
          ) : null}
        </div>

        <div className="space-y-4 p-4 md:p-5">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#00F08F]/60 md:h-14 md:w-14">
                  <img
                    src={tier.images.main}
                    alt={tier.tierLabel}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-900/20 bg-[#00F08F] text-slate-950 md:h-7 md:w-7">
                  <Hotel className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-base-content/65">
                {tier.tierTag}
              </p>
            </div>
            <h3 className="text-2xl font-bold leading-tight text-base-content">{tier.tierLabel}</h3>
            <p className="mt-2 text-sm leading-relaxed text-base-content/75">{tier.tierDescription}</p>
          </div>

          {locationLabel ? (
            <p className="inline-flex items-center gap-2 text-sm text-base-content/70">
              <MapPin className="h-4 w-4 text-[#00FF9D]" />
              <span>
                {t('experiences.ui.experienceDetails.locationLabel')}: {locationLabel}
              </span>
            </p>
          ) : null}

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-base-200/50 bg-base-100/25 p-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 text-base-content/80">
              <Users className="h-4 w-4 text-[#00FF9D]" />
              {t('experiences.ui.experienceDetails.maxCapacityLabel', { count: maxCapacity })}
            </span>
            <span className="inline-flex items-center gap-1.5 text-base-content/80">
              <Bath className="h-4 w-4 text-[#00FF9D]" />
              {hasPrivateBathroom
                ? t('experiences.ui.experienceDetails.privateBathroomYes')
                : t('experiences.ui.experienceDetails.privateBathroomNo')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-base-content/80">
              {hasWifi ? (
                <Wifi className="h-4 w-4 text-[#00FF9D]" />
              ) : (
                <WifiOff className="h-4 w-4 text-base-content/60" />
              )}
              {hasWifi
                ? t('experiences.ui.experienceDetails.wifiYes')
                : t('experiences.ui.experienceDetails.wifiNo')}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-sm w-full border-0 bg-[#00F08F] font-extrabold text-slate-950 shadow-[0_0_20px_rgba(0,240,143,0.28)] transition-all duration-200 hover:bg-[#00D47E] hover:brightness-105 active:scale-[0.98] active:brightness-95"
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
