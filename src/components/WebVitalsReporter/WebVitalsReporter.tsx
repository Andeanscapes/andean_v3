'use client';

import { useReportWebVitals } from 'next/web-vitals';

type WebVitalsMetric = {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  id: string;
};

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const payload: WebVitalsMetric = {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    };

    const endpoint = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT;
    if (!endpoint || typeof navigator === 'undefined') return;

    const body = JSON.stringify(payload);

    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(endpoint, body);
      return;
    }

    void fetch(endpoint, {
      method: 'POST',
      body,
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  return null;
}
