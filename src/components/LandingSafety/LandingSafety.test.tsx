import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTranslator } from 'next-intl';
import en from '@/i18n/messages/en.json';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => createTranslator({ locale: 'en', messages: en })),
}));

import LandingSafety from './LandingSafety';
import { SAFETY_FIXTURE } from './__fixtures__/safetyFixture';
import { getLandingDataSSR } from '@/lib/services/landing.service';
import { LANDING_FIXTURE, cloneFixture } from '@/test/fixtures';

describe('LandingSafety', () => {
  afterEach(() => cleanup());

  it('renders heading and lead', () => {
    render(<LandingSafety safety={SAFETY_FIXTURE} />);
    const heading = screen.getByRole('heading', { level: 2, name: SAFETY_FIXTURE.sectionTitle });
    expect(heading.id).toBe('landing-safety-title');
    expect(screen.getByText(SAFETY_FIXTURE.lead)).toBeInTheDocument();
  });

  it('renders one list item per safety item', () => {
    render(<LandingSafety safety={SAFETY_FIXTURE} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(SAFETY_FIXTURE.items.length);
    for (const item of SAFETY_FIXTURE.items) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(
      <LandingSafety safety={{ ...SAFETY_FIXTURE, items: [] }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

/**
 * Pre-launch: the protocol page does not exist yet, so the link stays a real
 * link but announces "coming soon" instead of navigating.
 */
describe('LandingSafety protocol link', () => {
  beforeEach(() => {
    process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/services';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => cloneFixture(LANDING_FIXTURE) }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.REMOTE_DATA_BASE_URL;
  });

  it('blocks navigation and announces coming soon', async () => {
    const { safety } = await getLandingDataSSR('en');
    render(<LandingSafety safety={safety} />);
    const link = screen.getByRole('link', { name: en.Landing.brand.safety.protocolLink });

    expect(fireEvent.click(link)).toBe(false);
    expect(screen.getByRole('status').textContent).toBe(en.Landing.brand.safety.protocolComingSoon);
  });

  it('hides the notice after the timeout', async () => {
    const { safety } = await getLandingDataSSR('en');
    vi.useFakeTimers();
    render(<LandingSafety safety={safety} />);
    fireEvent.click(screen.getByRole('link', { name: en.Landing.brand.safety.protocolLink }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('status').textContent).toBe('');
  });
});
