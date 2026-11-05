import { describe, expect, it } from 'vitest';
import { stripPaymentReturnParams } from './paymentReturn';

describe('stripPaymentReturnParams', () => {
  it('removes our reference and Mercado Pago return parameters, keeping the booking selections', () => {
    const href =
      'https://andeanscapes.com/es/experiences/tour/booking?tier=heritage&date=nov-28-2026&ref=abc&payment_id=1&collection_status=approved&status=approved&external_reference=abc&preference_id=p&site_id=MCO';

    expect(stripPaymentReturnParams(href)).toBe('/es/experiences/tour/booking?tier=heritage&date=nov-28-2026');
  });

  it('returns the bare path when only payment parameters were present', () => {
    expect(stripPaymentReturnParams('https://andeanscapes.com/experiences/tour/booking?ref=abc#top')).toBe(
      '/experiences/tour/booking#top',
    );
  });
});
