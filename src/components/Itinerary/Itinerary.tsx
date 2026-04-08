'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';

interface ItineraryProps {
  className?: string;
}

interface ItineraryStop {
  id: string;
  time: string;
  title: string;
  imageUrl?: string;
  notes?: string[];
}

export default function Itinerary({ className = '' }: ItineraryProps) {
  const t = useTranslations();

  const stops: ItineraryStop[] = [
    {
      id: 'stop-1',
      time: '11:00 AM',
      title: 'Enter the Emerald Mine',
      imageUrl: '/assets/images/hero/h10.webp',
    },
    {
      id: 'stop-2',
      time: '12:30 PM',
      title: 'Enter the Nanth Mine',
      imageUrl: '/assets/images/hero/h11.webp',
    },
    {
      id: 'stop-3',
      time: '1:00 PM',
      title: 'Enter & Explore Next Mine',
      imageUrl: '/assets/images/hero/h8.webp',
    },
    {
      id: 'stop-4',
      time: '3:00 PM',
      title: 'Workshop & Group Wrap-up',
      notes: ['Basic fitness', 'Closed shoes', 'Small group setting', 'Cultural insights'],
    },
  ];

  return (
    <section className={`px-4 pb-10 md:px-6 lg:px-8 ${className}`.trim()}>
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-3xl font-semibold text-base-content">
          {t('experiences.ui.experienceDetails.itineraryTitle')}
        </h2>

        <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-base-300/70 lg:block"
          />

          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className={`relative ${index % 2 === 0 ? 'lg:pr-10' : 'lg:pl-10'} ${
                index % 2 === 0 ? 'lg:mr-auto' : 'lg:ml-auto'
              } w-full lg:max-w-[92%]`}
            >
              <span
                aria-hidden="true"
                className="absolute -right-1.5 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-emerald-400 ring-4 ring-base-100 lg:block"
              />

              <Card padding="sm" className="overflow-hidden border-white/15 bg-slate-900/60">
                {stop.imageUrl ? (
                  <div
                    className="h-40 w-full rounded-xl bg-cover bg-center"
                    style={{
                      backgroundImage:
                        `linear-gradient(to top, rgba(5, 10, 20, 0.7), rgba(5, 10, 20, 0.2)), url('${stop.imageUrl}')`,
                    }}
                  />
                ) : null}

                <div className="mt-3 px-1 pb-1">
                  <p className="text-xl font-semibold text-white">{stop.time}</p>
                  <p className="text-2xl font-semibold leading-tight text-white">{stop.title}</p>

                  {stop.notes?.length ? (
                    <ul className="mt-3 space-y-1">
                      {stop.notes.map((note) => (
                        <li key={note} className="text-lg text-emerald-100/90">
                          • {note}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
