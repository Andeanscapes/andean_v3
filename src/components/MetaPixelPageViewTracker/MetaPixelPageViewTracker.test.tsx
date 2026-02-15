import {cleanup, render} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import MetaPixelPageViewTracker from './MetaPixelPageViewTracker'

let mockPathname = '/en'
let mockSearch = ''
type FbqWindow = {
  fbq?: (...args: unknown[]) => void
}

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => ({
    toString: () => mockSearch
  })
}))

describe('MetaPixelPageViewTracker', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockPathname = '/en'
    mockSearch = ''
  })

  afterEach(() => {
    cleanup()
    delete (window as unknown as FbqWindow).fbq
  })

  it('tracks page view on mount when fbq is available', () => {
    const fbq = vi.fn()
    ;(window as unknown as FbqWindow).fbq = fbq

    render(<MetaPixelPageViewTracker />)

    expect(fbq).toHaveBeenCalledTimes(1)
    expect(fbq).toHaveBeenCalledWith('track', 'PageView')
  })

  it('does not throw or track when fbq is unavailable', () => {
    expect(() => render(<MetaPixelPageViewTracker />)).not.toThrow()
  })

  it('tracks again when route changes', () => {
    const fbq = vi.fn()
    ;(window as unknown as FbqWindow).fbq = fbq

    const {rerender} = render(<MetaPixelPageViewTracker />)
    expect(fbq).toHaveBeenCalledTimes(1)

    mockPathname = '/es'
    rerender(<MetaPixelPageViewTracker />)

    expect(fbq).toHaveBeenCalledTimes(2)
    expect(fbq).toHaveBeenNthCalledWith(2, 'track', 'PageView')
  })

  it('tracks again when query string changes', () => {
    const fbq = vi.fn()
    ;(window as unknown as FbqWindow).fbq = fbq

    const {rerender} = render(<MetaPixelPageViewTracker />)
    expect(fbq).toHaveBeenCalledTimes(1)

    mockSearch = 'utm_source=ads'
    rerender(<MetaPixelPageViewTracker />)

    expect(fbq).toHaveBeenCalledTimes(2)
    expect(fbq).toHaveBeenNthCalledWith(2, 'track', 'PageView')
  })
})
