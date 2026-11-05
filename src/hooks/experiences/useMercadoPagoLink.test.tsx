import { act, renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import esMessages from '@/i18n/messages/es.json';
import type { ReservationState } from '@/lib/schemas';

const apiCallMock = vi.fn();
vi.mock('@/lib/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-client')>();
  return { ...actual, apiCall: (...args: unknown[]) => apiCallMock(...args) };
});

import { APIError } from '@/lib/api-client';
import { useMercadoPagoLink } from './useMercadoPagoLink';

const CHECKOUT = {
  url: 'https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=1',
  reference: '3f2c1d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
};

const RESERVATION = {
  selectedTierId: 'heritage',
  selectedDateId: 'nov-28-2026',
  roomSelections: [{ roomMode: 'standard_single', quantity: 1 }],
  transportMode: 'car_no_4x4',
  contact: { name: 'Ana Test', phone: '+57 300 000 0000', email: '' },
  termsAccepted: true,
} as unknown as ReservationState;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="es" messages={esMessages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}

function fakeTab() {
  return { closed: false, opener: {} as unknown, location: { href: '' }, close: vi.fn() };
}

describe('useMercadoPagoLink', () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    openSpy = vi.spyOn(window, 'open');
  });

  afterEach(() => {
    openSpy.mockRestore();
    apiCallMock.mockReset();
  });

  it('opens the tab before the request and sends it to checkout', async () => {
    const tab = fakeTab();
    openSpy.mockReturnValue(tab as unknown as ReturnType<typeof window.open>);
    apiCallMock.mockImplementation(async () => {
      // The tab must already exist when the request starts (popup blockers).
      expect(openSpy).toHaveBeenCalledWith('', '_blank');
      return CHECKOUT;
    });
    const onStarted = vi.fn();

    const { result } = renderHook(() => useMercadoPagoLink('chivorEmeraldCore', onStarted), { wrapper });
    await act(() => result.current.createLink(RESERVATION));

    expect(tab.location.href).toBe(CHECKOUT.url);
    expect(tab.opener).toBeNull();
    expect(onStarted).toHaveBeenCalledWith(CHECKOUT);
    expect(result.current.loading).toBe(false);
  });

  it('closes the tab and shows the translated error when checkout fails', async () => {
    const tab = fakeTab();
    openSpy.mockReturnValue(tab as unknown as ReturnType<typeof window.open>);
    apiCallMock.mockRejectedValue(new APIError(409, 'unavailable', 'Conflict'));
    const onStarted = vi.fn();

    const { result } = renderHook(() => useMercadoPagoLink('chivorEmeraldCore', onStarted), { wrapper });
    await act(() => result.current.createLink(RESERVATION));

    expect(tab.close).toHaveBeenCalled();
    expect(onStarted).not.toHaveBeenCalled();
    expect(result.current.error).toBe(esMessages.experiences.ui.paymentUnavailableError);
  });

  it('does not report a started checkout when the popup is blocked', async () => {
    openSpy.mockReturnValue(null);
    apiCallMock.mockResolvedValue(CHECKOUT);
    const onStarted = vi.fn();

    // jsdom cannot navigate: stub location so the same-tab fallback can assign it.
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '' } });

    const { result } = renderHook(() => useMercadoPagoLink('chivorEmeraldCore', onStarted), { wrapper });
    await act(() => result.current.createLink(RESERVATION));

    expect(window.location.href).toBe(CHECKOUT.url);
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });

    expect(onStarted).not.toHaveBeenCalled();
  });
});
