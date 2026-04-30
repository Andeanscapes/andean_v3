import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LandingHeroBrandSearch from './LandingHeroBrandSearch';
import { HERO_BRAND_FIXTURE } from './__fixtures__/heroBrandFixture';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

describe('LandingHeroBrandSearch', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });
  afterEach(() => cleanup());

  it('renders three labeled select fields and a submit button', () => {
    render(<LandingHeroBrandSearch search={HERO_BRAND_FIXTURE.search} />);

    expect(screen.getByLabelText(HERO_BRAND_FIXTURE.search.destinationLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(HERO_BRAND_FIXTURE.search.experienceTypeLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(HERO_BRAND_FIXTURE.search.durationLabel)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: HERO_BRAND_FIXTURE.search.submitLabel }),
    ).toBeInTheDocument();
  });

  it('submits with empty params when only "all" defaults are selected', async () => {
    const user = userEvent.setup();
    // Override fixture so all defaults are "all"
    const search = {
      ...HERO_BRAND_FIXTURE.search,
      destinations: [{ value: 'all', label: 'All' }, ...HERO_BRAND_FIXTURE.search.destinations],
    };
    render(<LandingHeroBrandSearch search={search} />);

    await user.click(screen.getByRole('button', { name: search.submitLabel }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(search.submitHref);
  });

  it('builds query string from non-"all" defaults', async () => {
    const user = userEvent.setup();
    // First option of each select is non-"all" in fixture (destination=chivor-boyaca, type=all, duration=all)
    render(<LandingHeroBrandSearch search={HERO_BRAND_FIXTURE.search} />);

    await user.click(
      screen.getByRole('button', { name: HERO_BRAND_FIXTURE.search.submitLabel }),
    );

    expect(pushMock).toHaveBeenCalledTimes(1);
    const url = pushMock.mock.calls[0][0] as string;
    expect(url).toContain(HERO_BRAND_FIXTURE.search.submitHref);
    expect(url).toContain('destination=chivor-boyaca');
    expect(url).not.toContain('type=');
    expect(url).not.toContain('duration=');
  });

  it('exposes the form with an aria-label matching submit label', () => {
    render(<LandingHeroBrandSearch search={HERO_BRAND_FIXTURE.search} />);
    expect(
      screen.getByRole('form', { name: HERO_BRAND_FIXTURE.search.submitLabel }),
    ).toBeInTheDocument();
  });
});
