'use client';

import type { ExperienceData } from '@/lib/schemas';
import type { CSSProperties } from 'react';

interface ItineraryProps {
  className?: string;
  experienceData: ExperienceData;
}

// Helper to convert time string to minutes (e.g., "11:00 AM" -> 660)
function timeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  const isAM = period === 'AM';

  let totalMinutes = hours * 60 + minutes;
  if (!isAM && hours !== 12) {
    totalMinutes += 12 * 60; // Convert PM to 24-hour format
  }
  if (isAM && hours === 12) {
    totalMinutes -= 12 * 60; // Midnight edge case
  }

  return totalMinutes;
}

export default function Itinerary({ className = '', experienceData }: ItineraryProps) {
  const itineraryContent = experienceData.itineraryContent;

  if (!itineraryContent?.stops || itineraryContent.stops.length === 0) return null;

  // Calculate min/max times to establish range
  const times = itineraryContent.stops.map((stop) => timeToMinutes(stop.time));
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timeRange = maxTime - minTime || 1; // Avoid division by zero

  return (
    <section className={`relative px-4 py-10 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}>
      <div className="relative mx-auto max-w-screen-2xl">
        <h2 className="mb-8 text-2xl font-bold leading-tight text-base-content md:text-3xl">
          Interactive Itinerary
        </h2>

        {/* Timeline with left and right columns */}
        <div className="relative">
          {/* Central vertical line - positioned between columns */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-primary/30 lg:block"
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
            {itineraryContent.stops.map((stop, index) => {
              const isLeft = index % 2 === 0;
              const stopMinutes = timeToMinutes(stop.time);
              // Calculate vertical offset as percentage of total time range
              const offsetPercent = ((stopMinutes - minTime) / timeRange) * 100;
              // Convert to pixels (increased multiplier for more spread)
              const offsetPixels = offsetPercent * 2.5;

              return (
                <div
                  key={stop.id}
                  className={`relative lg:[margin-top:var(--desktop-offset)] ${isLeft ? 'lg:pr-8' : 'lg:pl-8'}`}
                  style={{
                    '--desktop-offset': index > 0 ? `${Math.min(120, offsetPixels * 0.8)}px` : '0px',
                  } as CSSProperties}
                >
                  {/* Timeline dot - positioned on the line */}
                  <div
                    aria-hidden="true"
                    className={`absolute hidden h-3 w-3 rounded-full bg-primary ring-3 ring-base-100 lg:block ${
                      isLeft ? '-right-[18px]' : '-left-[18px]'
                    }`}
                    style={{
                      top: '20px',
                    }}
                  />

                  {/* Horizontal line from dot to card */}
                  <div
                    aria-hidden="true"
                    className={`absolute hidden h-px bg-primary/50 lg:block z-0 ${
                      isLeft ? 'lg:right-0' : 'lg:left-0'
                    }`}
                    style={{
                      top: '20px',
                      [isLeft ? 'right' : 'left']: isLeft ? '-18px' : '-18px',
                      width: '60px',
                      height: '1px',
                    }}
                  />

                  {/* Card */}
                  <div className="rounded-lg border border-base-content/10 bg-base-100 p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">{stop.time}</p>
                    <h3 className="mt-1 text-base font-semibold text-base-content md:text-lg">{stop.title}</h3>

                    {stop.description ? (
                      <p className="mt-2 text-xs text-base-content/70 md:text-sm">{stop.description}</p>
                    ) : null}

                    {/* Image if available */}
                    {stop.imageUrl ? (
                      <div className="mt-3 overflow-hidden rounded-md border border-base-content/5">
                        <img
                          src={stop.imageUrl}
                          alt={stop.title}
                          className="h-24 w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}

                    {/* Notes if available */}
                    {stop.notes && stop.notes.length > 0 ? (
                      <ul className="mt-3 space-y-1">
                        {stop.notes.map((note) => (
                          <li key={note} className="flex items-start gap-2 text-xs text-base-content/80">
                            <span className="mt-1 flex-shrink-0 text-primary">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

