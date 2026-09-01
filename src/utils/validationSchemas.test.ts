/**
 * Regression tests for reservation validation.
 *
 * Guards two defects that let the UI accept a reservation the schema then
 * rejected at the final step:
 *
 *  1. `transportMode` re-listed three modes by hand and omitted
 *     `roundtrip_transfer`, which `TransportModeSchema` allows and the booking UI
 *     offers. Transfer bookings could not be submitted at all.
 *  2. `peopleCount` was capped at a hardcoded 10 regardless of the capacity the
 *     feed publishes.
 */

import { describe, it, expect } from 'vitest';
import { buildReservationSchema, resolveReservationError } from './validationSchemas';
import { TransportModeSchema } from '@/lib/schemas/experience.schema';
import enMessages from '@/i18n/messages/en.json';
import esMessages from '@/i18n/messages/es.json';
import frMessages from '@/i18n/messages/fr.json';

const VALID = {
  selectedDateId: 'sep-2026',
  peopleCount: 2,
  roomSelections: [{ roomMode: 'standard_couple' as const, quantity: 1 }],
  transportMode: 'have_4x4' as const,
  contact: { name: 'Ada Lovelace', phone: '+57 3124815443', email: 'ada@example.com' },
  termsAccepted: true,
};

describe('buildReservationSchema', () => {
  it('accepts every transport mode the feed can publish', () => {
    // Iterates the enum rather than a hand-written list, so a new mode is
    // covered automatically instead of silently unvalidated.
    for (const mode of TransportModeSchema.options) {
      const result = buildReservationSchema().safeParse({ ...VALID, transportMode: mode });
      expect(result.success, `transport mode "${mode}" rejected`).toBe(true);
    }
  });

  it('accepts roundtrip_transfer specifically', () => {
    // The mode that was unbookable.
    expect(
      buildReservationSchema().safeParse({ ...VALID, transportMode: 'roundtrip_transfer' }).success,
    ).toBe(true);
  });

  it('rejects a transport mode outside the enum', () => {
    expect(buildReservationSchema().safeParse({ ...VALID, transportMode: 'teleport' }).success).toBe(
      false,
    );
  });

  it('honours the published capacity instead of a hardcoded limit', () => {
    const schema = buildReservationSchema({ minPeople: 2, maxPeople: 14 });

    expect(schema.safeParse({ ...VALID, peopleCount: 14 }).success).toBe(true);
    expect(schema.safeParse({ ...VALID, peopleCount: 15 }).success).toBe(false);
    expect(schema.safeParse({ ...VALID, peopleCount: 1 }).success).toBe(false);
  });

  it('accepts every room mode the feed can publish', () => {
    const schema = buildReservationSchema();

    for (const mode of ['standard_single', 'family_3', 'cabin_6'] as const) {
      expect(
        schema.safeParse({ ...VALID, roomSelections: [{ roomMode: mode, quantity: 1 }] }).success,
        `room mode "${mode}" rejected`,
      ).toBe(true);
    }
  });

  it('still requires a date, a room, and accepted terms', () => {
    const schema = buildReservationSchema();

    expect(schema.safeParse({ ...VALID, selectedDateId: '' }).success).toBe(false);
    expect(schema.safeParse({ ...VALID, roomSelections: [] }).success).toBe(false);
    expect(schema.safeParse({ ...VALID, termsAccepted: false }).success).toBe(false);
  });

  it('accepts a reservation with no email', () => {
    const schema = buildReservationSchema();

    expect(
      schema.safeParse({ ...VALID, contact: { ...VALID.contact, email: '' } }).success,
    ).toBe(true);
  });
});

describe('resolveReservationError', () => {
  /** Stands in for a translator scoped to `experiences.ui`. */
  function translator(messages: typeof enMessages) {
    return (key: string, values?: Record<string, string | number>) => {
      const resolved = key
        .split('.')
        .reduce<unknown>(
          (node, part) =>
            node && typeof node === 'object' && part in node
              ? (node as Record<string, unknown>)[part]
              : undefined,
          messages.experiences.ui,
        );
      if (typeof resolved !== 'string') throw new Error(`missing key: ${key}`);
      return values ? `${resolved}|${JSON.stringify(values)}` : resolved;
    };
  }

  const bounds = { minPeople: 1, maxPeople: 10 };

  function failure(overrides: Record<string, unknown>) {
    try {
      buildReservationSchema(bounds).parse({ ...VALID, ...overrides });
    } catch (err) {
      return err;
    }
    throw new Error('expected the payload to fail validation');
  }

  it('never surfaces the raw ZodError message', () => {
    // `ZodError.message` is a JSON dump of every issue; the booking UI used to
    // render it straight into the error banner.
    const err = failure({ selectedDateId: '' });

    expect((err as Error).message).toContain('too_small');
    expect(resolveReservationError(err, translator(enMessages), bounds)).not.toContain('too_small');
  });

  it('resolves every message key in en/es/fr', () => {
    const cases = [
      { selectedDateId: '' },
      { roomSelections: [] },
      { transportMode: 'teleport' },
      { termsAccepted: false },
      { contact: { ...VALID.contact, name: 'x' } },
      { contact: { ...VALID.contact, phone: '123' } },
      { peopleCount: 99 },
    ];

    for (const [label, messages] of Object.entries({
      en: enMessages,
      es: esMessages,
      fr: frMessages,
    })) {
      for (const override of cases) {
        const message = resolveReservationError(failure(override), translator(messages), bounds);
        expect(message, `${label}: ${JSON.stringify(override)}`).toBeTruthy();
        // A key leaking through means the message was never translated.
        expect(message).not.toMatch(/^validation\./);
      }
    }
  });

  it('passes the capacity bounds to the message', () => {
    const message = resolveReservationError(
      failure({ peopleCount: 99 }),
      translator(enMessages),
      { minPeople: 2, maxPeople: 14 },
    );

    expect(message).toContain('"max":14');
  });
});
