'use client';

import { memo, type ReactNode } from 'react';
import type { ExperienceData } from '@/lib/schemas';
import { useThemeContext } from '@/contexts/ThemeContext';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';

interface ItineraryProps {
  className?: string;
  experienceData: ExperienceData;
  sidebar?: ReactNode;
}

function ItineraryComponent({ className = '', experienceData, sidebar }: ItineraryProps) {
  const itineraryContent = experienceData.itineraryContent;
  const { theme } = useThemeContext();

  const timelineCardClass =
    theme === 'light'
      ? 'rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]'
      : 'rounded-2xl shadow-sm';
  const timelineCardVariant = theme === 'light' ? 'light' : 'dark';

  if (!itineraryContent?.stops || itineraryContent.stops.length === 0) return null;

  return (
    <SectionContainer sectionClassName={`relative px-4 py-12 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}>
      <div className="relative">
        <h2 className="mb-8 text-3xl font-bold leading-tight text-base-content md:text-5xl lg:text-6xl">
          {itineraryContent.sectionTitle}
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: timeline */}
          <div className="w-full">
            {/* Single-column timeline container */}
            <div className="relative ml-0 md:ml-12">
              <div className="space-y-6">
                {itineraryContent.stops.map((stop, index) => {
                  const isLast = index === itineraryContent.stops.length - 1;
                  return (
                  <div key={stop.id} className="relative ml-8 min-[380px]:ml-10 md:ml-16">
                    {/* Timeline dot on the vertical line */}
                    <div
                      aria-hidden="true"
                      className="absolute -left-[calc(2rem+6px)] top-5 h-3 w-3 rounded-full bg-primary ring-2 ring-base-100 min-[380px]:-left-[calc(2.5rem+6px)] md:-left-[calc(4rem+6px)]"
                    />

                    {/* Vertical line segment below dot — omitted for last stop */}
                    {!isLast && (
                      <div
                        aria-hidden="true"
                        className="absolute -left-[calc(2rem+1px)] top-[calc(1.25rem+6px)] w-[2px] bg-primary/20 min-[380px]:-left-[calc(2.5rem+1px)] md:-left-[calc(4rem+1px)]"
                        style={{ height: 'calc(100% + 1.5rem)' }}
                      />
                    )}

                    {/* Card */}
                    <GlassCard
                      variant={timelineCardVariant}
                      hoverEffect
                      className={`${timelineCardClass} group overflow-hidden transition-all duration-200`}
                    >
                      {stop.imageUrl ? (
                        /* Desktop: side-by-side grid | Mobile: stacked */
                        <div className="flex flex-col md:grid md:grid-cols-[1.2fr_1fr]">
                          {/* Text pane */}
                          <div className="p-5 md:p-8">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500 ring-1 ring-emerald-500/30">
                                {stop.time}
                              </span>
                              <h3 className="text-xl font-semibold text-base-content">{stop.title}</h3>
                            </div>

                            {stop.description ? (
                              <p className="mt-3 text-sm font-medium text-base-content/70">{stop.description}</p>
                            ) : null}

                            {stop.notes && stop.notes.length > 0 ? (
                              <ul className="mt-3 space-y-1.5">
                                {stop.notes.map((note) => (
                                  <li key={note} className="flex items-start gap-2 text-xs font-medium text-base-content/80">
                                    <span className="mt-0.5 flex-shrink-0 text-primary">•</span>
                                    <span>{note}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>

                          {/* Image pane */}
                          <div className="aspect-[4/3] overflow-hidden md:aspect-auto md:h-full md:min-h-[250px]">
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
                        /* No image: simple padded layout */
                        <div className="p-5 md:p-8">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500 ring-1 ring-emerald-500/30">
                              {stop.time}
                            </span>
                            <h3 className="text-xl font-semibold text-base-content">{stop.title}</h3>
                          </div>

                          {stop.description ? (
                            <p className="mt-3 text-sm font-medium text-base-content/70">{stop.description}</p>
                          ) : null}

                          {stop.notes && stop.notes.length > 0 ? (
                            <ul className="mt-3 space-y-1.5">
                              {stop.notes.map((note) => (
                                <li key={note} className="flex items-start gap-2 text-xs font-medium text-base-content/80">
                                  <span className="mt-0.5 flex-shrink-0 text-primary">•</span>
                                  <span>{note}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      )}
                    </GlassCard>
                  </div>
                  );
                })}
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

