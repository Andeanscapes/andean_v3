/**
 * Regression: the booking CTA was `href="./booking"`. Without `trailingSlash`
 * that resolves to `/experiences/booking` (404), not the experience's booking page.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, MOCK_EXPERIENCE_DATA } from '@/test/test-utils';
import esMessages from '@/i18n/messages/es.json';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/experiences/chivor-emerald-mine-tour',
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import Faqs from './Faqs';

describe('Faqs', () => {
  it('links the booking CTA to this experience’s booking page', () => {
    render(<Faqs experienceData={MOCK_EXPERIENCE_DATA} />);
    const cta = screen.getByRole('link', {
      name: new RegExp(esMessages.experiences.ui.experienceDetails.checkDatesBtn),
    });
    expect(cta).toHaveAttribute('href', '/experiences/chivor-emerald-mine-tour/booking');
  });
});
