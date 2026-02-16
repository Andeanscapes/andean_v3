import { afterEach, describe, expect, it, vi } from 'vitest'

import { trackBookingCtaClick, trackLandingActionToBook, trackMetaCustomEvent } from './meta-pixel'

type FbqWindow = {
  fbq?: (...args: unknown[]) => void
}

describe('trackMetaCustomEvent', () => {
  afterEach(() => {
    delete (globalThis as typeof globalThis & FbqWindow).fbq
  })

  it('calls fbq trackCustom when available', () => {
    const fbq = vi.fn()
    ;(globalThis as typeof globalThis & FbqWindow).fbq = fbq

    trackMetaCustomEvent('AirbnbClick', { placement: 'hero' })

    expect(fbq).toHaveBeenCalledTimes(1)
    expect(fbq).toHaveBeenCalledWith('trackCustom', 'AirbnbClick', {
      placement: 'hero'
    })
  })

  it('does not throw when fbq is missing', () => {
    expect(() =>
      trackMetaCustomEvent('AirbnbClick', { placement: 'hero' })
    ).not.toThrow()
  })

  it('tracks LandingActionToBook helper event', () => {
    const fbq = vi.fn()
    ;(globalThis as typeof globalThis & FbqWindow).fbq = fbq

    trackLandingActionToBook('whatsapp', 'booking_cta')

    expect(fbq).toHaveBeenCalledTimes(1)
    expect(fbq).toHaveBeenCalledWith('trackCustom', 'LandingActionToBook', {
      action: 'whatsapp',
      placement: 'booking_cta'
    })
  })
})

describe('trackBookingCtaClick', () => {
  afterEach(() => {
    delete (globalThis as typeof globalThis & FbqWindow).fbq
  })

  it('tracks both legacy AirbnbClick and normalized LandingActionToBook events', () => {
    const fbq = vi.fn()
    ;(globalThis as typeof globalThis & FbqWindow).fbq = fbq

    trackBookingCtaClick('airbnb', 'booking_cta')

    expect(fbq).toHaveBeenCalledTimes(2)
    expect(fbq).toHaveBeenNthCalledWith(1, 'trackCustom', 'AirbnbClick', {
      placement: 'booking_cta'
    })
    expect(fbq).toHaveBeenNthCalledWith(2, 'trackCustom', 'LandingActionToBook', {
      action: 'airbnb',
      placement: 'booking_cta'
    })
  })

  it('tracks both legacy WhatsAppClick and normalized LandingActionToBook events', () => {
    const fbq = vi.fn()
    ;(globalThis as typeof globalThis & FbqWindow).fbq = fbq

    trackBookingCtaClick('whatsapp', 'footer')

    expect(fbq).toHaveBeenCalledTimes(2)
    expect(fbq).toHaveBeenNthCalledWith(1, 'trackCustom', 'WhatsAppClick', {
      placement: 'footer'
    })
    expect(fbq).toHaveBeenNthCalledWith(2, 'trackCustom', 'LandingActionToBook', {
      action: 'whatsapp',
      placement: 'footer'
    })
  })

  it('uses correct placement in both events', () => {
    const fbq = vi.fn()
    ;(globalThis as typeof globalThis & FbqWindow).fbq = fbq

    trackBookingCtaClick('airbnb', 'header_desktop')

    expect(fbq).toHaveBeenCalledTimes(2)
    // Verify placement is consistent in both calls
    const calls = fbq.mock.calls
    expect(calls[0][2]).toHaveProperty('placement', 'header_desktop')
    expect(calls[1][2]).toHaveProperty('placement', 'header_desktop')
  })

  it('does not throw when fbq is missing', () => {
    expect(() =>
      trackBookingCtaClick('airbnb', 'booking_cta')
    ).not.toThrow()
  })
})
