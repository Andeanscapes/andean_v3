import {cleanup, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {ReactNode} from 'react'
import {afterEach, describe, expect, it, vi} from 'vitest'

import BookingCtas from './BookingCtas'

const translations: Record<string, string> = {
  title: 'Booking title',
  subtitle: 'Booking subtitle',
  airbnbCta: 'Airbnb CTA',
  reviewsLabel: 'reviews',
  airbnbSupport: 'Airbnb support',
  trustPolicy: 'Trust policy',
  bookingScopeNote: 'Scope note',
  whatsappHelpText: 'WhatsApp help',
  whatsappCta: 'WhatsApp CTA',
  whatsappSupport: 'WhatsApp support',
  stickyWhatsappText: 'Sticky WhatsApp'
}

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => translations[key] ?? key
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {href: string; children: ReactNode} & Omit<JSX.IntrinsicElements['a'], 'href'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

describe('BookingCtas', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders i18n defaults', () => {
    render(<BookingCtas enableStickyCta={false} />)

    expect(screen.getByRole('heading', {name: 'Booking title'})).toBeInTheDocument()
    expect(screen.getByText('Booking subtitle')).toBeInTheDocument()
    expect(screen.getByText('Airbnb support')).toBeInTheDocument()
    expect(screen.getByText('Trust policy')).toBeInTheDocument()
    expect(screen.getByText('Scope note')).toBeInTheDocument()
  })

  it('prefers title/subtitle props over i18n defaults', () => {
    render(
      <BookingCtas
        enableStickyCta={false}
        title="Custom title"
        subtitle="Custom subtitle"
      />
    )

    expect(screen.getByRole('heading', {name: 'Custom title'})).toBeInTheDocument()
    expect(screen.getByText('Custom subtitle')).toBeInTheDocument()
  })

  it('shows rating only when both rating and reviews are provided', () => {
    const {rerender} = render(
      <BookingCtas enableStickyCta={false} airbnbRating={4.9} airbnbReviewsCount={123} />
    )
    expect(screen.getByText('⭐ 4.9 · 123+ reviews')).toBeInTheDocument()

    rerender(<BookingCtas enableStickyCta={false} airbnbRating={4.9} />)
    expect(screen.queryByText('⭐ 4.9 · 123+ reviews')).not.toBeInTheDocument()
  })

  it('wires links and click callbacks', async () => {
    const user = userEvent.setup()
    const onAirbnbClick = vi.fn()
    const onWhatsAppClick = vi.fn()

    render(
      <BookingCtas
        enableStickyCta={false}
        onAirbnbClick={onAirbnbClick}
        onWhatsAppClick={onWhatsAppClick}
      />
    )

    const airbnbLink = screen.getByRole('link', {name: 'Airbnb CTA'})
    const whatsappLink = screen.getByRole('link', {name: 'WhatsApp CTA'})

    expect(airbnbLink).toHaveAttribute('href')
    expect(airbnbLink).toHaveAttribute('target', '_blank')
    expect(whatsappLink).toHaveAttribute('href')
    expect(whatsappLink).toHaveAttribute('target', '_blank')

    await user.click(airbnbLink)
    await user.click(whatsappLink)

    expect(onAirbnbClick).toHaveBeenCalledTimes(1)
    expect(onWhatsAppClick).toHaveBeenCalledTimes(1)
  })

  it('renders sticky CTA by default via portal', async () => {
    render(<BookingCtas />)

    const airbnbLinks = await screen.findAllByRole('link', {name: 'Airbnb CTA'})
    expect(airbnbLinks.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('link', {name: 'Sticky WhatsApp'})).toBeInTheDocument()
  })

  it('does not render sticky CTA when disabled', () => {
    render(<BookingCtas enableStickyCta={false} />)

    expect(screen.queryByRole('link', {name: 'Sticky WhatsApp'})).not.toBeInTheDocument()
  })
})
