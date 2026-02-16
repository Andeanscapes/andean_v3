import { afterEach, describe, expect, it, vi } from 'vitest'

import { trackLandingActionToBook, trackMetaCustomEvent } from './meta-pixel'

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
