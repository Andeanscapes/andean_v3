import {cleanup, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import BackToTop from './BackToTop'

describe('BackToTop', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.restoreAllMocks()

    Object.defineProperty(window, 'scrollTo', {
      writable: true,
      value: vi.fn()
    })
  })

  it('renders a button', () => {
    render(<BackToTop />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('scrolls to top on click', async () => {
    const user = userEvent.setup()
    render(<BackToTop />)

    await user.click(screen.getByRole('button'))

    expect(window.scrollTo).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).toHaveBeenCalledWith({top: 0, behavior: 'smooth'})
  })
})
