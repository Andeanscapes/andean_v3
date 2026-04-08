'use client';

import type { ReactNode } from 'react';
import type { ExperienceData } from '@/lib/schemas';

interface ItineraryProps {
  className?: string;
  experienceData: ExperienceData;
  sidebar?: ReactNode;
}

export default function Itinerary({ className = '', experienceData, sidebar }: ItineraryProps) {
  const itineraryContent = experienceData.itineraryContent;

  if (!itineraryContent?.stops || itineraryContent.stops.length === 0) return null;

  return (
    <section className={`relative px-4 py-10 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}>
      <div className="relative mx-auto max-w-screen-2xl">
        <h2 className="mb-8 text-2xl font-bold leading-tight text-base-content md:text-3xl">
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
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-md">
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
                              <p className="mt-3 text-sm text-base-content/70">{stop.description}</p>
                            ) : null}

                            {stop.notes && stop.notes.length > 0 ? (
                              <ul className="mt-3 space-y-1.5">
                                {stop.notes.map((note) => (
                                  <li key={note} className="flex items-start gap-2 text-xs text-base-content/80">
                                    <span className="mt-0.5 flex-shrink-0 text-primary">•</span>
                                    <span>{note}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>

                          {/* Image pane */}
                          <div className="h-48 md:h-full md:min-h-[250px]">
                            <img
                              src={stop.imageUrl}
                              alt={stop.title}
                              className="h-full w-full object-cover md:rounded-r-2xl"
                              loading="lazy"
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
                            <p className="mt-3 text-sm text-base-content/70">{stop.description}</p>
                          ) : null}

                          {stop.notes && stop.notes.length > 0 ? (
                            <ul className="mt-3 space-y-1.5">
                              {stop.notes.map((note) => (
                                <li key={note} className="flex items-start gap-2 text-xs text-base-content/80">
                                  <span className="mt-0.5 flex-shrink-0 text-primary">•</span>
                                  <span>{note}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      )}
                    </div>
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
    </section>
  );
}

